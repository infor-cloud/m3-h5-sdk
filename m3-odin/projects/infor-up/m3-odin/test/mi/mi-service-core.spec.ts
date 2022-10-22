import { describe, expect, it } from '@jest/globals';
import { AsyncSubject, of, throwError } from 'rxjs';
import { AjaxHttpService } from '../../http';
import { IMIMetadataMap, IMIResponse } from '../../mi/base';
import { MIMetadataInfo, MIRecord, MIResponse, MIServiceCore } from '../../mi/runtime';
import { IMIRequest } from '../../mi/types';
import { IHttpRequest, IHttpResponse, IHttpService } from '../../types';
import { CoreUtil } from '../../util';

describe('MI Service Core', () => {
    afterEach(() => {
        // restore the spy created with spyOn
        jest.restoreAllMocks();
    });

    it('should initialize', () => {
        const http = {} as IHttpService;
        const spyLogDebug = jest.spyOn(MIServiceCore.prototype as any, 'logDebug').mockImplementation(() => { });
        const service = new MIServiceCore();
        const serviceHttp = new MIServiceCore(http);

        expect(service['http']).toBeInstanceOf(AjaxHttpService);
        expect(serviceHttp['http']).toBe(http);
        expect(spyLogDebug).toHaveBeenCalledTimes(3);
        expect(spyLogDebug).toHaveBeenNthCalledWith(1, 'constructor');
        expect(spyLogDebug).toHaveBeenNthCalledWith(2, 'IHttpService not passed using default implmentation');

        expect(service['csrfToken']).toBeUndefined();
        expect(service['csrfTimestamp']).toBe(0);
        expect(service['csrfStatus']).toBe(0);
        expect(service['maxTokenAge']).toBe(30000);
        expect(service['currentCompany']).toBeNull();
        expect(service['currentDivision']).toBeNull();
    });

    it('should create request', () => {
        const service = new MIServiceCore();
        const requestExpected: IHttpRequest = {
            method: 'GET', url: 'foo', responseType: 'json',
            body: null,
            headers: {
                'Content-Type': 'application/json; charset=UTF-8',
                'Accept': 'application/json'
            }
        };
        const request = service['createRequest'](requestExpected.url);

        expect(request).toStrictEqual(requestExpected);
    });

    it('should return if token is valid', () => {
        const service = new MIServiceCore();

        expect(service['isTokenValid']()).toBe(false);

        service['csrfToken'] = 'foo';
        expect(service['isTokenValid']()).toBe(false);

        service['csrfTimestamp'] = new Date().getTime();
        expect(service['isTokenValid']()).toBe(true);
    });

    it('should return if token should be used', () => {
        const service = new MIServiceCore();
        const request = {} as IMIRequest;

        expect(service['useToken'](request)).toBe(true);
        expect(service['useToken']({ ...request, enableCsrf: false })).toBe(false);

        service['csrfStatus'] = 404;
        expect(service['useToken'](request)).toBe(false);
    });

    it('should execute to refersh token (success)', () => {
        const httpService = new AjaxHttpService();
        const httpResponse = { status: 200, body: 'bar' } as IHttpResponse;
        const spyExecute = jest.spyOn(httpService, 'execute').mockImplementation(() => {
            return of(httpResponse);
        });
        const service = new MIServiceCore(httpService);
        const spyExecuteInternal = jest.spyOn(service, 'executeInternal').mockImplementation();
        const request = { baseUrl: 'foo' } as unknown as IMIRequest;
        const subject = new AsyncSubject<IMIResponse>();
        const expectedHttpRequest = { cache: false, method: "GET", url: `${request['baseUrl']}/m3api-rest/csrf` };

        service['executeRefreshToken'](request, subject);
        expect(spyExecute).toHaveBeenCalledTimes(1);
        expect(spyExecute).toHaveBeenNthCalledWith(1, expectedHttpRequest);
        expect(spyExecuteInternal).toHaveBeenCalledTimes(1);
        expect(spyExecuteInternal).toHaveBeenNthCalledWith(1, request, subject);
        expect(service['csrfStatus']).toBe(httpResponse.status);
        expect(service['csrfToken']).toBe(httpResponse.body);
    });

    it('should execute to refersh token (fail with 404)', () => {
        const httpService = new AjaxHttpService();
        const httpResponse = { status: 404, body: 'bar' } as IHttpResponse;
        const spyExecute = jest.spyOn(httpService, 'execute').mockImplementation(() => {
            return throwError(() => (httpResponse));
        });
        const service = new MIServiceCore(httpService);
        const spyExecuteInternal = jest.spyOn(service, 'executeInternal').mockImplementation();
        const request = { baseUrl: 'foo' } as unknown as IMIRequest;
        const subject = new AsyncSubject<IMIResponse>();
        const expectedHttpRequest = { cache: false, method: "GET", url: `${request['baseUrl']}/m3api-rest/csrf` };

        service['executeRefreshToken'](request, subject);
        expect(spyExecute).toHaveBeenCalledTimes(1);
        expect(spyExecute).toHaveBeenNthCalledWith(1, expectedHttpRequest);
        expect(spyExecuteInternal).toHaveBeenCalledTimes(1);
        expect(spyExecuteInternal).toHaveBeenNthCalledWith(1, request, subject);
        expect(service['csrfStatus']).toBe(httpResponse.status);
        expect(service['csrfToken']).toBeNull();
    });

    it('should execute to refersh token (fail with 401)', (done) => {
        const httpService = new AjaxHttpService();
        const httpResponse = { status: 401, body: 'bar' } as IHttpResponse;
        const spyExecute = jest.spyOn(httpService, 'execute').mockImplementation(() => {
            return throwError(() => (httpResponse));
        });
        const service = new MIServiceCore(httpService);
        const request = { baseUrl: 'foo' } as unknown as IMIRequest;
        const subject = new AsyncSubject<IMIResponse>();
        const expectedHttpRequest = { cache: false, method: "GET", url: `${request['baseUrl']}/m3api-rest/csrf` };

        service['executeRefreshToken'](request, subject);
        expect(spyExecute).toHaveBeenCalledTimes(1);
        expect(spyExecute).toHaveBeenNthCalledWith(1, expectedHttpRequest);
        expect(service['csrfStatus']).toBe(httpResponse.status);
        expect(service['csrfToken']).toBeNull();
        subject.subscribe({
            error(err) {
                const response = new MIResponse();
                response.errorMessage = `Failed to get CSRF token ${httpResponse.status}`;
                response.errorType = 'TOKEN';
                expect(err).toStrictEqual(response);
                done();
            },
        });
    });

    it('should resolve', (done) => {
        const service = new MIServiceCore();
        const subject = new AsyncSubject();
        const subjectArray = [subject];
        const value = 'foo';

        service['resolve'](subjectArray, value);
        subject.subscribe({
            next: (val) => {
                expect(val).toBe(value);
                expect(subjectArray.length).toBe(0);
            }, complete: () => {
                done();
            }
        });
    });

    it('should reject', (done) => {
        const service = new MIServiceCore();
        const subject = new AsyncSubject();
        const subjectArray = [subject];
        const value = 'foo';

        service['reject'](subjectArray, value);
        subject.subscribe({
            error: (val) => {
                expect(val).toBe(value);
                expect(subjectArray.length).toBe(0);
                done();
            }
        });
    });

    it('should execute request', (done) => {
        const request = {} as IMIRequest;
        const value = { program: 'foo' } as IMIResponse;
        const service = new MIServiceCore();
        const spyUseToken = jest.spyOn(service as any, 'useToken')
            .mockReturnValueOnce(true)
            .mockReturnValueOnce(true)
            .mockReturnValueOnce(false)
            .mockReturnValueOnce(false);
        const spyIsTokenValid = jest.spyOn(service as any, 'isTokenValid')
            .mockReturnValueOnce(true)
            .mockReturnValueOnce(false)
            .mockReturnValueOnce(true)
            .mockReturnValueOnce(false);
        const spyExecuteInternal = jest.spyOn(service as any, 'executeInternal').mockImplementation(() => { });
        const spyExecuteRefreshToken = jest.spyOn(service as any, 'executeRefreshToken').mockImplementation((...a) => {
            (a[1] as AsyncSubject<IMIResponse>).next(value);
            (a[1] as AsyncSubject<IMIResponse>).complete();
        });

        service.execute(request);
        const observable = service.execute(request);
        service.execute(request);
        service.execute(request);
        expect(spyUseToken).toHaveBeenCalledTimes(4);
        expect(spyIsTokenValid).toHaveBeenCalledTimes(2);
        expect(spyExecuteInternal).toHaveBeenCalledTimes(3);
        expect(spyExecuteRefreshToken).toHaveBeenCalledTimes(1);

        observable.subscribe((val) => {
            expect(val).toStrictEqual(value);
            done();
        });
    });

    it('should update user context', () => {
        const service = new MIServiceCore();
        const spyLogDebug = jest.spyOn(service as any, 'logDebug').mockImplementation(() => { });
        const company = 'foo';
        const division = 'bar';

        service.updateUserContext(company, division);
        expect(service['currentCompany']).toBe(company);
        expect(service['currentDivision']).toBe(division);
        expect(spyLogDebug).toHaveBeenCalledTimes(1);
        expect(spyLogDebug).toHaveBeenCalledWith(`updateUserContext: ${company}/${division}`);
    });

    it('should create url', () => {
        const service = new MIServiceCore();
        const spyLogDebug = jest.spyOn(service as any, 'logDebug').mockImplementation(() => { });
        const spyLogInfo = jest.spyOn(service as any, 'logInfo').mockImplementation(() => { });
        const baseUrl = 'odin';
        const request = { program: 'foo', transaction: 'bar' } as IMIRequest;
        const random = 123456789;
        CoreUtil.random = jest.fn().mockReturnValue(random);
        const defaultMetadata = 'true';
        const defaultMaxRecords = 100;
        const expectedMaxRecords = 1;
        const defaultExcludeEmpty = 'true';
        const changedExcludeEmpty = 'false';
        const outputFields = ['CUNO'];
        const company = '100';
        const division = '200';

        expect(service.createUrl(baseUrl, request)).toBe(`${baseUrl}/${request.program}/${request.transaction};metadata=${defaultMetadata};maxrecs=${defaultMaxRecords};excludempty=${changedExcludeEmpty}?_rid=${random}`);
        expect(service.createUrl(baseUrl, { ...request, excludeEmptyValues: true })).toBe(`${baseUrl}/${request.program}/${request.transaction};metadata=${defaultMetadata};maxrecs=${defaultMaxRecords};excludempty=${defaultExcludeEmpty}?_rid=${random}`);
        expect(service.createUrl(baseUrl, { ...request, maxReturnedRecords: expectedMaxRecords })).toBe(`${baseUrl}/${request.program}/${request.transaction};metadata=${defaultMetadata};maxrecs=${expectedMaxRecords};excludempty=${changedExcludeEmpty}?_rid=${random}`);
        expect(service.createUrl(baseUrl, { ...request, outputFields })).toBe(`${baseUrl}/${request.program}/${request.transaction};metadata=${defaultMetadata};maxrecs=${defaultMaxRecords};excludempty=${changedExcludeEmpty};returncols=${outputFields}?_rid=${random}`);
        expect(service.createUrl(baseUrl, { ...request, includeMetadata: true })).toBe(`${baseUrl}/${request.program}/${request.transaction};metadata=${defaultMetadata};maxrecs=${defaultMaxRecords};excludempty=${changedExcludeEmpty}?_rid=${random}`);
        expect(service.createUrl(baseUrl, { ...request, company, division })).toBe(`${baseUrl}/${request.program}/${request.transaction};metadata=${defaultMetadata};maxrecs=${defaultMaxRecords};excludempty=${changedExcludeEmpty};cono=${company};divi=${division}?_rid=${random}`);
        expect(service.createUrl(baseUrl, { ...request, record: { program: 'MNS150' } })).toBe(`${baseUrl}/${request.program}/${request.transaction};metadata=${defaultMetadata};maxrecs=${defaultMaxRecords};excludempty=${changedExcludeEmpty}?program=MNS150&_rid=${random}`);
        expect(service.createUrl(baseUrl, { ...request, record: { program: 'MNS150', transaction: 'GetUserData' } })).toBe(`${baseUrl}/${request.program}/${request.transaction};metadata=${defaultMetadata};maxrecs=${defaultMaxRecords};excludempty=${changedExcludeEmpty}?program=MNS150&transaction=GetUserData&_rid=${random}`);

        service['currentCompany'] = company;
        expect(service.createUrl(baseUrl, request)).toBe(`${baseUrl}/${request.program}/${request.transaction};metadata=${defaultMetadata};maxrecs=${defaultMaxRecords};excludempty=${changedExcludeEmpty};cono=${company}?_rid=${random}`);
        const spyIsDebug = jest.spyOn(service as any, 'isDebug').mockReturnValueOnce(true);
        expect(service.createUrl(baseUrl, request)).toBe(`${baseUrl}/${request.program}/${request.transaction};metadata=${defaultMetadata};maxrecs=${defaultMaxRecords};excludempty=${changedExcludeEmpty};cono=${company}?_rid=${random}`);


        expect(spyIsDebug).toHaveBeenCalledTimes(1);
        expect(spyLogDebug).toHaveBeenCalledTimes(1);
        expect(spyLogDebug).toHaveBeenCalledWith(`createUrl: using company ${company} and division null from user context`);
        expect(spyLogInfo).toHaveBeenCalledTimes(8);
        expect(spyLogInfo).toHaveBeenCalledWith('createUrl: company not set, user context not available.');
    });

    it('should parse response', () => {
        const service = new MIServiceCore();
        const request = { tag: 'hello' } as IMIRequest;
        const content = {};
        const response = new MIResponse();
        response.transaction = undefined as unknown as string;
        response.program = undefined as unknown as string;
        response.tag = request.tag;
        response.errorCode = undefined as unknown as string;
        response.errorField = undefined as unknown as string;
        response.errorType = undefined as unknown as string;
        response.items = [];

        expect(service.parseResponse(request, content)).toStrictEqual(response);

        response.metadata = null as unknown as IMIMetadataMap;
        expect(service.parseResponse({ ...request, includeMetadata: true }, content)).toStrictEqual(response);

        const record = new MIRecord();
        record['name1'] = 'bar';
        record['name'] = 'foo';
        response.items = [record];
        response.item = record;
        content['MIRecord'] = [{ NameValue: [{ Name: 'name1', Value: 'bar' }, { Name: 'name', Value: 'foo' }] }];
        content['Metadata'] = { Field: [{ '@name': 'name1', '@length': 1, '@description': 'desc1' }, { '@name': 'name2', '@length': 2, '@description': 'desc2' }] };
        const info1 = new MIMetadataInfo('name1', 1, '', 'desc1');
        const info2 = new MIMetadataInfo('name2', 2, '', 'desc2');
        response.metadata = { name1: info1, name2: info2 };
        record['metadata'] = response.metadata;
        expect(service.parseResponse({ ...request, includeMetadata: true, typedOutput: true }, content)).toStrictEqual(response);
        expect(service.parseResponse({ ...request, includeMetadata: true }, content)).toStrictEqual(response);
    });

    it('should execute request internal without error in http response', (done) => {
        const service = new MIServiceCore();
        const spyCreateUrl = jest.spyOn(service, 'createUrl').mockImplementation(() => '');
        const spyExecuteHttp = jest.spyOn(service as any, 'executeHttp').mockImplementation(() => of({}));
        const response = new MIResponse();
        const spyHasError = jest.spyOn(response, 'hasError').mockReturnValueOnce(false);
        const spyParseResponse = jest.spyOn(service as any, 'parseResponse').mockImplementation(() => response);
        const subject = new AsyncSubject<IMIResponse>();
        const request = {} as IMIRequest;

        service['executeInternal'](request, subject);
        expect(spyCreateUrl).toHaveBeenCalledTimes(1);
        expect(spyCreateUrl).toHaveBeenCalledWith('/m3api-rest/execute', request);
        expect(spyExecuteHttp).toHaveBeenCalledTimes(1);
        expect(spyParseResponse).toHaveBeenCalledTimes(1);
        expect(spyHasError).toHaveBeenCalledTimes(1);
        subject.subscribe(resp => {
            expect(resp).toStrictEqual(response);
            done();
        });
    });

    it('should execute request internal with error in http response', (done) => {
        const service = new MIServiceCore();
        const spyCreateUrl = jest.spyOn(service, 'createUrl').mockImplementation(() => '');
        const spyExecuteHttp = jest.spyOn(service as any, 'executeHttp').mockImplementation(() => of({}));
        const response = new MIResponse();
        const spyHasError = jest.spyOn(response, 'hasError').mockReturnValueOnce(true);
        const spyParseResponse = jest.spyOn(service as any, 'parseResponse').mockImplementation(() => response);
        const subject = new AsyncSubject<IMIResponse>();
        const request = {} as IMIRequest;

        service['executeInternal'](request, subject);
        expect(spyCreateUrl).toHaveBeenCalledTimes(1);
        expect(spyCreateUrl).toHaveBeenCalledWith('/m3api-rest/execute', request);
        expect(spyExecuteHttp).toHaveBeenCalledTimes(1);
        expect(spyParseResponse).toHaveBeenCalledTimes(1);
        expect(spyHasError).toHaveBeenCalledTimes(1);
        subject.subscribe({
            error: (err) => {
                expect(err).toStrictEqual(response);
                done();
            }
        });
    });

    it('should execute request internal with exception in parseResponse', (done) => {
        const service = new MIServiceCore();
        const spyCreateUrl = jest.spyOn(service, 'createUrl').mockImplementation(() => '');
        const spyExecuteHttp = jest.spyOn(service as any, 'executeHttp').mockImplementation(() => of({}));
        const error = 'foo error';
        const spyParseResponse = jest.spyOn(service as any, 'parseResponse').mockImplementation(() => { throw error });
        const subject = new AsyncSubject<IMIResponse>();
        const request = {} as IMIRequest;

        service['executeInternal'](request, subject);
        expect(spyCreateUrl).toHaveBeenCalledTimes(1);
        expect(spyCreateUrl).toHaveBeenCalledWith('/m3api-rest/execute', request);
        expect(spyExecuteHttp).toHaveBeenCalledTimes(1);
        expect(spyParseResponse).toHaveBeenCalledTimes(1);
        subject.subscribe({
            error: (err) => {
                const response = new MIResponse();
                response.error = error;
                expect(err).toStrictEqual(response);
                done();
            }
        });
    });

    it('should execute request internal with http error', (done) => {
        const service = new MIServiceCore();
        const spyCreateUrl = jest.spyOn(service, 'createUrl').mockImplementation(() => '');
        const response = { status: 401 } as IHttpResponse;
        const spyExecuteHttp = jest.spyOn(service as any, 'executeHttp').mockImplementation(() => throwError(() => response));
        const subject = new AsyncSubject<IMIResponse>();
        const request = { program: 'foo', transaction: 'bar' } as IMIRequest;

        service['executeInternal'](request, subject);
        expect(spyCreateUrl).toHaveBeenCalledTimes(1);
        expect(spyCreateUrl).toHaveBeenCalledWith('/m3api-rest/execute', request);
        expect(spyExecuteHttp).toHaveBeenCalledTimes(1);
        subject.subscribe({
            error: (err) => {
                const resp = new MIResponse();
                resp.errorCode = response.status.toString();
                resp.errorMessage = `Failed to call ${request.program}.${request.transaction} ${response.status}`;
                expect(err).toStrictEqual(resp);
                done();
            }
        });
    });

    it('should parse value', () => {
        const service = new MIServiceCore();
        const valueString = 'foo';
        const valueNumeric = '1';
        const valueDate = '20221001';
        const metadata = new MIMetadataInfo('', 0, '', '');
        const spyIsString = jest.spyOn(metadata, 'isString')
            .mockReturnValueOnce(true)
            .mockReturnValue(false)
            .mockReturnValue(false)
            .mockReturnValue(false)
            .mockReturnValue(false)
            .mockReturnValue(false);
        const spyIsNumeric = jest.spyOn(metadata, 'isNumeric')
            .mockReturnValueOnce(true)
            .mockReturnValueOnce(true)
            .mockReturnValue(false)
            .mockReturnValue(false)
            .mockReturnValue(false);
        const spyIsDate = jest.spyOn(metadata, 'isDate')
            .mockReturnValueOnce(true)
            .mockReturnValueOnce(true)
            .mockReturnValueOnce(false);

        expect(service['parseValue'](valueString, metadata)).toBe(valueString);
        expect(service['parseValue'](valueNumeric, metadata)).toBe(+valueNumeric);
        expect(service['parseValue'](undefined as unknown as string, metadata)).toBe(0);
        expect(service['parseValue'](valueDate, metadata)).toStrictEqual(new Date(2022, 9, 1));
        expect(service['parseValue'](undefined as unknown as string, metadata)).toBeNull();
        expect(service['parseValue'](valueString, metadata)).toBe(valueString);

        expect(spyIsString).toHaveBeenCalledTimes(6);
        expect(spyIsNumeric).toHaveBeenCalledTimes(5);
        expect(spyIsDate).toHaveBeenCalledTimes(3);
    });
});
