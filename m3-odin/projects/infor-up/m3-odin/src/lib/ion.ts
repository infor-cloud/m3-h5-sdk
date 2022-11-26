import { AsyncSubject, Observable } from 'rxjs';
import { CoreBase } from './base';
import { IFormService } from './form/types';
import { IHttpRequest, IHttpResponse, IHttpService, IIonApiContext, IIonApiOptions, IIonApiRequest, IIonApiResponse, IIonApiService } from './types';
import { CoreUtil, HttpUtil, StringUtil } from './util';

/**
 * @hidden
 * @since 2.0.0
 */
class IonApiContext implements IIonApiContext {
   constructor(private url: string, private token: string) {
   }

   getUrl(): string {
      return this.url;
   }

   getToken(): string {
      return this.token;
   }

   setToken(token: string): void {
      this.token = token;
   }

   getHeaderName(): string {
      return 'Authorization';
   }

   getHeaderValue(): string {
      return 'Bearer ' + this.token;
   }
}

/**
 * Defines ION API constants.
 *
 * ```typescript
 * import { IonApiConstants } from '@infor-up/m3-odin';
 * ```
 *
 * @since 2.0.0
 */
export class IonApiConstants {
   /**
	 * Gets the name of the header used to specify the platform that is calling ION API.
	 * The header value should always be "homepages", specified in the platformHeaderValue property.
	 */
   static platformHeaderName = 'x-infor-ionapi-platform';

   /**
	 * Gets the ION API platform header value to use.
	 */
   static platformHeaderValue = 'm3-odin';

   /**
	 * Gets the name of the header used to specify the source that is calling ION API.
	 * The value should be the standard widget ID of the calling widget.
	 */
   static sourceHeaderName = 'x-infor-ionapi-source';
}

/**
 * ION API service implementation.
 *
 * ```typescript
 * import { IonApiServiceCore } from '@infor-up/m3-odin';
 * ```
 *
 * @since 2.0.0
 */
export class IonApiServiceCore extends CoreBase implements IIonApiService {
   private readonly sourcePrefix = 'm3-odin-';
   private context: IonApiContext;
   private url: string;
   private token: string;
   private pending: AsyncSubject<IIonApiContext>[];
   private isDev = false;

   constructor(private httpService: IHttpService, private formService: IFormService) {
      super('IonApiServiceCore');
   }

   setUrl(url: string): void {
      this.url = url;
   }

   setDevelopmentToken(token: string): void {
      if (!HttpUtil.isLocalhost()) {
         throw new Error('Development tokens are only allowed for localhost');
      }

      this.isDev = true;
      this.context = new IonApiContext('/ODIN_DEV_TENANT', token);
   }

   getContext(options?: IIonApiOptions): Observable<IIonApiContext> {
      const subject = new AsyncSubject<IIonApiContext>();
      const refresh = this.context && options && options.refresh; // Don't refresh first time (when no context set)
      const context = this.context;

      // Check if a context has been loaded and the caller do not require a refresh
      if (context && !refresh) {
         subject.next(context);
         subject.complete();
         return subject.asObservable();
      }

      // Check for any pending requests to avoid duplicate calls to get the token
      const pending = this.pending;
      if (pending && pending.length > 0) {
         // A load request is already in progress, queue this deferred
         pending.push(subject);
      } else {
         // Start a new load request
         this.pending = [subject];
         this.loadToken(refresh);
      }

      return subject.asObservable();
   }

   execute(options: IIonApiRequest): Observable<IIonApiResponse> {
      let source = options.source;
      if (!source) {
         throw new Error('No source specified');
      }

      source = this.sourcePrefix + source;
      const subject = new AsyncSubject<IIonApiResponse>();
      this.getContext().subscribe((context: IIonApiContext) => {
         this.executeApi(context, options, source, subject, false);
      }, (r) => {
         subject.error(r);
      });
      return subject.asObservable();
   }

