import { AsyncSubject, Observable } from "rxjs";
import { CoreBase } from "./base";
import { IHttpRequest, IHttpResponse, IHttpService } from "./types";
import { HttpUtil } from "./util";

/**
 * Basic implementation of an HTTP serice.
 *
 * ```typescript
 * import { AjaxHttpService } from '@infor-up/m3-odin';
 * ```
 *
 * This implementation can be used if there are no other framework used such as Angular.
 *
 * @since 2.0.0
 */
export class AjaxHttpService extends CoreBase implements IHttpService {
   constructor() {
      super("AjaxHttpService");
   }

   execute(request: IHttpRequest): Observable<IHttpResponse> {
      const subject = new AsyncSubject<IHttpResponse>();
      const url = request.url;
      this.logDebug("execute: " + url);

      // TODO Decide if the response type should be set on the request or not...

      try {
         const method = request.method;
         const responseType = "";
         const x = new XMLHttpRequest();
         x.open(method, url, true);
         x.responseType = responseType as XMLHttpRequestResponseType;
         const headers = request.headers;
         if (headers) {
            for (const name of Object.keys(headers)) {
               x.setRequestHeader(name, headers[name]);
            }
         }
         const self = this;
         x.onreadystatechange = function () {
            if (x.readyState === 4) {
               self.onResponse(request, subject, x);
            }
         };
         if (method === "GET") {
            x.send();
         } else {
            x.send(request.body);
         }
      } catch (e) {
         this.onResponse(request, subject, null);
      }

      return subject.asObservable();
   }

   private onResponse(
      request: IHttpRequest,
      subject: AsyncSubject<IHttpResponse>,
      x: XMLHttpRequest
   ): void {
      const url = request.url;
      let status;
      let statusText;
      let contentType;
      let body;

      if (x) {
         status = x.status;
         contentType = x.getResponseHeader("Content-Type");
         body = x.responseText;
      } else {
         status = 500;
         body = "";
         statusText = "Exception";
         contentType = "";
      }

      this.logDebug("onResponse: Status " + status + " URL " + request.url);

      const isSuccess = HttpUtil.isSuccess(status);
      if (isSuccess) {
         const bodyText = body;
         const isJson =
            (contentType && contentType.indexOf("application/json") >= 0) ||
            (bodyText && HttpUtil.isJsonLike(bodyText));
         if (isJson) {
            try {
               body = JSON.parse(bodyText);
            } catch (ex) {
               this.logError(
                  "onResponse: Failed to parse JSON response for URL " + url,
                  ex
               );
            }
         }
      }

      const response: IHttpResponse = {
         url: url,
         status: status,
         statusText: statusText,
         ok: isSuccess,
         body: body,
      };

      if (isSuccess) {
         subject.next(response);
         subject.complete();
      } else {
         subject.error(response);
      }
   }
}
