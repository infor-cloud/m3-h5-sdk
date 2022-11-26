import { AsyncSubject, Observable, of, throwError } from "rxjs";
import {
   IFormResponse,
   ITranslationRequest,
   ITranslationResponse,
   IFormRequest,
} from "./form/base";
import {
   IBookmark,
   IEnvironmentContext,
   IFormService,
   ISearchRequest,
} from "./form/types";
import { IonApiServiceCore } from "./ion";
import {
   IHttpRequest,
   IHttpResponse,
   IHttpService,
   IIonApiContext,
   IIonApiRequest,
   IIonApiResponse,
} from "./types";
import { CoreUtil, HttpUtil } from "./util";

class MockIHttpService implements IHttpService {
   execute(request: IHttpRequest): Observable<IHttpResponse> {
      throw new Error("Method not implemented.");
   }
}

class MockIFormService implements IFormService {
   executeBookmark(bookmark: IBookmark): Observable<IFormResponse> {
      throw new Error("Method not implemented.");
   }
   executeSearch(request: ISearchRequest): Observable<IFormResponse> {
      throw new Error("Method not implemented.");
   }
   translate(request: ITranslationRequest): Observable<ITranslationResponse> {
      throw new Error("Method not implemented.");
   }
   getEnvironmentContext(): Observable<IEnvironmentContext> {
      throw new Error("Method not implemented.");
   }
   developmentSetEnvironmentContext(context: IEnvironmentContext) {
      throw new Error("Method not implemented.");
   }
   executeRequest(request: IFormRequest): Observable<IFormResponse> {
      throw new Error("Method not implemented.");
   }
   executeCommand(
      commandType: string,
      commandValue?: string | undefined,
      params?: any
   ): Observable<IFormResponse> {
      throw new Error("Method not implemented.");
   }
}

class MockIonApiContext implements IIonApiContext {
   getUrl(): string {
      return "contextUrl";
   }
   getToken(): string {
      throw new Error("Method not implemented.");
   }
   getHeaderName(): string {
      return "Foo";
   }
   getHeaderValue(): string {
      return "Bar";
   }
}

