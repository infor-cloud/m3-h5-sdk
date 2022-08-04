import { afterEach, beforeEach, describe, expect, it, jest } from '@jest/globals';
import { AsyncSubject, Observable, of, throwError } from 'rxjs';
import { IMIResponse, IMIService } from '../../mi/base';
import { IMIRequest } from '../../mi/types';
import { UserContext, UserServiceCore } from '../../m3/runtime';
import { HttpUtil } from '../../util';
import { IMessage, IUserContext } from '../../m3/types';

class MockMIService implements IMIService {
    execute(request: IMIRequest): Observable<IMIResponse> {
        throw new Error('Method not implemented.');
    }

    instance = {
        updateUserContext: (company: string, division: string): void => {
            throw new Error('Method not implemented.');
        },
    };

}

describe('UserServiceCore', () => {
    const mockService = new MockMIService();
    let userService: UserServiceCore;
    let isIframe;

    beforeEach(() => {
        // Function init will be called in constructor. To avoid this a mock is placed and removed after constructor call.
        jest.spyOn(UserServiceCore.prototype as any, 'init').mockImplementation(() => { });
        userService = new UserServiceCore(mockService);
        jest.restoreAllMocks();
        isIframe = HttpUtil.isIframe;
    });

    afterEach(() => {
        // restore the spy created with spyOn
        jest.restoreAllMocks();
        HttpUtil.isIframe = isIframe;
    });

    it('should initialize', (done) => {
        HttpUtil.isIframe = jest.fn().mockReturnValue(true) as (() => boolean);
        const spyLogDebug = jest.spyOn(userService as any, 'logDebug').mockImplementation((message) => {
            expect(message).toBe('Running in IFrame');
        });
        const spyRegisterMessage = jest.spyOn(userService as any, 'registerMessage').mockImplementation(() => { });
        jest.spyOn(userService as any, 'onTimeout').mockImplementation(() => {
            done();
        });
        const spySendMessage = jest.spyOn(userService as any, 'sendMessage').mockImplementation((message) => {
            expect(message).toStrictEqual({ m3Command: 'user' });
        });

        userService['init']();
        expect(spyLogDebug).toHaveBeenCalled();
        expect(spyRegisterMessage).toHaveBeenCalled();
        expect(spySendMessage).toHaveBeenCalled();
        expect(userService['isMessagePending']).toBe(true);
        expect(userService['isExecuting']).toBe(true);
    });

    it('should handle timeout', () => {
        const spyLogDebug = jest.spyOn(userService as any, 'logDebug').mockImplementation((message) => {
            expect(message).toBe('onTimeout: No user message from H5');
        });
        const spyLoadUserId = jest.spyOn(userService as any, 'loadUserId').mockImplementation(() => { });

        userService['isMessagePending'] = true;
        userService['queue'] = [{} as AsyncSubject<UserContext>];
        userService['onTimeout']();
        expect(spyLogDebug).toHaveBeenCalled();
        expect(spyLoadUserId).toHaveBeenCalled();
        expect(userService['isMessagePending']).toBe(false);
        expect(userService['isExecuting']).toBe(false);
    });

    it('should parse data', () => {
        const message: IMessage = { m3Command: 'foo' };
        const spyLogError = jest.spyOn(userService as any, 'logError').mockImplementation((message) => {
            expect(message).toBe('parseMessage: Failed to parse: "foo"');
        });

        expect(userService['parseMessage'](JSON.stringify(message))).toStrictEqual(message);
        expect(userService['parseMessage']('foo')).toBeNull();
        expect(spyLogError).toHaveBeenCalled();
    });

    it('should act on message', () => {
        const dataJson: IMessage = { m3Command: 'user', m3Response: { m3User: 'foo', principalUser: 'bar', userContext: { hello: 'user' } } }
        const data = JSON.stringify(dataJson);
        const userContext: IUserContext = { hasError: () => false };
        const spyLogDebug = jest.spyOn(userService as any, 'logDebug').mockImplementation((message) => {
            expect(message).toBe('onMessage: User message from H5');
        });
        const spyParseMessage = jest.spyOn(userService as any, 'parseMessage')
            .mockReturnValueOnce(null)
            .mockImplementation((message) => {
                expect(message).toBe(data);
                return dataJson;
            });
        const spyCreateUserContext = jest.spyOn(userService as any, 'createUserContext').mockImplementation((context) => {
            expect(context).toStrictEqual(dataJson.m3Response.userContext);
            return userContext;
        });
        const spySetContext = jest.spyOn(userService as any, 'setContext').mockImplementation((context) => {
            expect(context).toStrictEqual(userContext);
        });

        userService['onMessage']({});
        userService['onMessage'](data);
        userService['onMessage'](data);
        expect(spyLogDebug).toHaveBeenCalled();
        expect(spyParseMessage).toHaveBeenCalled();
        expect(spyCreateUserContext).toHaveBeenCalled();
        expect(spySetContext).toHaveBeenCalled();
        expect(userService['m3User']).toBe(dataJson.m3Response.m3User);
        expect(userService['principalUser']).toBe(dataJson.m3Response.principalUser);
        expect(userService['isMessagePending']).toBe(false);
        expect(UserServiceCore.isH5Host).toBe(true);
    });

    it('should register a message', (done) => {
        jest.spyOn(userService as any, 'onMessage').mockImplementation((context) => {
            expect(context).toBe('{"foo":"bar"}');
            done();
        });
        userService['registerMessage']();
        window.postMessage(JSON.stringify({ foo: 'bar' }), '*');
    });

    it('should send a message', () => {
        const dataJson: IMessage = { m3Command: 'user' };
        const data = JSON.stringify(dataJson);
        const spyPostMessage = jest.spyOn(parent, 'postMessage').mockImplementation((message, options) => {
            expect(message).toBe(data);
            expect(options).toBe('*');
        });

        userService['sendMessage'](dataJson);
        expect(spyPostMessage).toHaveBeenCalled();
    });

    it('should create error context', () => {
        const context = new UserContext() as IUserContext;
        context.errorMessage = 'this is an error';

        userService['createErrorContext'](context.errorMessage);
        expect(userService['userContext']).toStrictEqual(context);
    });

    it('should process queued items to resolve', (done) => {
        const userContext = { CONO: '100' } as IUserContext;
        const item = new AsyncSubject<UserContext>();
        item.subscribe((context) => {
            expect(context).toStrictEqual(userContext);
            expect(userService['queue'].length).toBe(0);
            expect(userService['isExecuting']).toBe(false);

            done();
        });
        userService['userContext'] = userContext;
        userService['queue'] = [item];

        userService['processQueue'](true);
    });

    it('should process queued items to error', (done) => {
        const userContext = { CONO: '200' } as IUserContext;
        const item = new AsyncSubject<UserContext>();
        item.subscribe({
            next: null!, error: (context) => {
                expect(context).toStrictEqual(userContext);
                done();
            }
        });
        userService['userContext'] = userContext;
        userService['queue'] = [item];

        userService['processQueue'](false);
    });

    it('should reject queue items', () => {
        const errorMessage = 'This is an error';
        const spyCreateErrorContext = jest.spyOn(userService as any, 'createErrorContext').mockImplementation((message) => {
            expect(message).toBe(errorMessage);
        });
        const spyProcessQueue = jest.spyOn(userService as any, 'processQueue').mockImplementation((param) => {
            expect(param).toBe(false);
        });

        userService['rejectQueue'](errorMessage);
        expect(spyCreateErrorContext).toHaveBeenCalled();
        expect(spyProcessQueue).toHaveBeenCalled();
    });

    it('should call to load a user', () => {
        const spyLoadUserData = jest.spyOn(userService as any, 'loadUserData').mockImplementation(() => { });

        userService['isExecuting'] = true;
        userService['loadUserId']();
        expect(userService['isExecuting']).toBe(true);

        userService['isExecuting'] = false;
        userService['loadUserId']();
        expect(spyLoadUserData).toHaveBeenCalledTimes(1);
    });

    it('should load user data', () => {
        const request: IMIRequest = { program: 'MNS150MI', transaction: 'GetUserData' };
        const response = { item: 'foo', errorMessage: 'failed' } as IMIResponse;
        jest.spyOn(userService['miService'], 'execute')
            .mockReturnValueOnce(of(response))
            .mockImplementation((req) => {
                expect(req).toStrictEqual(request);
                return throwError(() => response);
            });
        let onUserDataParam;
        const spyOnUserData = jest.spyOn(userService as any, 'onUserData').mockImplementation((param) => {
            onUserDataParam = param;
        });
        let rejectQueueParam;
        const spyRejectQueue = jest.spyOn(userService as any, 'rejectQueue').mockImplementation((param) => {
            rejectQueueParam = param;
        });

        userService['loadUserData']();
        userService['loadUserData']();
        expect(spyOnUserData).toHaveBeenCalled();
        expect(spyRejectQueue).toHaveBeenCalled();
        expect(onUserDataParam).toBe(response.item);
        expect(rejectQueueParam).toBe(response.errorMessage);
    });

    it('should add some aliases', () => {
        const userContextBefore = {
            USID: 'test',
            CONO: '100',
            DIVI: '200',
            LANC: 'GB',
            DTFM: 'YMD',
            DCFM: '.',
            FADT: '20220101',
            LADT: '20221231',
            Theme: 'azure',
            Tenant: 'TRN',
            IonApiUrl: 'http://cloud'
        } as unknown as IUserContext;
        const userContextAfter = {
            USID: 'test',
            m3User: 'test',
            M3User: 'test',
            CONO: '100',
            company: '100',
            Company: '100',
            currentCompany: '100',
            CurrentCompany: '100',
            DIVI: '200',
            division: '200',
            Division: '200',
            currentDivision: '200',
            CurrentDivision: '200',
            LANC: 'GB',
            language: 'GB',
            Language: 'GB',
            currentLanguage: 'GB',
            CurrentLanguage: 'GB',
            DTFM: 'YMD',
            dateFormat: 'yyMMdd',
            languageTag: 'en-US',
            DCFM: '.',
            numberFormatOptions: {
                separator: '.',
            },
            FADT: '20220101',
            LADT: '20221231',
            firstActiveDate: new Date(2022, 0, 1),
            lastActiveDate: new Date(2022, 11, 31),
            Theme: 'azure',
            theme: 'azure',
            Tenant: 'TRN',
            tenant: 'TRN',
            isMultiTenant: true,
            IonApiUrl: 'http://cloud',
            ionApiUrl: 'http://cloud',
        } as unknown as IUserContext;

        userService['addAliases'](userContextBefore);
        expect(userContextAfter).toStrictEqual(userContextBefore);
    });

    it('should set context and update dependent', () => {
        const userContext = {
            USID: 'test',
            principalUser: 'foo',
            CONO: '100',
            DIVI: '200',
            LANC: 'GB',
        } as IUserContext;
        const spyUpdateUserContext = jest.spyOn(userService['miService']['instance'], 'updateUserContext').mockImplementation((cono, divi) => {
            expect(cono).toBe(userContext.CONO);
            expect(divi).toBe(userContext.DIVI);
        });
        const spyLogInfo = jest.spyOn(userService as any, 'logInfo').mockImplementation((message) => {
            expect(message).toBe('setContext: Initialized user context for test 100/200');
        });

        userService['setContext'](userContext);
        expect(userService['userContext']).toStrictEqual(userContext);
        expect(spyUpdateUserContext).toHaveBeenCalled();
        expect(spyLogInfo).toHaveBeenCalled();
    })

    it('should build and set user context', () => {
        const item = { user: 'foo' };
        const userContext = { m3User: 'foo' } as IUserContext;
        const spyCreateUserContext = jest.spyOn(userService as any, 'createUserContext').mockImplementation((param) => {
            expect(param).toStrictEqual(item);
            return userContext;
        });
        const spySetContext = jest.spyOn(userService as any, 'setContext').mockImplementation((param) => {
            expect(param).toStrictEqual(userContext);
        });

        userService['onUserData'](item);
        expect(spyCreateUserContext).toHaveBeenCalled();
        expect(spySetContext).toHaveBeenCalled();
    });

    it('should return erroneous user context', (done) => {
        // TODO: isUserContextAvailable seems everytime true
        const userContext = { m3User: 'foo' } as IUserContext;
        userService['userContext'] = userContext;
        userService['isUserContextAvailable'] = false;
        const spyCreateErrorContext = jest.spyOn(userService as any, 'createErrorContext').mockImplementation(() => { });

        userService.getUserContext().subscribe({
            next: null!, error: (context) => {
                expect(context).toStrictEqual(userContext);
                done();
            }
        });
        expect(spyCreateErrorContext).toHaveBeenCalled();
    });

    it('should return user context', (done) => {
        const userContext = { m3User: 'foo' } as IUserContext;
        const spyPush = jest.spyOn(userService['queue'] as any, 'push').mockImplementation(() => { });
        const spyLoadUserId = jest.spyOn(userService as any, 'loadUserId').mockImplementation(() => { });

        userService.getUserContext();
        expect(spyPush).toHaveBeenCalled();
        expect(spyLoadUserId).toHaveBeenCalled();

        userService['userContext'] = userContext;
        userService.getUserContext().subscribe((context) => {
            expect(context).toStrictEqual(userContext);
            done();
        });
    });

    it('should update user context if no one is present', () => {
        const userContext = { m3User: 'foo' } as IUserContext;
        const spyCreateUserContext = jest.spyOn(userService as any, 'createUserContext').mockImplementation((context) => {
            expect(context).toStrictEqual(userContext);
            return userContext;
        });
        const spyAddAliases = jest.spyOn(userService as any, 'addAliases').mockImplementation((context) => {
            expect(context).toStrictEqual(userContext);
            (context as any)['CONO'] = '100';
        });
        const spyUpdateDependent = jest.spyOn(userService as any, 'updateDependent').mockImplementation((context) => {
            expect(context).toStrictEqual(userContext);
        });
        const spyLogDebug = jest.spyOn(userService as any, 'logDebug').mockImplementation((message) => {
            expect(message).toBe('setUserContext: Creating user context after logon');
        });

        userService.updateUserContext(userContext, 'bar');
        expect(spyCreateUserContext).toHaveBeenCalled();
        expect(spyAddAliases).toHaveBeenCalled();
        expect(spyUpdateDependent).toHaveBeenCalled();
        expect(spyLogDebug).toHaveBeenCalled();
        expect(userService['userContext']).toStrictEqual(userContext);
    });

    it('should update user context if there is already one', () => {
        const userContextBefore = { m3User: 'foo' } as IUserContext;
        const userContextAfter = { m3User: 'foo', ionApiUrl: 'http://cloud' } as IUserContext;
        const userContextParam = { ionApiUrl: userContextAfter.ionApiUrl } as IUserContext;
        userService['userContext'] = userContextBefore;
        const spyAddAliases = jest.spyOn(userService as any, 'addAliases').mockImplementation((context) => {
            expect(context).toStrictEqual(userContextParam);
            (context as any)['CONO'] = '100';
        });
        const spyUpdateDependent = jest.spyOn(userService as any, 'updateDependent').mockImplementation((context) => {
            expect(context).toStrictEqual(userContextAfter);
        });
        const spyLogDebug = jest.spyOn(userService as any, 'logDebug').mockImplementation((message) => {
            expect(message).toBe('setUserContext: Updating user context after logon');
        });

        userService.updateUserContext(userContextParam, 'bar');
        expect(spyAddAliases).toHaveBeenCalled();
        expect(spyUpdateDependent).toHaveBeenCalled();
        expect(spyLogDebug).toHaveBeenCalled();
        expect(userService['userContext']).toStrictEqual(userContextAfter);
    });

    it('should create user context object', () => {
        const item = { CONO: '100' };
        const userContext = new UserContext();
        expect(userService['createUserContext'](item)).toStrictEqual(Object.assign(userContext, item));
    });
})