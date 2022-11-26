import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { CoreBase, IIonApiRequest } from "@infor-up/m3-odin";
import { FormService, IonApiService } from "@infor-up/m3-odin-angular";
import { Observable, throwError } from "rxjs";
import { catchError, flatMap, map } from "rxjs/operators";

export interface IIdmError {
   code: string;
   message: string;
   detail: string;
   areaCode?: string;
   area?: string;
}

export interface ISearchResponse {
   items: ISearchItems;
}

export interface ISearchItems {
   item: any[];
   searchXQuery: string;
   searchCount?: number;
}

@Injectable()
export class IdmDataService extends CoreBase {
   private readonly proxyBaseUrl = "/ca";
   private readonly ionBaseUrl = "/IDM";
   private readonly idmRestRoot = "/api";
   private readonly source = "ionapi-idm-sample";
   private readonly mdsFileString = "/MDS_File";
   private readonly offset = 0;
   private readonly limit = 20;

   constructor(
      private formService: FormService,
      private httpClient: HttpClient,
      private ionApiService: IonApiService
   ) {
      super("IDMDataService");

      // Force the application to behave as in Multitenant (default is on-prem)
      // To automatically determine if H5 is running in multi tenant or not H5 might need to be updated
      // If Multitenant is set to true then ION API will be used by the data service in this sample
      // Please note that ionApiUrl is not set here becuase in Devlopment we use a local relative path that goes to the proxy.
      // if (HttpUtil.isLocalhost()) {
      //    this.logDebug('Setting development token');
      //    formService.developmentSetEnvironmentContext({ isMultiTenant: true, ionApiUrl: null });
      //    ionApiService.setDevelopmentToken('INSERT_TOKEN_HERE');
      // }
      // Comment out the line above before building for production. This line is only needed if the H5 client that you are using is not
      // multi tenant and you would like to test the code calling M3 through ION API.
   }

   searchItems(): Observable<ISearchResponse> {
      const request = this.createSearchRequest(this.mdsFileString);
      return this.executeRequest<ISearchResponse>(request);
   }

   /**
    * Get items/search for items using an xquery
    *
    * @param isMultiTenant boolean
    * @param xquery string, e.g. 'MDS_File'
    * @param offset number, default value: 0
    * @param limit number, default value: 20
    */
   private createSearchRequest(
      xquery: string,
      offset: number = this.offset,
      limit: number = this.limit
   ): IIonApiRequest {
      const request = this.createRequest(this.idmRestRoot + "/items/search");
      request.url += `?$includeCount=true`;
      request.url += `&$limit=${limit}`;
      request.url += `&$offset=${offset}`;
      request.url += `&$query=${encodeURIComponent(xquery)}`;
      return request;
   }

   private createRequest(url: string): IIonApiRequest {
      // Create HTTP GET request object
      const request: IIonApiRequest = {
         method: "GET",
         url: url,
         headers: { Accept: "application/json" },
         source: this.source,
      };

      return request;
   }

   private executeRequest<T>(request: IIonApiRequest): Observable<T> {
      return this.formService.getEnvironmentContext().pipe(
         flatMap((context) => {
            const isMultiTenant = context.isMultiTenant;
            request.url =
               (isMultiTenant ? this.ionBaseUrl : this.proxyBaseUrl) +
               request.url;
            if (isMultiTenant) {
               return this.ionApiService.execute(request);
            } else {
               return this.httpClient.request<T>(request.method, request.url, {
                  body: request.body,
                  headers: request.headers,
                  reportProgress: false,
                  observe: "response",
               });
            }
         }),
         map((response) => response.body),
         catchError((response) => {
            const error: IIdmError = response.error
               ? response.error.error
               : response;
            this.logError("Error: " + JSON.stringify(error));
            return throwError(error);
         })
      );
   }
}