describe("IonApiServiceCore", () => {
   const mockIHttpService = new MockIHttpService();
   const mockIFormService = new MockIFormService();

   it("should set url and token from contructor", () => {
      const service = new IonApiServiceCore(mockIHttpService, mockIFormService);
      expect(service["httpService"]).toBe(mockIHttpService);
      expect(service["formService"]).toBe(mockIFormService);
      expect(service["logPrefix"]).toEqual("[IonApiServiceCore] ");
   });

   it("should set development token", () => {
      const service = new IonApiServiceCore(mockIHttpService, mockIFormService);
      expect(service["isDev"]).toBe(false);

      const isLocalHost = spyOn(HttpUtil, "isLocalhost").and.returnValues(
         false,
         true
      );
      expect(() => service.setDevelopmentToken("Foo")).toThrowError(
         "Development tokens are only allowed for localhost"
      );

      const tokenFoo = "Foo";
      const tokenBar = "Bar";
      service.setDevelopmentToken(tokenFoo);
      const context = service["context"];
      expect(service["isDev"]).toBe(true);
      expect(context["getUrl"]()).toBe("/ODIN_DEV_TENANT");
      expect(context["getToken"]()).toBe(tokenFoo);
      context["setToken"](tokenBar);
      expect(context["getHeaderName"]()).toBe("Authorization");
      expect(context["getHeaderValue"]()).toBe("Bearer Bar");
      expect(isLocalHost).toHaveBeenCalledTimes(2);
   });

   it("should get context", (done) => {
      const service = new IonApiServiceCore(mockIHttpService, mockIFormService);
      expect(service["context"]).toBe(undefined);

      const loadToken = spyOn(
         IonApiServiceCore.prototype as any,
         "loadToken"
      ).and.returnValue(undefined);
      const subjectOne = service.getContext();
      expect(service["pending"].length).toBe(1);
      expect(service["pending"][0].asObservable()).toEqual(subjectOne);

      const subjectTwo = service.getContext();
      expect(service["pending"].length).toBe(2);
      expect(service["pending"][1].asObservable()).toEqual(subjectTwo);

      // set context
      const token = "Foo";
      service.setDevelopmentToken(token);

      const subjectThree = service.getContext({ refresh: true });
      expect(service["pending"].length).toBe(3);
      expect(service["pending"][1].asObservable()).toEqual(subjectThree);

      const subjectFour = service.getContext();
      expect(service["pending"].length).toBe(3);
      subjectFour.subscribe((sub) => {
         expect(sub.getToken()).toBe(token);
         done();
      });

      expect(loadToken).toHaveBeenCalledWith(undefined);
      expect(loadToken).toHaveBeenCalledTimes(1);
   });

   it("should answer canRetry", () => {
      const service = new IonApiServiceCore(mockIHttpService, mockIFormService);
      expect(service["canRetry"]({} as IIonApiRequest, 0)).toBe(false);
      expect(service["canRetry"]({} as IIonApiRequest, 401)).toBe(true);
      expect(
         service["canRetry"]({ ionApiRetry: true } as IIonApiRequest, 401)
      ).toBe(true);
      expect(
         service["canRetry"]({ ionApiRetry: false } as IIonApiRequest, 401)
      ).toBe(false);
   });

   it("should resolve", (done) => {
      const service = new IonApiServiceCore(mockIHttpService, mockIFormService);
      const item = new AsyncSubject<any>();
      const items = [item];
      const value = { foo: "bar" };

      expect(items.length).toBe(1);
      service["resolve"](items, value);
      expect(items.length).toBe(0);

      item.subscribe((val) => {
         expect(val).toBe(value);
         done();
      });
   });

   it("should reject", (done) => {
      const service = new IonApiServiceCore(mockIHttpService, mockIFormService);
      const item = new AsyncSubject<any>();
      const items = [item];
      const reason = "foo";

      expect(items.length).toBe(1);
      service["reject"](items, reason);
      expect(items.length).toBe(0);

      item.subscribe({
         error: (err) => {
            expect(err).toBe(reason);
            done();
         },
      });
   });

   it("should execte with success", (done) => {
      const service = new IonApiServiceCore(mockIHttpService, mockIFormService);
      expect(() => service.execute({} as IIonApiRequest)).toThrowError(
         "No source specified"
      );

      const param = { source: "Foo" } as IIonApiRequest;
      const response = { statusText: "Bar" } as IIonApiResponse;
      const getContext = spyOn(service, "getContext").and.returnValue(
         of({} as IIonApiContext)
      );
      const executeApi = spyOn(service as any, "executeApi").and.callFake(
         (context, options, source, sub, isRetry) => {
            (sub as AsyncSubject<IIonApiResponse>).next(response);
            (sub as AsyncSubject<IIonApiResponse>).complete();
         }
      );
      const subject = service.execute(param);
      expect(getContext).toHaveBeenCalled();
      expect(executeApi).toHaveBeenCalledWith(
         {},
         param,
         "m3-odin-" + param.source,
         jasmine.anything(),
         false
      );
      subject.subscribe((resp) => {
         expect(resp).toBe(response);
         done();
      });
   });

   it("should execute with error", (done) => {
      const service = new IonApiServiceCore(mockIHttpService, mockIFormService);

      const param = { source: "Foo" } as IIonApiRequest;
      const error = "Bar";
      const getContext = spyOn(service, "getContext").and.returnValue(
         throwError(() => error)
      );
      const subject = service.execute(param);
      expect(getContext).toHaveBeenCalled();
      subject.subscribe({
         error: (err) => {
            expect(err).toBe(error);
            done();
         },
      });
   });

   it("should load a token", () => {
      const service = new IonApiServiceCore(mockIHttpService, mockIFormService);

      const response = { body: "bar" } as IHttpResponse;
      const environment = { ionApiUrl: "Foo" } as IEnvironmentContext;
      const error = "Error";
      const execute = spyOn(service["httpService"], "execute").and.returnValues(
         of(response),
         of(response),
         of(response),
         of(response),
         of(response),
         throwError(() => error)
      );
      const getEnvironmentContext = spyOn(
         service["formService"],
         "getEnvironmentContext"
      ).and.returnValues(
         of({} as IEnvironmentContext),
         of({} as IEnvironmentContext),
         throwError(() => error),
         of(environment)
      );
      const reject = spyOn(service as any, "reject").and.returnValue(undefined);
      const resolve = spyOn(service as any, "resolve").and.returnValue(
         undefined
      );
      const logError = spyOn(service as any, "logError").and.returnValue(
         undefined
      );
      const logInfo = spyOn(service as any, "logInfo").and.returnValue(
         undefined
      );
      const random = "Bar";
      spyOn(CoreUtil, "random").and.returnValue(random);

      service["loadToken"](false);
      service["isDev"] = true;
      service["loadToken"](false);
      service["loadToken"](false);
      service["loadToken"](false);
      service["loadToken"](false);
      service["loadToken"](true);

      expect(execute).toHaveBeenCalledTimes(6);
      expect(execute).toHaveBeenCalledWith({
         method: "GET",
         url: "/grid/rest/security/sessions/oauth?rid=" + random,
         responseType: "text",
      });

      expect(getEnvironmentContext).toHaveBeenCalledTimes(4);

      expect(reject).toHaveBeenCalledTimes(4);
      expect(reject.calls.allArgs()).toEqual([
         [service["pending"], response],
         [service["pending"], response],
         [service["pending"], response],
         [service["pending"], error],
      ]);

      expect(resolve).toHaveBeenCalledTimes(2);
      expect(resolve.calls.allArgs()).toEqual([
         [service["pending"], service["context"]],
         [service["pending"], service["context"]],
      ]);

      expect(logError).toHaveBeenCalledTimes(3);
      expect(logError.calls.allArgs()).toEqual([
         [
            "loadToken:  Failed to resolve ION Base URL. ION Base URL is null. Verify that it has been set as a grid property in the MUA Server, or set it by calling setUrl.",
         ],
         [
            "loadToken:  Failed to resolve ION Base URL. ION Base URL is null. Verify that it has been set as a grid property in the MUA Server, or set it by calling setUrl.",
         ],
         ["loadToken: Failed to resolve ION Base URL " + error],
      ]);

      expect(logInfo).toHaveBeenCalledTimes(4);
      expect(logInfo.calls.allArgs()).toEqual([
         [
            "ION base url is not set. getEnvironmentContext will be called to lookup ION URL",
         ],
         [
            "ION base url is not set. Using relative path in Dev mode, in production the ION URL can be set with setUrl, if not set it will be automatically retreived from H5.",
         ],
         [
            "ION base url is not set. Using relative path in Dev mode, in production the ION URL can be set with setUrl, if not set it will be automatically retreived from H5.",
         ],
         [
            "ION base url is not set. Using relative path in Dev mode, in production the ION URL can be set with setUrl, if not set it will be automatically retreived from H5.",
         ],
      ]);

      expect(service["url"]).toBe(environment.ionApiUrl);
      expect(service["context"].getUrl()).toBe(service["url"]);
      expect(service["context"].getToken()).toBe(response.body);
   });

   it("should execute api", () => {
      const service = new IonApiServiceCore(mockIHttpService, mockIFormService);

      const response = { body: "bar" } as IIonApiResponse;
      const source = "source";
      const url = "foo";
      const context = new MockIonApiContext();
      const retryContext = new MockIonApiContext();
      const error = "Error";
      const options = {
         url: context.getUrl() + "/" + url,
         headers: {
            "x-infor-ionapi-platform": "m3-odin",
            "x-infor-ionapi-source": source,
         },
      };
      options.headers[context.getHeaderName()] = context.getHeaderValue();
      const subjectSuccess = new AsyncSubject<IIonApiResponse>();
      const subjectErrorOne = new AsyncSubject<IIonApiResponse>();
      const subjectErrorTwo = new AsyncSubject<IIonApiResponse>();
      const subjectErrorThree = new AsyncSubject<IIonApiResponse>();

      spyOn(service as any, "isDebug").and.returnValue(true);
      spyOn(service as any, "canRetry").and.returnValue(true);
      const logDebug = spyOn(service as any, "logDebug").and.returnValue(
         undefined
      );
      const execute = spyOn(service["httpService"], "execute").and.returnValues(
         of(response),
         throwError(() => error),
         throwError(() => error),
         throwError(() => error),
         throwError(() => error)
      );
      const getContext = spyOn(service, "getContext").and.returnValues(
         of(retryContext),
         throwError(() => error),
         throwError(() => error)
      );

      service["executeApi"](
         context,
         { url } as IIonApiRequest,
         source,
         subjectSuccess,
         false
      );
      service["executeApi"](
         context,
         { url } as IIonApiRequest,
         source,
         subjectErrorOne,
         true
      );
      service["executeApi"](
         context,
         { url } as IIonApiRequest,
         source,
         subjectErrorTwo,
         false
      );
      service["executeApi"](
         context,
         { url } as IIonApiRequest,
         source,
         subjectErrorThree,
         false
      );

      expect(execute).toHaveBeenCalledTimes(5);
      expect(execute).toHaveBeenCalledWith(options as unknown as IHttpRequest);

      expect(logDebug).toHaveBeenCalledTimes(6);
      expect(logDebug.calls.allArgs()).toEqual([
         [`executeApi: Executing ${options.url} (${source})`],
         [`executeApi: Executed ${options.url} (${source})`],
         [`executeApi: Executing ${options.url} (${source})`],
         [`executeApi: Executing ${options.url} (${source})`],
         [
            `executeApi: Executing ${retryContext.getUrl()}/${
               options.url
            } (${source})`,
         ],
         [`executeApi: Executing ${options.url} (${source})`],
      ]);

      expect(getContext).toHaveBeenCalledTimes(2);
      expect(getContext).toHaveBeenCalledWith({ refresh: true });

      let subscribeCount = 0;
      subjectSuccess.subscribe({
         next: (resp) => {
            expect(resp).toBe(response);
            subscribeCount++;
         },
      });
      subjectErrorOne.subscribe({
         error: (err) => {
            expect(err).toBe(error);
            subscribeCount++;
         },
      });
      subjectErrorThree.subscribe({
         error: (err) => {
            expect(err).toBe(error);
            subscribeCount++;
         },
      });

      expect(subscribeCount).toBe(3);
   });
});
