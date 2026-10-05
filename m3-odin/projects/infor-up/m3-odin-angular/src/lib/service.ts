import { HttpClient } from '@angular/common/http';
import { Inject, Injectable, InjectionToken, Optional } from '@angular/core';
import { ApplicationServiceCore, CoreBase, FormServiceCore, IApplicationService, IBookmark, IEnvironmentContext, IFormRequest, IFormResponse, IFormService, IHttpRequest, IHttpResponse, IHttpService, IIonApiContext, IIonApiOptions, IIonApiRequest, IIonApiResponse, IIonApiService, IMIRequest, IMIResponse, IMIService, IonApiServiceCore, ISearchRequest, ITranslationRequest, ITranslationResponse, IUserContext, IUserService, MIServiceCore, UserServiceCore } from '@infor-up/m3-odin';
import { Observable } from 'rxjs';

/**
 * @hidden
 * Angular HttpClient wrapper implementing the IHttpService interface.
 * Using Angular's HttpClient ensures proper change detection in zoneless applications.
 */
class AngularHttpService implements IHttpService {
   constructor(private http: HttpClient, private config?: IIonApiConfig) {
   }

   execute(request: IHttpRequest): Observable<IHttpResponse> {
      return this.http.request(request.method, request.url, {
         body: request.body,
         responseType: request.responseType,
         headers: request.headers,
         reportProgress: false,
         withCredentials: this.config?.withCredentials,
         observe: 'response'
      });
   }
}

/**
 * Angular implementation of {@link IMIService}
 *
 * ```typescript
 * import { MIService } from '@infor-up/m3-odin-angular';
 * ```
 *
 * See {@link IMIService} for function documentation.
 *
 * This service uses Angular's `HttpClient` internally, ensuring compatibility
 * with zoneless change detection in Angular 20+.
 *
 * @since 2.0.0
 */
@Injectable()
export class MIService implements IMIService {

   private instance: IMIService;

   constructor(http: HttpClient) {
      console.log('[M3 Odin] MIService created - build: 2026-08-04T07:00');
      this.instance = new MIServiceCore(new AngularHttpService(http));
   }

   /**
    * See {@link IMIService.execute}
    */
   execute(request: IMIRequest): Observable<IMIResponse> {
      return this.instance.execute(request);
   }
}

/**
 * Angular implementation of {@link IApplicationService}
 *
 * ```typescript
 * import { ApplicationService } from '@infor-up/m3-odin-angular';
 * ```
 *
 * See {@link IApplicationService} for function documentation.
 *
 * @since 2.0.0
 */
@Injectable()
export class ApplicationService extends CoreBase implements IApplicationService {
   private instance: IApplicationService;

   constructor() {
      super('ApplicationService');
      this.instance = new ApplicationServiceCore();
   }

   /**
    * See {@link IApplicationService.isH5}
    */
   isH5(): boolean {
      return this.instance.isH5();
   }

   /**
    * See {@link IApplicationService.launch}
    */
   launch(link: string): void {
      this.instance.launch(link);
   }
}

/**
 * Angular implementation of {@link IUserService}
 *
 * ```typescript
 * import { UserService } from '@infor-up/m3-odin-angular';
 * ```
 *
 * See {@link IUserService} for function documentation.
 *
 * @since 2.0.0
 */
@Injectable()
export class UserService extends CoreBase implements IUserService {
   private instance: IUserService;

   constructor(miService: MIService) {
      super('UserService');
      this.instance = new UserServiceCore(miService);
   }

   /**
    * See {@link IUserService.getUserContext}
    */
   getUserContext(): Observable<IUserContext> {
      return this.instance.getUserContext();
   }

   /**
    * @hidden
    */
   getUserService(): IUserService {
      return this.instance;
   }

   /**
    * @hidden
    */
   updateUserContext(context: IUserContext, principalUser: string): void {
      this.instance.updateUserContext(context, principalUser);
   }
}

/**
 * Angular implementation of {@link IFormService}
 *
 * ```typescript
 * import { FormService } from '@infor-up/m3-odin-angular';
 * ```
 *
 * See {@link IFormService} for function documentation.
 *
 * @since 2.0.0
 */
@Injectable()
export class FormService extends CoreBase implements IFormService {
   private instance: IFormService;

   constructor(private userService: UserService, http: HttpClient) {
      super('FormService');
      this.instance = new FormServiceCore(new AngularHttpService(http), userService.getUserService());
   }

   /**
    * See {@link IFormService.executeBookmark}
    */
   executeBookmark(bookmark: IBookmark): Observable<IFormResponse> {
      return this.instance.executeBookmark(bookmark);
   }

   /**
    * See {@link IFormService.executeSearch}
    */
   executeSearch(request: ISearchRequest): Observable<IFormResponse> {
      return this.instance.executeSearch(request);
   }

   /**
    * See {@link IFormService.translate}
    */
   translate(request: ITranslationRequest): Observable<ITranslationResponse> {
      return this.instance.translate(request);
   }

   /**
    * See {@link IFormService.getEnvironmentContext}
    */
   getEnvironmentContext(): Observable<IEnvironmentContext> {
      return this.instance.getEnvironmentContext();
   }

   /**
    * Only for development code. Never to be called in production code.
    * See {@link IFormService.developmentSetEnvironmentContext}
    */
   developmentSetEnvironmentContext(context: IEnvironmentContext) {
      this.instance.developmentSetEnvironmentContext(context);
   }

   /**
    * See {@link IFormService.executeRequest}
    */
   executeRequest(request: IFormRequest): Observable<IFormResponse> {
      return this.instance.executeRequest(request);
   }

   /**
    * See {@link IFormService.executeCommand}
    */
   executeCommand(commandType: string, commandValue?: string, params?: any): Observable<IFormResponse> {
      return this.instance.executeCommand(commandType, commandValue, params);
   }
}

/**
 * Interface for the `IonApiConfig` injection token.
 */
export interface IIonApiConfig {
   /**
    * Set the `XMLHttpRequest.withCredentials` property when making requests.
    * @since 3.0.0
    */
   withCredentials?: boolean;
}

/**
 * Injectable ION API Service configuration
 * @since 3.0.0
 */
export const IonApiConfig = new InjectionToken<IIonApiConfig>('IonApiConfig', {
   factory() {
      return { withCredentials: false };
   }
});

/**
 * Angular implementation of {@link IIonApiService}
 *
 * ```typescript
 * import { IonApiService } from '@infor-up/m3-odin-angular';
 * ```
 *
 * See {@link IIonApiService} for function documentation.
 *
 * @since 2.0.0
 */
@Injectable()
export class IonApiService extends CoreBase implements IIonApiService {
   private instance: IIonApiService;

   constructor(http: HttpClient, formService: FormService, @Inject(IonApiConfig) @Optional() config?: IIonApiConfig) {
      super('IonApiService');
      this.instance = new IonApiServiceCore(new AngularHttpService(http, config), formService);
   }

   getContext(options?: IIonApiOptions): Observable<IIonApiContext> {
      return this.instance.getContext(options);
   }

   execute(request: IIonApiRequest): Observable<IIonApiResponse> {
      return this.instance.execute(request);
   }

   setDevelopmentToken(token: string): void {
      this.instance.setDevelopmentToken(token);
   }
}
