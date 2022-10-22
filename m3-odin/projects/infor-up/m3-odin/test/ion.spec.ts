import { afterEach, describe, expect, it, jest } from '@jest/globals';
import { exec } from 'child_process';
import { AsyncSubject, Observable, of, throwError } from 'rxjs';
import { IFormResponse, ITranslationRequest, ITranslationResponse, IFormRequest } from '../form/base';
import { IBookmark, IEnvironmentContext, IFormService, ISearchRequest } from '../form/types';
import { IonApiServiceCore } from '../ion';
import { IHttpRequest, IHttpResponse, IHttpService, IIonApiContext, IIonApiOptions, IIonApiRequest, IIonApiResponse } from '../types';
import { CoreUtil, HttpUtil } from '../util';

class MockIHttpService implements IHttpService {
    execute(request: IHttpRequest): Observable<IHttpResponse> {
        throw new Error('Method not implemented.');
    }
}

class MockIFormService implements IFormService {
    executeBookmark(bookmark: IBookmark): Observable<IFormResponse> {
        throw new Error('Method not implemented.');
    }
    executeSearch(request: ISearchRequest): Observable<IFormResponse> {
        throw new Error('Method not implemented.');
    }
    translate(request: ITranslationRequest): Observable<ITranslationResponse> {
        throw new Error('Method not implemented.');
    }
    getEnvironmentContext(): Observable<IEnvironmentContext> {
        throw new Error('Method not implemented.');
    }
    developmentSetEnvironmentContext(context: IEnvironmentContext) {
        throw new Error('Method not implemented.');
    }
    executeRequest(request: IFormRequest): Observable<IFormResponse> {
        throw new Error('Method not implemented.');
    }
    executeCommand(commandType: string, commandValue?: string | undefined, params?: any): Observable<IFormResponse> {
        throw new Error('Method not implemented.');
    }
}

class MockIonApiContext implements IIonApiContext {
    getUrl(): string {
        return 'contextUrl';
    }
    getToken(): string {
        throw new Error('Method not implemented.');
    }
    getHeaderName(): string {
        return 'Foo';
    }
    getHeaderValue(): string {
        return 'Bar';
    }
}

