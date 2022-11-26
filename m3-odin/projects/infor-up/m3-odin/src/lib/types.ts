import { Observable } from "rxjs";

/**
 * Represents an HTTP request.
 *
 * ```typescript
 * import { IHttpRequest } from '@infor-up/m3-odin';
 * ```
 *
 * @since 2.0.0
 */
export interface IHttpRequest {
   /**
    * Gets or sets the HTTP URL.
    */
   url: string;

   /**
    * Gets or sets the HTTP method (GET, POST etc).
    */
   method: string;

   /**
    * Gets or sets the request body.
    */
   body?: any | null;

   /**
    * Gets or sets the expected response type.
    */
   responseType?: "arraybuffer" | "blob" | "json" | "text";

   /**
    * Gets or sets requests headers.
    */
   headers?: { [name: string]: any };
}

/**
 * Represents an HTTP response.
 *
 * ```typescript
 * import { IHttpResponse } from '@infor-up/m3-odin';
 * ```
 *
 * @since 2.0.0
 */
export interface IHttpResponse {
   /**
    * Gets or sets the HTTP status code.
    */
   status: number;

   /**
    * Gets or sets the HTTP status text.
    */
   statusText: string | null;

   /**
    * Gets or sets a value that indicates if the request was successful (status between 200-299).
    */
   ok: boolean;

   /**
    * Gets or sets the requested URL.
    */
   url: string | null;

   /**
    * Gets or sets the response body.
    */
   body: any | null;
}

/**
 * Represents an HTTP service.
 *
 * ```typescript
 * import { IHttpService } from '@infor-up/m3-odin';
 * ```
 *
 * @since 2.0.0
 */
export interface IHttpService {
   /**
    * Executes an HTTP request
    * @param request The request object.
    * @returns An observable that will be completed with an HTTP response.
    */
   execute(request: IHttpRequest): Observable<IHttpResponse>;
}

/**
 * Represents options for number formatting.
 *
 * ```typescript
 * import { INumberFormatOptions } from '@infor-up/m3-odin';
 * ```
 *
 * @since 2.0.0
 */
export interface INumberFormatOptions {
   /**
    * Gets or sets the decimal separator character.
    */
   separator?: string;
}

/**
 * Represents an error state.
 *
 * ```typescript
 * import { IErrorState } from '@infor-up/m3-odin';
 * ```
 *
 * This interface is implemented by classes that need a common
 * way to indicate an error state. Common examples are response objects for services.
 *
 * @since 2.0.0
 */
export interface IErrorState {
   /**
    * Gets or sets an error.
    */
   error?: any;

   /**
    * Gets or sets an error message.
    */
   errorMessage?: string;

   /**
    * Gets or sets an error code.
    */
   errorCode?: string;

   /**
    * Gets a value that indicates if an error exists.
    *
    * An error is considered to exist if any of the error, errorMessage or errorCode properties are set.
    * Note that if one property is set there is no guarantee that any of the other properties are set.
    *
    * @returns True if an error exists.
    */
   hasError(): boolean;
}

/**
 * Represents options used when getting an IonApiContext.
 *
 * ```typescript
 * import { IIonApiOptions } from '@infor-up/m3-odin';
 * ```
 *
 * @since 2.0.0
 */
export interface IIonApiOptions {
   /**
    * Gets or sets an optional value that indicates if the ION API token should be refreshed or not.
    *
    * The default value is false. This property should only be set to true if the current token is invalid.
    * An ION API call will return HTTP 401 when the token is invalid.
    */
   refresh?: boolean;
}

/**
 * Represents options when executing an ION API HTTP request.
 *
 * ```typescript
 * import { IIonApiRequest } from '@infor-up/m3-odin';
 * ```
 *
 * Note that the url property should be set to a relative URL (absolute URLs are not supported).
 * The ION API base URL will be automatically prepended to the url property to create an absolute URL before the request is executed.
 *
 * The OAuth authorization header will also be automatically added to the headers map.
 */
export interface IIonApiRequest extends IHttpRequest {
   /**
    * Gets or sets the source of the request.
    *
    * The value should be some kind of short identifier of the calling application.
    * The value will be set in a request header for each ION API call.
    * The purpose of the source property is to support logging and throttling of ION API requests etc based on the caller.
    */
   source: string;

