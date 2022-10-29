import { Log, ILogAppender } from './log';

describe('Log', () => {
    const log = Log['log'];
    const getTime = Log['getTime'];
    const getLogEntry = Log['getLogEntry'];
    const consoleError = console.error;
    const consoleWarning = console.warn;
    const consoleInfo = console.info;
    const consoleLog = console.log;
    const message = 'Foo';
    const error = new Error('Bar');

    beforeEach(() => {
        Log['level'] = -1;
        spyOn(Log as any, 'log').and.callFake(() => { });
    });

    afterEach(() => {
        Log['log'] = log;
        Log['getTime'] = getTime;
        Log['getLogEntry'] = getLogEntry;
        console.error = consoleError;
        console.warn = consoleWarning;
        console.info = consoleInfo;
        console.log = consoleLog;
    });

    it('should handle trace', () => {
        expect(Log.isTrace()).toBe(false);
        Log.setTrace();
        expect(Log.isTrace()).toBe(true);

        Log.trace(message, error);
        expect(Log['log']).toHaveBeenCalledWith(Log.levelTrace, Log.levelTrace, message, error);
    });

    it('should handle debug', () => {
        expect(Log.isDebug()).toBe(false);
        Log.setDebug();
        expect(Log.isDebug()).toBe(true);

        Log.debug(message, error);
        expect(Log['log']).toHaveBeenCalledWith(Log.levelDebug, Log.levelDebug, message, error);
    });

    it('should handle info', () => {
        Log.info(message, error);
        expect(Log['log']).toHaveBeenCalledWith(Log.level, Log.levelInfo, message, error);
    });

    it('should handle warning', () => {
        Log.warning(message, error);
        expect(Log['log']).toHaveBeenCalledWith(Log.level, Log.levelWarning, message, error);
    });

    it('should handle error', () => {
        Log.error(message, error);
        expect(Log['log']).toHaveBeenCalledWith(Log.level, Log.levelError, message, error);
    });

    it('should handle fatal', () => {
        Log.fatal(message, error);
        expect(Log['log']).toHaveBeenCalledWith(Log.level, Log.levelFatal, message, error);
    });

    it('should set default', () => {
        Log.setDefault();
        expect(Log['level']).toBe(Log.levelInfo);
    });

    it('should return log entry', () => {
        const time = 'TIME';
        spyOn(Log as any, 'getTime').and.callFake(() => {
            return time;
        });

        expect(Log.getLogEntry(Log.levelFatal, message, error)).toContain(`[${time}] ${Log['prefixes'][0]} ${message} ${error.name}: ${error.message}`);
        const msg = 'Other message';
        const expectedMessage = msg + ' expected';
        const errorWithMessageInStack = new Error(expectedMessage);
        errorWithMessageInStack.stack = msg;
        expect(Log.getLogEntry(Log.levelFatal, message, errorWithMessageInStack)).toBe(`[${time}] ${Log['prefixes'][0]} ${message} ${expectedMessage} ${msg}`);

        const errorWithoutStack = new Error();
        errorWithoutStack.stack = undefined;
        expect(Log.getLogEntry(Log.levelFatal, message, errorWithoutStack)).toBe(`[${time}] ${Log['prefixes'][0]} ${message} ${error.name}`);
        errorWithoutStack.message = msg;
        expect(Log.getLogEntry(Log.levelFatal, message, errorWithoutStack)).toBe(`[${time}] ${Log['prefixes'][0]} ${message} ${msg}`);
    });

    it('should call log appender', () => {
        const appender: ILogAppender = jasmine.createSpy();

        Log.addAppender(appender);
        Log['log'] = log;
        Log['log'](Log.levelFatal, Log.levelDebug, message, error);
        Log['log'](Log.levelDebug, Log.levelFatal, message, error);

        Log.removeAppender(appender);
        Log['log'](Log.levelDebug, Log.levelFatal, message, error);

        expect(appender).toHaveBeenCalledWith(Log.levelFatal, message, error);
        expect(appender).toHaveBeenCalledTimes(1);
    });

    it('should call log', () => {
        const logEntry = 'LOGENTRY';
        Log['log'] = log;
        spyOn(Log, 'getLogEntry').and.callFake(() => logEntry);
        const mockFn = jasmine.createSpy().and.callFake(() => { });
        console.error = mockFn;
        console.warn = mockFn;
        console.info = mockFn;
        console.log = mockFn;

        Log['log'](Log.levelDebug, Log.levelFatal, message, error);
        Log['log'](Log.levelDebug, Log.levelWarning, message, error);
        Log['log'](Log.levelDebug, Log.levelInfo, message, error);
        Log['log'](Log.levelDebug, Log.levelDebug, message, error);
        expect(console.error).toHaveBeenCalledWith(logEntry);
        expect(console.error).toHaveBeenCalledTimes(4);
    });

    it('should get valid time string', () => {
        const dateString = '2022-08-14T' + Log['getTime']();
        expect(Date.parse(dateString)).toBeNaN();
        expect(Date.parse(dateString.replace(',', '.'))).toBeTruthy();
    });
});