describe('IonApiServiceCore', () => {
    const mockIHttpService = new MockIHttpService();
    const mockIFormService = new MockIFormService();

    afterEach(() => {
        // restore the spy created with spyOn
        jest.restoreAllMocks();
    });

    it('should set url and token from contructor', () => {
        const service = new IonApiServiceCore(mockIHttpService, mockIFormService);
        expect(service['httpService']).toStrictEqual(mockIHttpService);
        expect(service['formService']).toStrictEqual(mockIFormService);
        expect(service['logPrefix']).toEqual('[IonApiServiceCore] ');
    });

    it('should set development token', () => {
        const service = new IonApiServiceCore(mockIHttpService, mockIFormService);
        expect(service['isDev']).toBe(false);

        const isLocalHost = jest.spyOn(HttpUtil, 'isLocalhost').mockReturnValueOnce(false).mockReturnValueOnce(true);
        expect(() => service.setDevelopmentToken('Foo')).toThrowError('Development tokens are only allowed for localhost');

        const tokenFoo = 'Foo';
        const tokenBar = 'Bar';
        service.setDevelopmentToken(tokenFoo);
        const context = service['context'];
        expect(service['isDev']).toBe(true);
        expect(context['getUrl']()).toBe('/ODIN_DEV_TENANT');
        expect(context['getToken']()).toBe(tokenFoo);
        context['setToken'](tokenBar);
        expect(context['getHeaderName']()).toBe('Authorization');
        expect(context['getHeaderValue']()).toBe('Bearer Bar');
        expect(isLocalHost).toHaveBeenCalledTimes(2);
    });

    it('should get context', (done) => {
        const service = new IonApiServiceCore(mockIHttpService, mockIFormService);
        expect(service['context']).toBe(undefined);

        const loadToken = jest.spyOn(IonApiServiceCore.prototype as any, 'loadToken').mockReturnThis();
        const subjectOne = service.getContext();
        expect(service['pending'].length).toBe(1);
        expect(service['pending'][0].asObservable()).toStrictEqual(subjectOne);

        const subjectTwo = service.getContext();
        expect(service['pending'].length).toBe(2);
        expect(service['pending'][1].asObservable()).toStrictEqual(subjectTwo);

        // set context
        const token = 'Foo';
        service.setDevelopmentToken(token);

        const subjectThree = service.getContext({ refresh: true });
        expect(service['pending'].length).toBe(3);
        expect(service['pending'][1].asObservable()).toStrictEqual(subjectThree);

        const subjectFour = service.getContext();
        expect(service['pending'].length).toBe(3);
        subjectFour.subscribe((sub) => {
            expect(sub.getToken()).toBe(token);
            done();
        });


        expect(loadToken).toHaveBeenCalledWith(undefined);
        expect(loadToken).toHaveBeenCalledTimes(1);
    });

    it('should answer canRetry', () => {
        const service = new IonApiServiceCore(mockIHttpService, mockIFormService);
        expect(service['canRetry']({} as IIonApiRequest, 0)).toBe(false);
        expect(service['canRetry']({} as IIonApiRequest, 401)).toBe(true);
        expect(service['canRetry']({ ionApiRetry: true } as IIonApiRequest, 401)).toBe(true);
        expect(service['canRetry']({ ionApiRetry: false } as IIonApiRequest, 401)).toBe(false);
    });

    it('should resolve', (done) => {
        const service = new IonApiServiceCore(mockIHttpService, mockIFormService);
        const item = new AsyncSubject<any>();
        const items = [item];
        const value = { foo: 'bar' };

        expect(items.length).toBe(1);
        service['resolve'](items, value);
        expect(items.length).toBe(0);

        item.subscribe((val) => {
            expect(val).toStrictEqual(value);
            done();
        });
    });

    it('should reject', (done) => {
        const service = new IonApiServiceCore(mockIHttpService, mockIFormService);
        const item = new AsyncSubject<any>();
        const items = [item];
        const reason = 'foo';

        expect(items.length).toBe(1);
        service['reject'](items, reason);
        expect(items.length).toBe(0);

        item.subscribe({
            error: (err) => {
                expect(err).toBe(reason);
                done();
            }
        });
    });

    it('should execte with success', (done) => {
        const service = new IonApiServiceCore(mockIHttpService, mockIFormService);
        expect(() => service.execute({} as IIonApiRequest)).toThrowError('No source specified');

        const param = { source: 'Foo' } as IIonApiRequest;
        const response = { statusText: 'Bar' } as IIonApiResponse;
        const getContext = jest.spyOn(service, 'getContext').mockReturnValueOnce(of({} as IIonApiContext));
        const executeApi = jest.spyOn(service as any, 'executeApi').mockImplementation((context, options, source, sub, isRetry) => {
            (sub as AsyncSubject<IIonApiResponse>).next(response);
            (sub as AsyncSubject<IIonApiResponse>).complete();
        });
        const subject = service.execute(param);
        expect(getContext).toHaveBeenCalled();
        expect(executeApi).toHaveBeenCalledWith({}, param, 'm3-odin-' + param.source, expect.anything(), false);
        subject.subscribe((resp) => {
            expect(resp).toStrictEqual(response);
            done();
        });
    });

    it('should execute with error', (done) => {
        const service = new IonApiServiceCore(mockIHttpService, mockIFormService);

        const param = { source: 'Foo' } as IIonApiRequest;
        const error = 'Bar';
        const getContext = jest.spyOn(service, 'getContext').mockReturnValueOnce(throwError(() => error));
        const subject = service.execute(param);
        expect(getContext).toHaveBeenCalled();
        subject.subscribe({
            error: (err) => {
                expect(err).toBe(error);
                done();
            }
        });
    });

    it('should load a token', () => {
        const service = new IonApiServiceCore(mockIHttpService, mockIFormService);

        const response = { body: 'bar' } as IHttpResponse;
        const environment = { ionApiUrl: 'Foo' } as IEnvironmentContext;
        const error = 'Error';
        const execute = jest.spyOn(service['httpService'], 'execute')
            .mockReturnValueOnce(of(response))
            .mockReturnValueOnce(of(response))
            .mockReturnValueOnce(of(response))
            .mockReturnValueOnce(of(response))
            .mockReturnValueOnce(of(response))
            .mockReturnValueOnce(throwError(() => error));
        const getEnvironmentContext = jest.spyOn(service['formService'], 'getEnvironmentContext')
            .mockReturnValueOnce(of({} as IEnvironmentContext))
            .mockReturnValueOnce(of({} as IEnvironmentContext))
            .mockReturnValueOnce(throwError(() => error))
            .mockReturnValueOnce(of(environment));
        const reject = jest.spyOn(service as any, 'reject').mockReturnThis();
        const resolve = jest.spyOn(service as any, 'resolve').mockReturnThis();
        const logError = jest.spyOn(service as any, 'logError').mockReturnThis();
        const logInfo = jest.spyOn(service as any, 'logInfo').mockReturnThis();
        const random = 'Bar';
        jest.spyOn(CoreUtil, 'random').mockReturnValue(random);

        service['loadToken'](false);
        service['isDev'] = true;
        service['loadToken'](false);
        service['loadToken'](false);
        service['loadToken'](false);
        service['loadToken'](false);
        service['loadToken'](true);

        expect(execute).toHaveBeenCalledTimes(6);
        expect(execute).toHaveBeenCalledWith({
            method: 'GET',
            url: '/grid/rest/security/sessions/oauth?rid=' + random,
            responseType: 'text'
        });

        expect(getEnvironmentContext).toHaveBeenCalledTimes(4);

        expect(reject).toHaveBeenCalledTimes(4);
        expect(reject).toHaveBeenNthCalledWith(1, service['pending'], response);
        expect(reject).toHaveBeenNthCalledWith(2, service['pending'], response);
        expect(reject).toHaveBeenNthCalledWith(3, service['pending'], response);
        expect(reject).toHaveBeenNthCalledWith(4, service['pending'], error);

        expect(resolve).toHaveBeenCalledTimes(2);
        expect(resolve).toHaveBeenNthCalledWith(1, service['pending'], service['context']);
        expect(resolve).toHaveBeenNthCalledWith(2, service['pending'], service['context']);

        expect(logError).toHaveBeenCalledTimes(3);
        expect(logError).toHaveBeenNthCalledWith(1, 'loadToken:  Failed to resolve ION Base URL. ION Base URL is null. Verify that it has been set as a grid property in the MUA Server, or set it by calling setUrl.');
        expect(logError).toHaveBeenNthCalledWith(2, 'loadToken:  Failed to resolve ION Base URL. ION Base URL is null. Verify that it has been set as a grid property in the MUA Server, or set it by calling setUrl.');
        expect(logError).toHaveBeenNthCalledWith(3, 'loadToken: Failed to resolve ION Base URL ' + error);

        expect(logInfo).toHaveBeenCalledTimes(4);
        expect(logInfo).toHaveBeenNthCalledWith(1, 'ION base url is not set. getEnvironmentContext will be called to lookup ION URL');
        expect(logInfo).toHaveBeenNthCalledWith(2, 'ION base url is not set. Using relative path in Dev mode, in production the ION URL can be set with setUrl, if not set it will be automatically retreived from H5.');
        expect(logInfo).toHaveBeenNthCalledWith(3, 'ION base url is not set. Using relative path in Dev mode, in production the ION URL can be set with setUrl, if not set it will be automatically retreived from H5.');
        expect(logInfo).toHaveBeenNthCalledWith(4, 'ION base url is not set. Using relative path in Dev mode, in production the ION URL can be set with setUrl, if not set it will be automatically retreived from H5.');

        expect(service['url']).toBe(environment.ionApiUrl);
        expect(service['context'].getUrl()).toBe(service['url']);
        expect(service['context'].getToken()).toBe(response.body);
    });

    it('should execute api', () => {
        const service = new IonApiServiceCore(mockIHttpService, mockIFormService);

        const response = { body: 'bar' } as IHttpResponse;
        const source = 'source';
        const url = 'foo';
        const context = new MockIonApiContext();
        const retryContext = { ...context } as IIonApiContext;
        const error = 'Error';
        const options = {
            url: context.getUrl() + '/' + url,
            headers: {
                'x-infor-ionapi-platform': 'm3-odin',
                'x-infor-ionapi-source': source,
            }
        };
        options.headers[context.getHeaderName()] = context.getHeaderValue();
        const subjectSuccess = new AsyncSubject<IIonApiResponse>();
        const subjectErrorOne = new AsyncSubject<IIonApiResponse>();
        const subjectErrorTwo = new AsyncSubject<IIonApiResponse>();
        const subjectErrorThree = new AsyncSubject<IIonApiResponse>();

        jest.spyOn(service as any, 'isDebug').mockReturnValue(true);
        jest.spyOn(service as any, 'canRetry').mockReturnValue(true);
        const logDebug = jest.spyOn(service as any, 'logDebug').mockReturnThis();
        const execute = jest.spyOn(service['httpService'], 'execute')
            .mockReturnValueOnce(of(response))
            .mockReturnValueOnce(throwError(() => error))
            .mockReturnValueOnce(throwError(() => error))
            .mockReturnValueOnce(throwError(() => error));
        const getContext = jest.spyOn(service, 'getContext')
            .mockReturnValueOnce(of(retryContext))
            .mockReturnValueOnce(throwError(() => error));

        service['executeApi'](context, { url } as IIonApiRequest, source, subjectSuccess, false);
        service['executeApi'](context, { url } as IIonApiRequest, source, subjectErrorOne, true);
        service['executeApi'](context, { url } as IIonApiRequest, source, subjectErrorTwo, false);
        service['executeApi'](context, { url } as IIonApiRequest, source, subjectErrorThree, false);

        expect(execute).toHaveBeenCalledTimes(4);
        expect(execute).toHaveBeenNthCalledWith(1, options);
        expect(execute).toHaveBeenNthCalledWith(2, options);
        expect(execute).toHaveBeenNthCalledWith(3, options);
        expect(execute).toHaveBeenNthCalledWith(4, options);

        expect(logDebug).toHaveBeenCalledTimes(5);
        expect(logDebug).toHaveBeenNthCalledWith(1, `executeApi: Executing ${options.url} (${source})`);
        expect(logDebug).toHaveBeenNthCalledWith(2, `executeApi: Executed ${options.url} (${source})`);
        expect(logDebug).toHaveBeenNthCalledWith(3, `executeApi: Executing ${options.url} (${source})`);
        expect(logDebug).toHaveBeenNthCalledWith(4, `executeApi: Executing ${options.url} (${source})`);
        expect(logDebug).toHaveBeenNthCalledWith(5, `executeApi: Executing ${options.url} (${source})`);

        expect(getContext).toHaveBeenCalledTimes(2);
        expect(getContext).toHaveBeenNthCalledWith(1, { refresh: true });
        expect(getContext).toHaveBeenNthCalledWith(2, { refresh: true });

        let subscribeCount = 0;
        subjectSuccess.subscribe({
            next: (resp) => {
                expect(resp).toStrictEqual(response);
                subscribeCount++;
            },
        });
        subjectErrorOne.subscribe({
            error: (err) => {
                expect(err).toBe(error);
                subscribeCount++;
            }
        });
        subjectErrorThree.subscribe({
            error: (err) => {
                expect(err).toBe(error);
                subscribeCount++;
            }
        });

        expect(subscribeCount).toBe(3);
    });
});