import { Observable } from 'rxjs';
import { IErrorState, INumberFormatOptions } from '../types';

/**
 * Defines user context values for an M3 user. Most values are from MNS150.
 *
 * ```
 * import { IUserContext } from '@infor-up/m3-odin';
 * ```
 *
 * @since 2.0.0
 */
export interface IUserContext extends IErrorState {
   /**
    * Gets the M3 User.
    */
   m3User?: string;

   /**
    * Gets the principal user which can be different from the M3 User in a multitenant installation.
    */
   principalUser?: string;

   /**
    * Gets the tenant if the application was opened in an H5 tab. If the application is a context app (run otside of H5) then a H5 session
    * is needed to get the UserContext with this information. A user context from MNS150MI does not have this information.
    */
   tenant?: string;

   /**
    * Gets the theme for the user. If the application is a context app (run otside of H5) then a H5 session
    * is needed to get the UserContext with this information. A user context from MNS150MI does not have this information.
    */
   theme?: string;

   /**
    * Gets the Ion Api Url if configured on the server. ION API can only be used in cloud.
    * If the application is a context app (run otside of H5) then a H5 session
    * is needed to get the UserContext with this information. A user context from MNS150MI does not have this information.
    */
   ionApiUrl?: string;

   /**
    * Gets if H5 is running in a multitenant configuration. It is a multi-tenant environment if the tenant is different from 'infor'.
    * If the application is a context app (run otside of H5) then a H5 session
    * is needed to get the UserContext with this information. A user context from MNS150MI does not have this information.
    */
   isMultiTenant?: boolean;

   /**
    * Gets the company from MNS150.
    */
   company?: string;

   /**
    * Gets the current company.
    */
   currentCompany?: string;

   /**
    * Gets the division from MNS150.
    */
   division?: string;

   /**
    * Get the current division.
    */
   currentDivision?: string;

   /**
    * Get the language from MNS150.
    */
   language?: string;

   /**
    * Gets the current language.
    */
   currentLanguage?: string;

   /**
    * Gets or sets the IETF language tag.
    *
    * This value is the M3 language code converted to an IETF language tag.
    *
    * Example: GB -> en-US.
    */
   languageTag?: string;

   /**
    * Company.
    */
   CONO?: string;

   /**
    * Division.
    */
   DIVI?: string;

   /**
    * Language.
    */
   LANC?: string;

   /**
    * Date format.
    */
   DTFM?: string;

   /**
    * Gets or sets the ISO date format.
    *
    * This value is the ISO date format converted from the M3 format in the DTFM property.
    * If the DTFM property is YMD the dateFormat property would be yyMMdd.
    */
   dateFormat?: string;

   /**
    * Decimal format.
    */
   DCFM?: string;

   /**
    * Time zone.
    */
   TIZO?: string;

   /**
    * Facility.
    */
   FACI?: string;

   /**
    * Warehouse.
    */
   WHLO?: string;

   /**
    * Company name.
    */
   TX40?: string;

   /**
    * Division name.
    */
   CONM?: string;

   /**
    * Start menu.
    */
   DFMN?: string;

   /**
    * User.
    */
   USID?: string;

   /**
    * Name.
    */
   NAME?: string;

   /**
    * User status.
    */
   USTA?: string;

   /**
    * User type.
    */
   USTP?: string;

   /**
    * Equiment alias search sequense.
    */
   EQAL?: string;

   /**
    * Electronic mail address.
    */
   EMAL?: string;

   /**
    * Gets or sets the M3 number format options.
    */
   numberFormatOptions?: INumberFormatOptions;

   /**
    * First active date in the M3 calendar on the format 'yyyyMMdd'.
    */
   FADT?: string;

   /**
    * Contains the universal UserID in UUID format
    */
   EUID?: string;

   /**
    * First active date in the M3 calendar.
    */
   firstActiveDate?: Date;

   /**
    * Last active date in the M3 calendar on the format 'yyyyMMdd'.
    */
   LADT?: string;

   /**
    * First active date in the M3 calendar.
    */
   lastActiveDate?: Date;
}


/**
 * @hidden
 *
 * @since 2.0.0
 */
export interface ITask {
   name?: string;
   link?: string;
}

/**
 * @hidden
 *
 * @since 2.0.0
 */
export interface IUserResponse {
   m3User?: string;
   principalUser?: string;
   sessionId: string;
   userContext?: any;
}

/**
 * @hidden
 *
 * @since 2.0.0
 */
export interface IMessage {
   m3Command?: string;
   m3Parameter?: any;
   m3Source?: string;
   m3MessageId?: string;
   m3Response?: any;
}

/**
 * Represents options for M3 date format conversion.
 *
 * ```
 * import { IDateOptions } from '@infor-up/m3-odin';
 * ```
 *
 * @since 2.0.0
 */
export interface IDateOptions {
   /**
    * Optional date format.
    * The default value is the date format from the user context.
    */
   dateFormat?: string;

   /**
    * Indicates if the M3 calendar first (FADT) and last (LADT) active dates should be
    * used when interpreting two digit years.
    */
   useCalendar?: boolean;
}

/**
 * Represents a serivce for the M3 user.
 *
 * ```
 * import { IUserService } from '@infor-up/m3-odin';
 * ```
 *
 * @since 2.0.0
 */
export interface IUserService {
   /**
    * Gets the M3 user context.
    * @returns An observable that will be completed with the M3 user context.
    */
   getUserContext(): Observable<IUserContext>;

   /**
    * @hidden
    * Sets the M3 user context from a form login.
    * Used by the form service to update the user context with information available after a login.
    * @param context A user context created from a form login.
    * @param principalUser The grid principal name
    */
   updateUserContext(context: IUserContext, principalUser: string);
}

/**
 * Represents a service for the hosting application (H5).
 *
 * ```
 * import { IApplicationService } from '@infor-up/m3-odin';
 * ```
 *
 * @since 2.0.0
 */
export interface IApplicationService {
   /**
    * Gets a value that indicates if the application is running in a H5 tab.
    * @returns True if the application is running in a H5 tab.
    */
   isH5(): boolean;

   /**
    * Launches a link in H5. This function will not have any effect when not running in the H5 client.
    * @param link The link to launch.
    */
   launch(link: string): void;
}
