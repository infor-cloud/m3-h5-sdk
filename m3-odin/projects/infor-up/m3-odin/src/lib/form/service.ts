import { AsyncSubject, Observable } from 'rxjs';
import { CoreBase } from '../base';
import { AjaxHttpService } from '../http';
import { IUserContext, IUserService } from '../m3/types';
import { IHttpRequest, IHttpResponse, IHttpService } from '../types';
import { CoreUtil, HttpUtil, StringUtil } from '../util';
import {
   Bookmark,
   FormResponse,
   IFormRequest,
   IFormResponse,
   ITranslationJob,
   ITranslationRequest,
   ITranslationResponse,
} from './base';
import { FormParser, XmlUtil } from './parser';
import { Translator } from './runtime';
import {
   IBookmark,
   IEnvironmentContext,
   IFormService,
   ISearchRequest,
} from './types';

interface IPendingRequest {
   subject: AsyncSubject<IFormResponse>;
   request: IFormRequest;
}

/**
 * @hidden
 * @since 2.0.0
 */
export class FormServiceCore extends CoreBase implements IFormService {
   private readonly url = '/mne/servlet/MvxMCSvt';
   private userContext: IUserContext;
   private environmentContext: IEnvironmentContext;
   private hasSession = false;
   private sessionId: string;
   private pending: IPendingRequest[] = [];
   private translator: Translator;

   constructor(
      private httpService?: IHttpService,
      private userService?: IUserService
   ) {
      super('FormServiceCore');

      if (!httpService) {
         this.httpService = new AjaxHttpService();
      }
   }

   executeCommand(
      commandType: string,
      commandValue?: string,
      params?: any
   ): Observable<IFormResponse> {
      const request: IFormRequest = {
         commandType: commandType,
         commandValue: commandValue,
         params: params,
      };
      return this.executeWithSession(request);
   }

   executeRequest(request: IFormRequest): Observable<IFormResponse> {
      return this.executeWithSession(request);
   }

   executeBookmark(bookmark: IBookmark): Observable<IFormResponse> {
      if (bookmark.isStateless !== false) {
         bookmark.isStateless = true;
      }

      const request: IFormRequest = {
         commandType: 'RUN',
         commandValue: 'BOOKMARK',
         resolver: (r: IFormRequest, userContext: IUserContext) => {
            r.params = Bookmark.toParams(bookmark, userContext);
         },
      };
      return this.executeWithSession(request);
   }

   executeSearch(request: ISearchRequest): Observable<IFormResponse> {
      const program = request.program;
      const query = request.query;

      this.validate('program', program);
      this.validate('query', query);

      const formRequest: IFormRequest = {
         commandType: 'RUN',
         commandValue: 'SEARCH',
         params: {
            STATELESS: true,
            SEARCH_PROGRAM: program,
            SEARCH_QUERY: query,
            SEARCH_VIEW: request.view || '',
            SEARCH_INQUIRY_TYPE: request.sortingOrder || '',
            SEARCH_FILTER_FIELDS: this.getFilterFields(request),
            SEARCH_START_PANEL_FIELDS: this.getStartPanelFields(request),
         },
      };
      return this.executeWithSession(formRequest);
   }

   validate(name: string, value: string): void {
      if (!value) {
         throw new Error('The ' + name + ' property is mandatory');
      }
   }

   private getFilterFields(request: ISearchRequest): string {
      const fields = request.filterFields;
      return fields && fields.length > 0 ? fields.join(',') : '';
   }

   private getStartPanelFields(request: ISearchRequest): string {
      let values = '';
      const fields = request.startPanelFields;
      if (fields) {
         for (const field of Object.keys(fields)) {
            let value = fields[field];
            if (value == null || value.length === 0) {
               value = ' '; // Use space for optional values
            }
            if (values.length > 0) {
               values += ',';
            }
            values += field;
            values += ',';
            values += encodeURIComponent(value);
         }
      }
      return values;
   }