   private executeApi<T>(context: IIonApiContext,
      options: IIonApiRequest,
      source: string,
      subject: AsyncSubject<IIonApiResponse>,
      isRetry: boolean): void {
      options = Object.assign({}, options);
      const url = options.url;
      if (url && url.indexOf('https://') !== 0) {
         // Prepend the ION API base URL to the relative URL
         options.url = HttpUtil.combine(context.getUrl(), url);
      }

      // Add the authorization header for ION API including the OAuth token.
      const headers = options.headers || {};
      headers[context.getHeaderName()] = context.getHeaderValue();
      headers[IonApiConstants.platformHeaderName] = IonApiConstants.platformHeaderValue;
      headers[IonApiConstants.sourceHeaderName] = source;
      options.headers = headers;

      const isDebug = this.isDebug();
      let logSuffix = '';
      if (isDebug) {
         logSuffix = options.url + ' (' + (source || '') + ')';
         this.logDebug('executeApi: Executing ' + logSuffix);
      }

      this.httpService.execute(options).subscribe((httpResponse: IHttpResponse) => {
         if (isDebug) {
            this.logDebug('executeApi: Executed ' + logSuffix);
         }
         // Resolve successful request.
         const response = httpResponse as IIonApiResponse;
         response.isRetry = isRetry;
         subject.next(response);
         subject.complete();
      }, (error: IHttpResponse) => {
         // Check if the failed request should be retried with a new ION API context.
         if (!isRetry && this.canRetry(options, error.status)) {
            this.getContext({ refresh: true }).subscribe((retryContext: IIonApiContext) => {
               this.executeApi(retryContext, options, source, subject, true);
            }, (retryError) => {
               // Reject when a new context cannot be retrieved.
               subject.error(retryError);
            });
         } else {
            // Reject failed retry attemtps or when retry is disabled.
            subject.error(error);
         }
      });
   }

   private loadToken(isForceRefresh: boolean): void {
      this.token = null; // Clear the pre-loaded token that is no longer valid
      const pending = this.pending;
      let context = this.context;
      const force = isForceRefresh ? 'forceRefresh=true&' : '';
      const url = '/grid/rest/security/sessions/oauth?' + force + 'rid=' + CoreUtil.random();

      const request: IHttpRequest = {
         method: 'GET',
         url: url,
         responseType: 'text'
      };

      this.httpService.execute(request).subscribe((response: IHttpResponse) => {
         const token = response.body as string;
         if (context) {
            // Update the token in the existing context
            context.setToken(token);
         } else {
            context = new IonApiContext(this.url, token);
            this.context = context;
         }
         // Check if URL has been set if not try and get it from h5
         if (StringUtil.isNullOrEmpty(context.getUrl())) {
            const message = 'ION base url is not set. ' + (this.isDev ?
               // eslint-disable-next-line max-len
               'Using relative path in Dev mode, in production the ION URL can be set with setUrl, if not set it will be automatically retreived from H5.' :
               'getEnvironmentContext will be called to lookup ION URL');
            this.logInfo(message);
            this.formService.getEnvironmentContext().subscribe((envContext) => {
               const baseUrl = envContext.ionApiUrl;
               if (StringUtil.isNullOrEmpty(baseUrl)) {
                  // eslint-disable-next-line max-len
                  this.logError('loadToken:  Failed to resolve ION Base URL. ION Base URL is null. Verify that it has been set as a grid property in the MUA Server, or set it by calling setUrl.');
                  this.reject(pending, response);
               } else {
                  this.setUrl(baseUrl);
                  this.context = new IonApiContext(this.url, context.getToken());
                  this.resolve(pending, this.context);
               }
            },
               (err) => {
                  this.logError('loadToken: Failed to resolve ION Base URL ' + err);
                  this.reject(pending, response);
               });
         } else {
            this.resolve(pending, context);
         }
      }, response => {
         // Failed to load the token
         this.reject(pending, response);
      });
   }

   private canRetry(options: IIonApiRequest, status: number): boolean {
      return status === 401 && options.ionApiRetry !== false;
   }

   private resolve<T>(items: AsyncSubject<T>[], value: any): void {
      for (const item of items) {
         try {
            item.next(value);
            item.complete();
         } catch (ignore) {
         }
      }
      // Clear the array
      items.splice(0, items.length);
   }

   private reject<T>(items: AsyncSubject<T>[], reason: any): void {
      for (const item of items) {
         try {
            item.error(reason);
         } catch (ignore) {
         }
      }
      // Clear the array
      items.splice(0, items.length);
   }
}