   /**
    * Gets or sets an optional value that indicates if a request should be retried if the ION API returns a 401 HTTP response code.
    *
    * A 401 response code usually means that the OAuth token has expired and must be renewed. A 401 response code could also mean
    * that the user cannot be authorized at all.
    *
    * The default value is true.
    */
   ionApiRetry?: boolean;
}

/**
 * Represents the response from an ION API HTTP request.
 *
 * ```typescript
 * import { IIonApiResponse } from '@infor-up/m3-odin';
 * ```
 *
 * @since 2.0.0
 */
export interface IIonApiResponse extends IHttpResponse {
   /**
    * Gets or sets a value that indicates if the response was from a retry attempt or not.
    */
   isRetry: boolean;
}

/**
 * Represents the ION API context which contains values required when making ION API HTTP requests.
 *
 * ```typescript
 * import { IIonApiContext } from '@infor-up/m3-odin';
 * ```
 *
 * To call an ION API a client must construct an absolute URL using the ION API base URL returned by the getUrl function.
 * Each HTTP request to an ION API must include an authorization header with an OAuth 2.0 bearer token.
 * The authorization header name and value can be retrieved using the getHeaderName and getHeaderValue functions.
 * It is also possible to get just the OAuth token using the getToken function.
 *
 * Refer to the documentation for the API used to make HTTP calls for information about how to add a header to a request.
 *
 * Authorization header example: "Authorization: Bearer yg06wrbaBoutluM8Rdb9v4YH0ztx"
 *
 * @since 2.0.0
 */
export interface IIonApiContext {
   /**
    * Gets the ION API base URL.
    * @return a URL
    */
   getUrl(): string;

   /**
    * Gets an OAUth token.
    *
    * The OAuth token must be provided in an Authorization header for each ION API call.
    * @return an OAuth token
    */
   getToken(): string;

   /**
    * Gets the name of the HTTP Authorization header (Authorization).
    * @return the authorization header name
    */
   getHeaderName(): string;

   /**
    * Gets the value for the HTTP authorization header including the OAuth token.
    *
    * The returned value is an Authorization Request Header Field for an OAuth 2.0 Bearar Token
    * according to https://tools.ietf.org/html/rfc6750#section-2.1
    *
    * Example return value: "Bearer yg06wrbaBoutluM8Rdb9v4YH0ztx"
    *
    * @return the authorization header value
    */
   getHeaderValue(): string;
}

/**
 * Represents the service used for ION API HTTP requests.
 *
 * ```typescript
 * import { IIonApiService } from '@infor-up/m3-odin';
 * ```
 *
 * @since 2.0.0
 */
export interface IIonApiService {
   /**
    * Gets an ION API context required when making ION API HTTP requests.
    *
    * This function is asynchronous since a server request might be required to get the OAuth token for ION API.
    *
    * In most cases an ION API request can be executed using the executeIonApiAsync function that will automatically
    * get the ION API context and retry requests when the OAuth token has expired. This function can be used when more
    * control is required when making the request or when the executeIonApiAsync fuction cannot be used for some other reason.
    *
    * The OAuth token has a limited lifetime and will become invalid once it has timed out.
    * The OAuth token might be invalid if an ION API HTTP request returns 401.
    * A client can get a new ION API context with a new OAuth token by setting the refresh property to true on the options parameter.
    *
    * @param options Optional object for specifying options when getting the context.
    * @return A promise that will be resolved when the ION API context is available.
    */
   getContext(options?: IIonApiOptions): Observable<IIonApiContext>;

   /**
    * Executes an ION API HTTP request.
    *
    * This function will automatically get the IonApiContext which contains the OAuth token necessary to complete the request.
    *
    * If the url parameter is relative (which it should be in most cases) the ION API base URL
    * will be prepended to the URL before the request is executed.
    *
    * If the ION API HTTP request returns a 401 response code this function will perform a single retry. The retry attempt
    * will get a fresh OAuth token and repeat the same request. If the second request completes without errors it will be
    * transparent to the caller. If the second request fails the promise will be rejected.
    *
    * If more control is required when making the request the getIonApiContextAsync function can be used to
    * get the OAuth token and ION API base URL. In this case the retry for expired OAuth tokens must be handled manually.
    *
    * @param options An object that describes the request.
    * @returns An observable that can be subscribed to.
    */
   execute(options: IIonApiRequest): Observable<IIonApiResponse>;

   /**
    * Sets the ION API OAuth token in a development environment.
    *
    * This function should only be used during development when loading the application from localhost.
    *
    * @param token An OAuth token
    */
   setDevelopmentToken(token: string): void;
}