   translate(request: ITranslationRequest): Observable<ITranslationResponse> {
      const subject = new AsyncSubject<ITranslationResponse>();
      if (!this.translator) {
         this.translator = new Translator();
      }

      const job = this.translator.translate(request);
      if (job) {
         job.sessionId = this.sessionId;

         const options = this.createHttpRequest(job);
         this.httpService.execute(options).subscribe(
            (httpResponse) => {
               subject.next(this.onTranslate(job, httpResponse.body));
               subject.complete();
            },
            (httpResponse) => {
               subject.error(this.createError(httpResponse));
            }
         );
      } else {
         // Resolve directly using the request as the response
         subject.next(request as ITranslationResponse);
         subject.complete();
      }
      return subject.asObservable();
   }

   private onTranslate(job: ITranslationJob, data: any): ITranslationResponse {
      this.translator.parseResponse(job, data);
      job.params = null;
      return job;
   }

   /**
    * Optional Development method that can be used to force a specific development context.
    * Should only be used under development.
    * @param context Context to be used in development.
    */
   developmentSetEnvironmentContext(context: IEnvironmentContext) {
      this.environmentContext = context;
   }

   getEnvironmentContext(): Observable<IEnvironmentContext> {
      const subject = new AsyncSubject<IEnvironmentContext>();

      if (this.environmentContext) {
         subject.next(this.environmentContext);
         subject.complete();
      } else {
         let context: IEnvironmentContext = {
            ionApiUrl: null,
            isMultiTenant: false,
            version: null,
         };
         // Check if user context has the information needed
         // If not call https://servername:40004/mne/servlet/MvxMCSvt?CMDTP=USER&CMDVAL=M3USER_OPT  to get it.
         // The M3USER_OPT flag is that it is optional to get the M3User, eg we will get it if there is a session.
         // Note that the app developer has to get the usercontext from a logon if that is a requirement for the application
         if (this.hasEnvironmentInformation()) {
            // Usercontext should have the information needed
            this.logDebug(
               'getEnvironmentContext: user has tenantid set, getting data from user context'
            );
            context = this.createEnvironmentContext(this.userContext);
            this.logInfo('getEnvironmentContext: ' + JSON.stringify(context));
            this.environmentContext = context;
            subject.next(context);
            subject.complete();
         } else {
            this.logDebug(
               'getEnvironmentContext: Get user information /MvxMCSvt?CMDTP=USER&CMDVAL=M3USER_OPT'
            );
            this.command('USER', 'M3USER_OPT').subscribe(
               (r) => {
                  const document = r.document;
                  if (document) {
                     context = this.createEnvironmentContextFromXml(document);
                     this.environmentContext = context;
                     this.logInfo(
                        'getEnvironmentContext: ' + JSON.stringify(context)
                     );
                     subject.next(context);
                     subject.complete();
                  } else {
                     this.logError(
                        'getEnvironmentContext: Unable to get user information from H5. Verify that the H5 version is supported.'
                     );
                     this.environmentContext = context;
                     subject.error(context);
                  }
               },
               (r) => {
                  this.logError(
                     'getEnvironmentContext: Get user information MvxMCSvt?CMDTP=USER&CMDVAL=M3USER_OPT failed.'
                  );
                  this.environmentContext = context;
                  subject.error(context);
               }
            );
         }
      }

      return subject.asObservable();
   }

   private hasEnvironmentInformation(): boolean {
      // Check if tenant is set as this information is not in a userContext created from MNS150 it would indicate that we
      // have called login and added information to the user context, including the tenant
      if (this.userContext) {
         return !StringUtil.isNullOrEmpty(this.userContext.tenant);
      } else {
         return false;
      }
   }

