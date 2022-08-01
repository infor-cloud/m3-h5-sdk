import { describe, expect, it, beforeEach, afterEach, jest } from '@jest/globals';
import { AsyncSubject, BehaviorSubject, Observable, of, Subject, throwError } from "rxjs";
import { FormServiceCore, IBookmark, IEnvironmentContext, IFormRequest, ISearchRequest } from "../../form";
import { Bookmark, FormResponse, IFormResponse, ITranslationItem, ITranslationJob, ITranslationRequest, ITranslationResponse } from "../../form/base";
import { Translator } from "../../form/runtime";
import { IUserContext, IUserService } from "../../m3";
import { IHttpRequest, IHttpResponse, IHttpService } from "../../types";
import { DOMParser } from '@xmldom/xmldom';
import { FormParser } from "../../form/parser";

class HttpServiceMock implements IHttpService {
    execute(request: IHttpRequest): Observable<IHttpResponse> {
        return new Subject<IHttpResponse>().asObservable();
    }
}

describe('FormServiceCore', () => {
    const httpServiceMock = new HttpServiceMock();
    let formService: FormServiceCore;

    beforeEach(() => {
        formService = new FormServiceCore(httpServiceMock);
    });

    afterEach(() => {
        // restore the spy created with spyOn
        jest.restoreAllMocks();
    });

    it('should create AjaxHttpService in constructor', () => {
        const service = new FormServiceCore();
        expect(service['httpService']!['logPrefix']).toBe('[AjaxHttpService] ');
    });

    it('should call executeWithSession from executeCommand', () => {
        const formRequest = { commandType: 'Hello', commandValue: 'bar', params: 'foo' }

        const executeWithSession = jest.spyOn(formService as any, 'executeWithSession').mockImplementation((request) => {
            expect(request).toStrictEqual(formRequest);
        });

        formService.executeCommand(formRequest.commandType, formRequest.commandValue, formRequest.params);
        expect(executeWithSession).toHaveBeenCalled();
    });


    it('should call executeWithSession from executeRequest', () => {
        const formRequest = { commandType: 'Hello', commandValue: 'bar', params: 'foo' }

        const executeWithSession = jest.spyOn(formService as any, 'executeWithSession').mockImplementation((request) => {
            expect(request).toStrictEqual(formRequest);
        });

        formService.executeRequest(formRequest);
        expect(executeWithSession).toHaveBeenCalled();
    });

    it('should call executeWithSession from executeBookmark', () => {
        const bookmarkStateless: IBookmark = {
            program: 'CRS610', table: 'OCUSMA', keyNames: 'OKCONO,OKCUNO', option: '5', panel: 'E', isStateless: true
        };
        const bookmarkStateful: IBookmark = { ...bookmarkStateless, isStateless: false };
        const formRequest: IFormRequest = {
            commandType: 'RUN',
            commandValue: 'BOOKMARK',
        };

        const executeWithSession = jest.spyOn(formService as any, 'executeWithSession').mockImplementation((request_) => {
            const request = request_ as IFormRequest;
            expect(request.commandType).toBe(formRequest.commandType);
            expect(request.commandValue).toBe(formRequest.commandValue);
            request.resolver!(request, {} as IUserContext);
            expect(request.params).toStrictEqual(formRequest.params);
        });

        // Check stateful
        formRequest.params = Bookmark.toParams(bookmarkStateful, {} as IUserContext),
            formService.executeBookmark(bookmarkStateful);
        expect(executeWithSession).toHaveBeenCalled();

        // Check stateless
        formRequest.params = Bookmark.toParams(bookmarkStateless, {} as IUserContext),
            formService.executeBookmark(bookmarkStateless);
        expect(executeWithSession).toHaveBeenCalled();
    });

    it('should call executeWithSession from executeSearch', () => {
        const searchRequest: ISearchRequest = { program: 'CRS610', query: 'CUNM: Retail*', view: 'D01-01-01', sortingOrder: '1', filterFields: ['CUNO'], startPanelFields: { CONO: '100' } };
        const formRequest: IFormRequest = {
            commandType: 'RUN',
            commandValue: 'SEARCH',
            params: {
                STATELESS: true,
                SEARCH_PROGRAM: searchRequest.program,
                SEARCH_QUERY: searchRequest.query,
                SEARCH_VIEW: searchRequest.view,
                SEARCH_INQUIRY_TYPE: searchRequest.sortingOrder,
                SEARCH_FILTER_FIELDS: 'CUNO',
                SEARCH_START_PANEL_FIELDS: 'CONO,100',
            }
        };

        const executeWithSession = jest.spyOn(formService as any, 'executeWithSession').mockImplementation((request) => {
            expect(request).toStrictEqual(formRequest);
        });

        formService.executeSearch(searchRequest);
        expect(executeWithSession).toHaveBeenCalled();
    });

    it('should throw exception in validate', () => {
        expect(() => formService.validate('foo', null!)).toThrow('The foo property is mandatory');
    });

    it('should return string from getFilterFields', () => {
        const searchRequest = {} as ISearchRequest;
        expect(formService['getFilterFields'](searchRequest)).toBe('');
        searchRequest.filterFields = [];
        expect(formService['getFilterFields'](searchRequest)).toBe('');
        searchRequest.filterFields = ['CONO', 'DIVI'];
        expect(formService['getFilterFields'](searchRequest)).toBe('CONO,DIVI');
    });

    it('should return string from getStartPanelFields', () => {
        const searchRequest = {} as ISearchRequest;
        expect(formService['getStartPanelFields'](searchRequest)).toBe('');
        searchRequest.startPanelFields = {};
        expect(formService['getStartPanelFields'](searchRequest)).toBe('');
        searchRequest.startPanelFields = { 'W1OBKV': 'TEST', 'W2OBKV': ' ', 'foo': '', 'bar': null! };
        expect(formService['getStartPanelFields'](searchRequest)).toBe('W1OBKV,TEST,W2OBKV,%20,foo,%20,bar,%20');
    });

    it('should return empty response object from translate', (done) => {
        const translationRequest: ITranslationRequest = {};
        const translationResponse: ITranslationResponse = {};
        formService['translator'] = { translate: (request: ITranslationRequest): ITranslationJob => null! } as Translator;
        formService.translate(translationRequest).subscribe((response) => {
            expect(response).toStrictEqual(translationResponse);
            done();
        });
    });

    it('should return response object from translate', (done) => {
        const translationRequest: ITranslationRequest = {};
        const translationResponse: ITranslationResponse = {};

        formService['translator'] = { translate: (request: ITranslationRequest): ITranslationJob => ({} as ITranslationJob) } as Translator;
        const spyCreateHttpRequest = jest.spyOn(formService as any, 'createHttpRequest').mockImplementation(() => ({}));
        const spyOnTranslate = jest.spyOn(formService as any, 'onTranslate').mockImplementation(() => translationResponse);
        const spyExecute = jest.spyOn(httpServiceMock, 'execute').mockImplementation(() => of({} as IHttpResponse));

        formService.translate(translationRequest).subscribe((response) => {
            expect(response).toStrictEqual(translationResponse);
            expect(spyCreateHttpRequest).toHaveBeenCalled();
            expect(spyOnTranslate).toHaveBeenCalled();
            expect(spyExecute).toHaveBeenCalled();
            done();
        });
    });

    it('should return error response object from translate', (done) => {
        const translationRequest: ITranslationRequest = {};
        const errorResponse = { result: -1 } as IFormResponse;

        formService['translator'] = { translate: (request: ITranslationRequest): ITranslationJob => ({} as ITranslationJob) } as Translator;
        const spyCreateHttpRequest = jest.spyOn(formService as any, 'createHttpRequest').mockImplementation(() => ({}));
        const spyCreateError = jest.spyOn(formService as any, 'createError').mockImplementation(() => (errorResponse));
        const spyExecute = jest.spyOn(httpServiceMock, 'execute').mockImplementation(() => throwError(() => new Error('error')));

        formService.translate(translationRequest).subscribe({
            next: null!, error: (response) => {
                expect(response).toStrictEqual(errorResponse);
                expect(spyCreateHttpRequest).toHaveBeenCalled();
                expect(spyCreateError).toHaveBeenCalled();
                expect(spyExecute).toHaveBeenCalled();
                done();
            }
        });
    });

    it('should return translation response from onTranslate', () => {
        const translationItems: ITranslationItem[] = [];
        const job: ITranslationJob = { items: translationItems, language: 'GB', params: 'foo' };
        const data = 'foo';
        formService['translator'] = { parseResponse: (job: ITranslationJob, content: string): ITranslationResponse => ({} as ITranslationResponse) } as unknown as Translator;

        const response = formService['onTranslate'](job, data);
        expect((response as ITranslationJob).params).toBeNull();
    });

    it('should set environmentContext from developmentSetEnvironmentContext', () => {
        const envContext: IEnvironmentContext = { isMultiTenant: true, ionApiUrl: 'cloud' };
        formService.developmentSetEnvironmentContext(envContext);
        expect(formService['environmentContext']).toStrictEqual(envContext);
    });

    it('should return existing environment context from getEnvironmentContext', (done) => {
        const envContext: IEnvironmentContext = { isMultiTenant: true, ionApiUrl: 'cloud' };
        formService['environmentContext'] = envContext;
        formService.getEnvironmentContext().subscribe(context => {
            expect(context).toStrictEqual(envContext);
            done();
        });
    });

    it('should return environment context by user context from getEnvironmentContext', (done) => {
        const envContext: IEnvironmentContext = { isMultiTenant: true, ionApiUrl: 'cloud' };
        const spyHasEnvironmentInformation = jest.spyOn(formService as any, 'hasEnvironmentInformation').mockImplementation(() => true);
        const spyCreateEnvironmentContext = jest.spyOn(formService as any, 'createEnvironmentContext').mockImplementation(() => envContext);
        const spyLogDebug = jest.spyOn(formService as any, 'logDebug').mockImplementation((message) => {
            expect(message).toBe('getEnvironmentContext: user has tenantid set, getting data from user context');
        });
        const spyLogInfo = jest.spyOn(formService as any, 'logInfo').mockImplementation((message) => {
            expect(message).toBe('getEnvironmentContext: {\"isMultiTenant\":true,\"ionApiUrl\":\"cloud\"}');
        });

        formService.getEnvironmentContext().subscribe(context => {
            expect(context).toStrictEqual(envContext);
            expect(spyHasEnvironmentInformation).toHaveBeenCalled();
            expect(spyCreateEnvironmentContext).toHaveBeenCalled();
            expect(spyLogDebug).toHaveBeenCalled();
            expect(spyLogInfo).toHaveBeenCalled();
            done();
        });
    });

    it('should return environment context by M3USER_OPT w document from getEnvironmentContext', (done) => {
        const envContext: IEnvironmentContext = { isMultiTenant: true, ionApiUrl: 'cloud' };
        const spyHasEnvironmentInformation = jest.spyOn(formService as any, 'hasEnvironmentInformation').mockImplementation(() => false);
        const spyLogDebug = jest.spyOn(formService as any, 'logDebug').mockImplementation((message) => {
            expect(message).toBe('getEnvironmentContext: Get user information /MvxMCSvt?CMDTP=USER&CMDVAL=M3USER_OPT');
        });
        const spyLogInfo = jest.spyOn(formService as any, 'logInfo').mockImplementation((message) => {
            expect(message).toBe('getEnvironmentContext: {\"isMultiTenant\":true,\"ionApiUrl\":\"cloud\"}');
        });
        const spyCommand = jest.spyOn(formService as any, 'command').mockImplementation((type, value): Observable<IFormResponse> => {
            expect(type).toBe('USER');
            expect(value).toBe('M3USER_OPT');
            return of({ document: {} as Document } as IFormResponse);
        });
        const spyCreateEnvironmentContextFromXml = jest.spyOn(formService as any, 'createEnvironmentContextFromXml').mockImplementation((_d) => envContext);

        formService.getEnvironmentContext().subscribe(context => {
            expect(context).toStrictEqual(envContext);
            expect(formService['environmentContext']).toStrictEqual(envContext);
            expect(spyHasEnvironmentInformation).toHaveBeenCalled();
            expect(spyLogDebug).toHaveBeenCalled();
            expect(spyLogInfo).toHaveBeenCalled();
            expect(spyCommand).toHaveBeenCalled();
            expect(spyCreateEnvironmentContextFromXml).toHaveBeenCalled();
            done();
        });
    });

    it('should return environment context by M3USER_OPT w/o document from getEnvironmentContext', (done) => {
        const envContext: IEnvironmentContext = { isMultiTenant: false, ionApiUrl: null!, version: null! };
        const spyHasEnvironmentInformation = jest.spyOn(formService as any, 'hasEnvironmentInformation').mockImplementation(() => false);
        const spyLogDebug = jest.spyOn(formService as any, 'logDebug').mockImplementation((message) => {
            expect(message).toBe('getEnvironmentContext: Get user information /MvxMCSvt?CMDTP=USER&CMDVAL=M3USER_OPT');
        });
        const spyLogError = jest.spyOn(formService as any, 'logError').mockImplementation((message) => {
            expect(message).toBe('getEnvironmentContext: Unable to get user information from H5. Verify that the H5 version is supported.');
        });
        const spyCommand = jest.spyOn(formService as any, 'command').mockImplementation((type, value): Observable<IFormResponse> => {
            return of({} as IFormResponse);
        });

        formService.getEnvironmentContext().subscribe({
            next: null!, error: context => {
                expect(context).toStrictEqual(envContext);
                expect(formService['environmentContext']).toStrictEqual(envContext);
                expect(spyHasEnvironmentInformation).toHaveBeenCalled();
                expect(spyLogDebug).toHaveBeenCalled();
                expect(spyLogError).toHaveBeenCalled();
                expect(spyCommand).toHaveBeenCalled();
                done();
            }
        });
    });

    it('should return environment context by failed M3USER_OPT from getEnvironmentContext', (done) => {
        const envContext: IEnvironmentContext = { isMultiTenant: false, ionApiUrl: null!, version: null! };
        const spyHasEnvironmentInformation = jest.spyOn(formService as any, 'hasEnvironmentInformation').mockImplementation(() => false);
        const spyLogDebug = jest.spyOn(formService as any, 'logDebug').mockImplementation((message) => {
            expect(message).toBe('getEnvironmentContext: Get user information /MvxMCSvt?CMDTP=USER&CMDVAL=M3USER_OPT');
        });
        const spyLogError = jest.spyOn(formService as any, 'logError').mockImplementation((message) => {
            expect(message).toBe('getEnvironmentContext: Get user information MvxMCSvt?CMDTP=USER&CMDVAL=M3USER_OPT failed.');
        });
        const spyCommand = jest.spyOn(formService as any, 'command').mockImplementation((type, value): Observable<IFormResponse> => {
            return throwError(() => new Error('error'));
        });

        formService.getEnvironmentContext().subscribe({
            next: null!, error: context => {
                expect(context).toStrictEqual(envContext);
                expect(formService['environmentContext']).toStrictEqual(envContext);
                expect(spyHasEnvironmentInformation).toHaveBeenCalled();
                expect(spyLogDebug).toHaveBeenCalled();
                expect(spyLogError).toHaveBeenCalled();
                expect(spyCommand).toHaveBeenCalled();
                done();
            }
        });
    });

    it('should return true/false from hasEnvironmentInformation', () => {
        expect(formService['hasEnvironmentInformation']()).toBe(false);
        formService['userContext'] = { tenant: 'foo' } as IUserContext;
        expect(formService['hasEnvironmentInformation']()).toBe(true);
    });

    it('should return environment context from createEnvironmentContextFromXml', () => {
        const envContext: IEnvironmentContext = { isMultiTenant: false, ionApiUrl: null!, version: null! };
        const emptyDocument = new DOMParser().parseFromString('<?xml version="1.0" encoding="UTF-8"?>', 'text/xml');
        const documentWithoutTenant = new DOMParser().parseFromString('<?xml version="1.0" encoding="UTF-8"?><Root mcv="1.0"></Root>', 'text/xml');
        const documentWithTenantInfor = new DOMParser().parseFromString('<?xml version="1.0" encoding="UTF-8"?><Root mcv="1.0"><Tenant>infor</Tenant></Root>', 'text/xml');
        const documentWithTenantTest = new DOMParser().parseFromString('<?xml version="1.0" encoding="UTF-8"?><Root mcv="1.0"><Tenant>Test</Tenant></Root>', 'text/xml');
        const documentWithIonApiUrl = new DOMParser().parseFromString('<?xml version="1.0" encoding="UTF-8"?><Root mcv="1.0"><Tenant>infor</Tenant><IonApiUrl>foo</IonApiUrl></Root>', 'text/xml');
        const documentWithVersion = new DOMParser().parseFromString('<?xml version="1.0" encoding="UTF-8"?><Root mcv="1.0"><Tenant>infor</Tenant><Version>foo</Version></Root>', 'text/xml');
        const spyLogError = jest.spyOn(formService as any, 'logError').mockImplementation((message) => {
            expect(message).toBe('createEnvironmentContextFromXml: Get user information MvxMCSvt?CMDTP=USER&CMDVAL=M3USER_OPT has no response root.');
        });
        const spyLogWarning = jest.spyOn(formService as any, 'logWarning').mockImplementation((message) => {
            expect(message).toBe('createEnvironmentContextFromXml: Failed to get tenant information from H5. H5 version is: null');
        });

        expect(formService['createEnvironmentContextFromXml'](emptyDocument)).toStrictEqual(envContext);
        expect(formService['createEnvironmentContextFromXml'](documentWithoutTenant)).toStrictEqual(envContext);
        expect(formService['createEnvironmentContextFromXml'](documentWithTenantInfor)).toStrictEqual(envContext);
        expect(formService['createEnvironmentContextFromXml'](documentWithTenantTest)).toStrictEqual({ ...envContext, isMultiTenant: true });
        expect(formService['createEnvironmentContextFromXml'](documentWithIonApiUrl)).toStrictEqual({ ...envContext, ionApiUrl: 'foo/infor' });
        expect(formService['createEnvironmentContextFromXml'](documentWithVersion)).toStrictEqual({ ...envContext, version: 'foo' });
        expect(spyLogWarning).toHaveBeenCalled();
        expect(spyLogError).toHaveBeenCalled();
    });

    it('should return environment context from createEnvironmentContext', () => {
        const userContext: IUserContext = {} as IUserContext;
        const userContextWithTenantInfor: IUserContext = { tenant: 'infor' } as IUserContext;
        const userContextWithTenantTest: IUserContext = { tenant: 'Test' } as IUserContext;
        const userContextWithIonApiUrl: IUserContext = { ionApiUrl: 'foo' } as IUserContext;
        const context: IEnvironmentContext = { isMultiTenant: false, ionApiUrl: null!, version: null! };
        const spyLogWarning = jest.spyOn(formService as any, 'logWarning').mockImplementation((message) => {
            expect(message).toBe('getEnvironmentContext: User context does not contain tenant. Verify that the H5 is version 10.3.1.0.277 or later for on-prem');
        });
        const spyLogInfo = jest.spyOn(formService as any, 'logInfo').mockImplementation((message) => {
            expect(message).toBe('getEnvironmentContext: IonApiUrl foo');
        });

        expect(formService['createEnvironmentContext'](userContext)).toStrictEqual(context);
        expect(formService['createEnvironmentContext'](userContextWithTenantInfor)).toStrictEqual(context);
        expect(formService['createEnvironmentContext'](userContextWithTenantTest)).toStrictEqual({ ...context, isMultiTenant: true });
        expect(formService['createEnvironmentContext'](userContextWithIonApiUrl)).toStrictEqual({ ...context, ionApiUrl: 'foo' });
        expect(spyLogWarning).toHaveBeenCalled();
        expect(spyLogInfo).toHaveBeenCalled();
    });

    it('should handle pending requests in processPending', () => {
        formService['processPending']();

        formService['pending'] = null!;
        formService['processPending']();

        formService['pending'] = [{ subject: null!, request: null! }];
        const spy = jest.spyOn(formService as any, 'executeWithSubject').mockImplementation(() => { });
        formService['processPending']();
        expect(spy).toHaveBeenCalled();
    });

    it('should complete with error in rejectPending', (done) => {
        const response = { message: 'hello' } as IFormResponse;
        const subject = new AsyncSubject<IFormResponse>();
        formService['pending'] = [{ subject: subject, request: null! }];

        subject.subscribe({
            next: null!, error: (resp) => {
                expect(resp).toStrictEqual(response);
                done();
            }
        })
        formService['rejectPending'](response);
    });

    it('should logon with existing session in logon', (done) => {
        formService['hasSession'] = true;
        formService['logon']().subscribe((response) => {
            expect(response).toBeDefined();
            done();
        })
    });

    it('should sucessfully logon without existing session, userContext, userSession in logon', (done) => {
        formService['hasSession'] = false;
        const response = { message: 'hello' } as IFormResponse;
        const subject = new BehaviorSubject<IFormResponse>(response);
        const spyCommand = jest.spyOn(formService as any, 'command').mockImplementation((type, value) => {
            expect(type).toBe('LOGON');
            expect(value).toBeNull();
            return subject.asObservable();
        });
        const spyProcessPending = jest.spyOn(formService as any, 'processPending');
        const spyLogDebug = jest.spyOn(formService as any, 'logDebug').mockImplementation((message) => {
            const messages = [
                'logon: Logging on to H5 user context exists...',
                'logon: H5 logon complete.',
            ];
            expect(messages.includes(message as string)).toBe(true);
        });

        expect(formService['hasSession']).toBe(false);
        formService['logon']().subscribe((response) => {
            expect(response).toStrictEqual(response);
            expect(formService['hasSession']).toBe(true);
            expect(spyCommand).toHaveBeenCalled();
            expect(spyProcessPending).toHaveBeenCalled();
            expect(spyLogDebug).toHaveBeenCalled();
            done();
        })
    });

    it('should erroneous logon without existing session, userContext, userSession in logon', (done) => {
        formService['hasSession'] = false;
        const response = { message: 'hello' } as IFormResponse;
        const subject = new BehaviorSubject<IFormResponse>(response);
        subject.error('error');
        const spyCommand = jest.spyOn(formService as any, 'command').mockImplementation((type, value) => {
            expect(type).toBe('LOGON');
            expect(value).toBeNull();
            return subject.asObservable();
        });
        const spyRejectPending = jest.spyOn(formService as any, 'rejectPending');
        const spyLogDebug = jest.spyOn(formService as any, 'logDebug').mockImplementation((message) => {
            expect(message).toBe('logon: Logging on to H5 user context exists...');
        });
        const spyLogError = jest.spyOn(formService as any, 'logError').mockImplementation((message) => {
            expect(message).toBe('logon: H5 logon failed.');
        });

        expect(formService['hasSession']).toBe(false);
        formService['logon']().subscribe({
            next: null!, error: (response) => {
                expect(response).toBe('error');
                expect(formService['hasSession']).toBe(false);
                expect(spyCommand).toHaveBeenCalled();
                expect(spyRejectPending).toHaveBeenCalled();
                expect(spyLogError).toHaveBeenCalled();
                expect(spyLogDebug).toHaveBeenCalled();
                done();
            }
        });
    });

    it('should sucessfully logon without existing session, userContext but userSession in logon', (done) => {
        formService['hasSession'] = false;
        const response = { message: 'hello' } as IFormResponse;
        const subject = new BehaviorSubject<IFormResponse>(response);
        const userContext = { CONO: '100' } as IUserContext;
        formService['userService'] = { getUserContext: () => of(userContext) } as IUserService;
        const spyCommand = jest.spyOn(formService as any, 'command').mockImplementation((type, value) => {
            expect(type).toBe('LOGON');
            expect(value).toBeNull();
            return subject.asObservable();
        });
        const spyProcessPending = jest.spyOn(formService as any, 'processPending');
        const spyLogDebug = jest.spyOn(formService as any, 'logDebug').mockImplementation((message) => {
            const messages = [
                'logon: Logging on to H5...',
                'logon: H5 logon complete.',
            ];
            expect(messages.includes(message as string)).toBe(true);
        });

        expect(formService['hasSession']).toBe(false);
        formService['logon']().subscribe((response) => {
            expect(response).toStrictEqual(response);
            expect(formService['hasSession']).toBe(true);
            expect(formService['userContext']).toStrictEqual(userContext);
            expect(spyCommand).toHaveBeenCalled();
            expect(spyProcessPending).toHaveBeenCalled();
            expect(spyLogDebug).toHaveBeenCalled();
            done();
        })
    });

    it('should erroneous logon without existing session, userContext but userSession in logon', (done) => {
        formService['hasSession'] = false;
        const response = { message: 'hello' } as IFormResponse;
        const subject = new BehaviorSubject<IFormResponse>(response);
        subject.error('error');
        const userContext = { CONO: '100' } as IUserContext;
        formService['userService'] = { getUserContext: () => of(userContext) } as IUserService;
        const spyCommand = jest.spyOn(formService as any, 'command').mockImplementation((type, value) => {
            expect(type).toBe('LOGON');
            expect(value).toBeNull();
            return subject.asObservable();
        });
        const spyRejectPending = jest.spyOn(formService as any, 'rejectPending');
        const spyLogDebug = jest.spyOn(formService as any, 'logDebug').mockImplementation((message) => {
            expect(message).toBe('logon: Logging on to H5...');
        });
        const spyLogError = jest.spyOn(formService as any, 'logError').mockImplementation((message) => {
            expect(message).toBe('logon: H5 logon failed.');
        });

        expect(formService['hasSession']).toBe(false);
        formService['logon']().subscribe({
            next: null!, error: (response) => {
                expect(response).toBe('error');
                expect(formService['hasSession']).toBe(false);
                expect(formService['userContext']).toStrictEqual(userContext);
                expect(spyCommand).toHaveBeenCalled();
                expect(spyRejectPending).toHaveBeenCalled();
                expect(spyLogError).toHaveBeenCalled();
                expect(spyLogDebug).toHaveBeenCalled();
                done();
            }
        });
    });

    it('should erroneous logon without existing session, userContext but failed userSession in logon', (done) => {
        formService['hasSession'] = false;
        const error = new Error('error');
        formService['userService'] = { getUserContext: () => throwError(() => error) } as unknown as IUserService;
        const spyRejectPending = jest.spyOn(formService as any, 'rejectPending').mockImplementation((param) => {
            expect(param).toStrictEqual(error);
        });
        const spyLogError = jest.spyOn(formService as any, 'logError').mockImplementation((message) => {
            expect(message).toBe('Failed to get user context');
        });

        expect(formService['hasSession']).toBe(false);
        formService['logon']().subscribe({
            next: null!, error: (response) => {
                expect(response).toStrictEqual(error);
                expect(formService['hasSession']).toBe(false);
                expect(formService['userContext']).toBeUndefined();
                expect(spyRejectPending).toHaveBeenCalled();
                expect(spyLogError).toHaveBeenCalled();
                done();
            }
        });
    });

    it('should quit session in logoff', (done) => {
        const response = { message: 'hello' } as IFormResponse;
        const subject = new BehaviorSubject<IFormResponse>(response);
        const spyCommand = jest.spyOn(formService as any, 'command').mockImplementation((type, value) => {
            expect(type).toBe('QUIT');
            expect(value).toBeNull();
            return subject.asObservable()
        });
        formService['hasSession'] = true;
        formService['logoff']().subscribe((resp) => {
            expect(resp).toStrictEqual(response);
            expect(formService['hasSession']).toBe(false);
            done();
        });
    });

    it('should send command', (done) => {
        const request = { commandType: 'foo', commandValue: 'bar', sessionId: '12345' } as IFormRequest;
        const response = { message: 'hello' } as IFormResponse;
        const spyExecute = jest.spyOn(formService as any, 'execute').mockImplementation((req) => {
            expect(req).toStrictEqual(request);
            return of(response);
        });

        formService['sessionId'] = request.sessionId!;
        formService['command'](request.commandType!, request.commandValue!).subscribe((resp: IFormResponse) => {
            expect(resp).toStrictEqual(response);
            expect(spyExecute).toHaveBeenCalled();
            done();
        });
    });

    it('should send request in execute', (done) => {
        const request = { commandType: 'foo' } as IFormRequest;
        const response = { message: 'hello' } as IFormResponse;
        const spyExecuteWithSubject = jest.spyOn(formService as any, 'executeWithSubject').mockImplementation((sub_, req) => {
            const sub = sub_ as AsyncSubject<IFormResponse>;
            sub.next(response);
            sub.complete();
            return sub.asObservable();
        });
        formService['execute'](request).subscribe((resp) => {
            expect(resp).toStrictEqual(response);
            expect(spyExecuteWithSubject).toHaveBeenCalled();
            done();
        });
    });

    it('should send request with session in executeWithSession', (done) => {
        const request = { commandType: 'foo' } as IFormRequest;
        const response = { message: 'hello' } as IFormResponse;
        formService['hasSession'] = true;
        const spyExecute = jest.spyOn(formService as any, 'execute').mockImplementation((req) => {
            expect(req).toStrictEqual(request);
            return of(response);
        })
        const spyLogDebug = jest.spyOn(formService as any, 'logDebug').mockImplementation((message) => {
            expect(message).toBe('executeWithSession: Using existing session')
        });

        formService['executeWithSession'](request).subscribe((resp) => {
            expect(resp).toStrictEqual(response);
            expect(spyExecute).toHaveBeenCalled();
            expect(spyLogDebug).toHaveBeenCalled();
            done();
        });
    });

    it('should send request without session in executeWithSession', (done) => {
        const request = { commandType: 'foo' } as IFormRequest;
        const response = { message: 'hello' } as IFormResponse;
        formService['hasSession'] = false;
        const spyPendingPush = jest.spyOn(formService['pending'], 'push').mockImplementation((req) => {
            expect(req.request).toStrictEqual(request);
            req.subject.next(response);
            req.subject.complete();
            return 1;
        })
        const spyLogDebug = jest.spyOn(formService as any, 'logDebug').mockImplementation((message) => {
            expect(message).toBe('executeWithSession: No session, execution delayed.')
        });
        const spyLogon = jest.spyOn(formService as any, 'logon').mockImplementation(() => { });

        formService['executeWithSession'](request).subscribe((resp) => {
            expect(resp).toStrictEqual(response);
            expect(spyPendingPush).toHaveBeenCalled();
            expect(spyLogDebug).toHaveBeenCalled();
            expect(spyLogon).toHaveBeenCalled();
            done();
        });
    });

    it('shoud successfully send request in executeWithSubject', (done) => {
        const request = { commandType: 'foo', resolver: () => { } } as IFormRequest;
        const response = { message: 'hello' } as IFormResponse;
        const userContext = { CONO: '100' } as IUserContext;
        const subject = new AsyncSubject<IFormResponse>();
        const httpRequest = { method: 'POST' } as IHttpRequest;
        const httpResponse = { body: 'hello' } as IHttpResponse;
        formService['sessionId'] = '12345';
        formService['userContext'] = userContext;
        const spyLogDebug = jest.spyOn(formService as any, 'logDebug').mockImplementation((message) => {
            expect(message).toBe('executeWithSubject: Executing request foo ');
        });
        const spyResolver = jest.spyOn(request as any, 'resolver').mockImplementation((req, context) => {
            expect(req).toStrictEqual(request);
            expect(context).toStrictEqual(userContext);
        });
        const spyCreateHttpRequest = jest.spyOn(formService as any, 'createHttpRequest').mockImplementation((req) => {
            expect(req).toStrictEqual(request);
            return httpRequest;
        });
        const spyHttpServiceExecute = jest.spyOn(formService['httpService']!, 'execute').mockImplementation((req) => {
            expect(req).toStrictEqual(httpRequest);
            return of(httpResponse);
        });
        const spyParseResponse = jest.spyOn(formService as any, 'parseResponse').mockImplementation((req, content) => {
            expect(req).toStrictEqual(request);
            expect(content).toBe(httpResponse.body);
            return response;
        });
        const spyProcessPending = jest.spyOn(formService as any, 'processPending').mockImplementation(() => { });

        formService['executeWithSubject'](subject, request).subscribe((resp) => {
            expect(resp).toStrictEqual(response);
            expect(spyResolver).toHaveBeenCalled();
            expect(spyLogDebug).toHaveBeenCalled();
            expect(spyCreateHttpRequest).toHaveBeenCalled();
            expect(spyHttpServiceExecute).toHaveBeenCalled();
            expect(spyParseResponse).toHaveBeenCalled();
            expect(spyProcessPending).toHaveBeenCalled();
            done();
        });
    });

    it('shoud erroneous send request in executeWithSubject', (done) => {
        const request = { commandType: 'foo', resolver: () => { } } as IFormRequest;
        const response = { message: 'hello' } as IFormResponse;
        const userContext = { CONO: '100' } as IUserContext;
        const subject = new AsyncSubject<IFormResponse>();
        const httpRequest = { method: 'POST' } as IHttpRequest;
        const httpResponse = { body: 'hello' } as IHttpResponse;
        formService['sessionId'] = '12345';
        formService['userContext'] = userContext;
        const spyLogDebug = jest.spyOn(formService as any, 'logDebug').mockImplementation((message) => {
            expect(message).toBe('executeWithSubject: Executing request foo ');
        });
        const spyResolver = jest.spyOn(request as any, 'resolver').mockImplementation((req, context) => {
            expect(req).toStrictEqual(request);
            expect(context).toStrictEqual(userContext);
        });
        const spyCreateHttpRequest = jest.spyOn(formService as any, 'createHttpRequest').mockImplementation((req) => {
            expect(req).toStrictEqual(request);
            return httpRequest;
        });
        const spyHttpServiceExecute = jest.spyOn(formService['httpService']!, 'execute').mockImplementation((req) => {
            expect(req).toStrictEqual(httpRequest);
            return throwError(() => httpResponse);
        });
        const spyCreateError = jest.spyOn(formService as any, 'createError').mockImplementation((resp) => {
            expect(resp).toStrictEqual(httpResponse);
            return response;
        });
        const spyProcessPending = jest.spyOn(formService as any, 'processPending').mockImplementation(() => { });

        formService['executeWithSubject'](subject, request).subscribe({
            next: null!, error: (resp) => {
                expect(resp).toStrictEqual(response);
                expect(spyResolver).toHaveBeenCalled();
                expect(spyLogDebug).toHaveBeenCalled();
                expect(spyCreateHttpRequest).toHaveBeenCalled();
                expect(spyHttpServiceExecute).toHaveBeenCalled();
                expect(spyCreateError).toHaveBeenCalled();
                expect(spyProcessPending).toHaveBeenCalled();
                done();
            }
        });
    });

    it('should create http request', () => {
        const request = { commandType: 'foo' } as IFormRequest;
        const httpRequest = {
            method: 'POST', url: '/mne/servlet/MvxMCSvt', body: 'hello', headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
        };
        const spyCreateParams = jest.spyOn(formService as any, 'createParams').mockImplementation((req) => {
            expect(req).toStrictEqual(request);
            return request.commandType;
        });
        const spyCreateBody = jest.spyOn(formService as any, 'createBody').mockImplementation((params) => {
            expect(params).toBe(request.commandType);
            return httpRequest.body;
        });

        expect(formService['createHttpRequest'](request)).toStrictEqual(httpRequest);
        expect(spyCreateParams).toHaveBeenCalled();
        expect(spyCreateBody).toHaveBeenCalled();
    });

    it('should create http request body', () => {
        const params = { foo: 'bar', hello: 'world' };
        expect(formService['createBody'](params)).toBe('foo=bar&hello=world');
    });

    it('should create response error', () => {
        const response = new FormResponse();
        response.result = -1;
        const spyLogError = jest.spyOn(formService as any, 'logError').mockImplementation((message) => {
            expect(message).toBe('createError: Failed to execute request');
        });
        expect(formService['createError']({} as IHttpResponse)).toStrictEqual(response);
        expect(spyLogError).toHaveBeenCalled();
    });

    it('should add param to array', () => {
        const params = { foo: 'bar' };
        const input = {};
        formService['addParam'](input, 'foo', 'bar');
        expect(input).toStrictEqual(params);
        formService['addParam'](input, 'hello', null);
        expect(input).toStrictEqual(params);
    });

    it('should create all necessary params', () => {
        const request = { commandType: 'LOGON', commandValue: 'hello', sessionId: '12345', instanceId: '09876', params: { foo: 'bar' } } as IFormRequest;
        const expectedParams = { CLIENT: 'WebUI', CMDTP: request.commandType, CMDVAL: request.commandValue, SID: request.sessionId, IID: request.instanceId, foo: 'bar' };

        const params = formService['createParams'](request);
        expect(params['RID']).toBeDefined();
        delete params.RID;
        expect(params).toStrictEqual(expectedParams);
    });

    it('should parse response', () => {
        const request = { commandType: 'LOGON' } as IFormRequest;
        const response = { message: 'hello', sessionId: '12345', userData: 'user', principalUser: 'prince', request } as FormResponse
        const spyParse = jest.spyOn(FormParser, 'parse').mockImplementation(() => {
            return response;
        });
        const spyUpdateUserContextAfterLogon = jest.spyOn(formService as any, 'updateUserContextAfterLogon').mockImplementation((userData, principalUser) => {
            expect(userData).toBe(response.userData);
            expect(principalUser).toBe(response.principalUser);
        });

        expect(formService['parseResponse'](request, '')).toStrictEqual(response);
        expect(spyParse).toHaveBeenCalled();
        expect(spyUpdateUserContextAfterLogon).toHaveBeenCalled();
    });

    it('should update user context', () => {
        const userData = 'foo';
        const principalUser = 'bar';
        formService['userService'] = { updateUserContext: (context: IUserContext, principalUser: string): any => { } } as IUserService;
        const spyUpdateUserContext = jest.spyOn(formService['userService'], 'updateUserContext').mockImplementation((context, pUser) => {
            expect(context).toBe(userData);
            expect(pUser).toBe(principalUser);
        });

        formService['updateUserContextAfterLogon'](userData, principalUser);
        expect(spyUpdateUserContext).toHaveBeenCalled();
    });
});