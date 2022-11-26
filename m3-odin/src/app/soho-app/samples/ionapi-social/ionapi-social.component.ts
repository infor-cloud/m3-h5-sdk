import { Component } from "@angular/core";
import {
   CoreBase,
   HttpUtil,
   IIonApiRequest,
   IIonApiResponse,
} from "@infor-up/m3-odin";
import { IonApiService } from "@infor-up/m3-odin-angular";

interface ISocialUser {
   FirstName: string;
   LastName: string;
   Email: string;
   Title: string;
   UserGUID: string;
}

interface IUserDetailResponse {
   UserDetailList: ISocialUser[];
   Status: number;
   ErrorList: {}[];
}

@Component({
   templateUrl: "./ionapi-social.component.html",
})
export class IonApiSocialSampleComponent extends CoreBase {
   // https://m3ceappsdev.m3cedev.awsdev.infor.com/grid/rest/security/sessions/oauth
   private readonly developmentToken = "INSERT_TOKEN_HERE";

   private serviceUrl = "Mingle/SocialService.Svc";
   private source = "ionapi-social-sample";

   fullName: string;
   photoUrl: string;
   email: string;

   constructor(private ionApiService: IonApiService) {
      super("IonApiSocialSampleComponent");

      if (HttpUtil.isLocalhost()) {
         this.logDebug("Setting development token");
         ionApiService.setDevelopmentToken(this.developmentToken);
      }
   }

   onClickLoad(): void {
      this.logInfo("onClickLoad");
      this.loadUser();
   }

   private loadUser(): void {
      const request = this.createRequest("User/Detail");
      this.ionApiService.execute(request).subscribe(
         (response: IIonApiResponse) => {
            if (!response.body.ErrorList) {
               this.updateUser(response.body as IUserDetailResponse);
            }
            // TODO Error
         },
         (response: IIonApiResponse) => {
            // TODO Error
         }
      );
   }

   private updateUser(response: IUserDetailResponse): void {
      const user = response.UserDetailList[0];
      this.fullName = user.FirstName + " " + user.LastName;
      this.email = user.Email;
   }

   private createRequest(
      relativeUrl: string,
      headers?: object
   ): IIonApiRequest {
      if (!headers) {
         // Create default headers
         headers = { Accept: "application/json" };
      }

      // Create the relative URL to the ION API
      const url = this.serviceUrl + "/" + relativeUrl;

      // Create HTTP GET request object
      const request: IIonApiRequest = {
         method: "GET",
         url: url,
         headers: headers,
         source: this.source,
      };

      return request;
   }
}