   private createEnvironmentContextFromXml(document: Document) {
      const context: IEnvironmentContext = {
         isMultiTenant: false,
         ionApiUrl: null,
         version: null,
      };
      const root = FormParser.selectRoot(document);
      if (root) {
         const tenantId = XmlUtil.getElement(root, 'Tenant');
         const version = XmlUtil.getElement(root, 'Version');
         const ionApiUrl = XmlUtil.getElement(root, 'IonApiUrl');
         if (StringUtil.isNullOrEmpty(tenantId)) {
            this.logWarning(
               'createEnvironmentContextFromXml: Failed to get tenant information from H5. H5 version is: ' +
                  version
            );
            return context;
         } else {
            context.isMultiTenant = !(tenantId === 'infor');
            if (!StringUtil.isNullOrEmpty(ionApiUrl)) {
               context.ionApiUrl = HttpUtil.combine(ionApiUrl, tenantId);
            }
            if (!StringUtil.isNullOrEmpty(version)) {
               context.version = version;
            }
         }
      } else {
         this.logError(
            'createEnvironmentContextFromXml: Get user information MvxMCSvt?CMDTP=USER&CMDVAL=M3USER_OPT has no response root.'
         );
      }
      return context;
   }

   private createEnvironmentContext(
      userContext: IUserContext
   ): IEnvironmentContext {
      const context: IEnvironmentContext = {
         isMultiTenant: false,
         ionApiUrl: null,
         version: null,
      };
      const tenant = userContext.tenant;
      const ionApiUrl = userContext.ionApiUrl;
      if (tenant) {
         context.isMultiTenant = !(tenant === 'infor');
      } else {
         // eslint-disable-next-line max-len
         this.logWarning(
            'getEnvironmentContext: User context does not contain tenant. Verify that the H5 is version 10.3.1.0.277 or later for on-prem'
         );
      }
      if (ionApiUrl) {
         this.logInfo('getEnvironmentContext: IonApiUrl ' + ionApiUrl);
         context.ionApiUrl = ionApiUrl;
      }
      return context;
   }

   private processPending(): void {
      const pending = this.pending;
      if (!pending || pending.length === 0) {
         return;
      }

      const item = pending.shift();
      this.executeWithSubject(item.subject, item.request);
   }

   private rejectPending(response: IFormResponse): void {
      for (const pending of this.pending) {
         pending.subject.error(response);
      }
   }

   private logon(): Observable<IFormResponse> {
      const subject = new AsyncSubject<IFormResponse>();

      if (this.hasSession) {
         this.logDebug('logon: Existing session returned');
         const response = new FormResponse();
         subject.next(response);
         subject.complete();
      } else {
         if (!this.userContext && this.userService) {
            // Need to get user context
            this.userService.getUserContext().subscribe(
               (userContext: IUserContext) => {
                  this.userContext = userContext;
                  this.logDebug('logon: Logging on to H5...');
                  this.command('LOGON', null).subscribe(
                     (r) => {
                        this.logDebug('logon: H5 logon complete.');
                        this.hasSession = true;
                        subject.next(r);
                        subject.complete();
                        this.processPending();
                     },
                     (r) => {
                        this.logError('logon: H5 logon failed.');
                        subject.error(r);
                        this.rejectPending(r);
                     }
                  );
               },
               (userContextError) => {
                  this.logError('Failed to get user context');
                  subject.error(userContextError);
                  this.rejectPending(userContextError);
               }
            );
         } else {
            this.logDebug('logon: Logging on to H5 user context exists...');
            this.command('LOGON', null).subscribe(
               (r) => {
                  this.logDebug('logon: H5 logon complete.');
                  this.hasSession = true;
                  subject.next(r);
                  subject.complete();
                  this.processPending();
               },
               (r) => {
                  this.logError('logon: H5 logon failed.');
                  subject.error(r);
                  this.rejectPending(r);
               }
            );
         }
      }

      return subject.asObservable();
   }

   private logoff(): Observable<IFormResponse> {
      const observable = this.command('QUIT', null);
      this.hasSession = false;
      return observable;
   }

   private command(type: string, value: string): Observable<IFormResponse> {
      const request: IFormRequest = {
         commandType: type,
      };
      if (value) {
         request.commandValue = value;
      }
      if (this.sessionId) {
         request.sessionId = this.sessionId;
      }
      return this.execute(request);
   }

   private execute(request: IFormRequest): Observable<IFormResponse> {
      const subject = new AsyncSubject<IFormResponse>();
      return this.executeWithSubject(subject, request);
   }

   private executeWithSession(
      request: IFormRequest
   ): Observable<IFormResponse> {
      if (this.hasSession) {
         this.logDebug('executeWithSession: Using existing session');
         return this.execute(request);
      }

      this.logDebug('executeWithSession: No session, execution delayed.');

      const subject = new AsyncSubject<IFormResponse>();
      this.pending.push({
         subject: subject,
         request: request,
      });

      this.logon();

      return subject.asObservable();
   }

   private executeWithSubject(
      subject: AsyncSubject<IFormResponse>,
      request: IFormRequest
   ): Observable<IFormResponse> {
      this.logDebug(
         'executeWithSubject: Executing request ' +
            request.commandType +
            ' ' +
            (request.commandValue || '')
      );

      if (!request.sessionId) {
         request.sessionId = this.sessionId;
      }

      const resolver = request.resolver;
      if (resolver) {
         resolver(request, this.userContext);
      }

      const httpRequest = this.createHttpRequest(request);
      this.httpService.execute(httpRequest).subscribe(
         (httpResponse: IHttpResponse) => {
            const response = this.parseResponse(request, httpResponse.body);
            subject.next(response);
            subject.complete();
            this.processPending();
         },
         (httpResponse: IHttpResponse) => {
            subject.error(this.createError(httpResponse));
            this.processPending();
         }
      );

      return subject.asObservable();
   }

   private createHttpRequest(request: IFormRequest): IHttpRequest {
      const params = this.createParams(request);
      const body = this.createBody(params);
      return {
         method: 'POST',
         url: this.url,
         body: body,
         headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
         },
      };
   }

   private createBody(params: any): string {
      const str = [];
      for (const p of Object.keys(params)) {
         str.push(encodeURIComponent(p) + '=' + encodeURIComponent(params[p]));
      }
      return str.join('&');
   }

   private createError(httpResponse: IHttpResponse): IFormResponse {
      // TODO Extract HTTP code etc from the response
      this.logError('createError: Failed to execute request');
      const response = new FormResponse();
      response.result = -1;
      return response;
   }

   private addParam(params: any, name: string, value: any) {
      if (value) {
         params[name] = value;
      }
   }

   private createParams(request: IFormRequest): any {
      const params = {};
      if (request.params) {
         Object.assign(params, request.params);
      }

      const commandType = request.commandType;
      if (commandType === 'LOGON') {
         this.addParam(params, 'CLIENT', 'WebUI');
      }
      this.addParam(params, 'CMDTP', commandType);
      this.addParam(params, 'CMDVAL', request.commandValue);
      this.addParam(params, 'SID', request.sessionId);
      this.addParam(params, 'IID', request.instanceId);
      this.addParam(params, 'RID', CoreUtil.random());

      return params;
   }

   private parseResponse(request: IFormRequest, content: any): IFormResponse {
      const response = FormParser.parse(content);
      response.request = request;
      if (!this.sessionId) {
         this.sessionId = response.sessionId;
      }
      if (response.request.commandType === 'LOGON' && response.userData) {
         this.updateUserContextAfterLogon(
            response.userData,
            response.principalUser
         );
      }
      return response;
   }

   private updateUserContextAfterLogon(userData: any, principalUser: string) {
      if (this.userService) {
         this.userService.updateUserContext(userData, principalUser);
      }
   }
}
