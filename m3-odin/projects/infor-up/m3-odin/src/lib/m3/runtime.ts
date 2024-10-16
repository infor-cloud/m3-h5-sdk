import { AsyncSubject, Observable } from 'rxjs';
import { CoreBase, ErrorState } from '../base';
import { Log } from '../log';
import { IMIResponse, IMIService } from '../mi/base';
import { IMIRequest } from '../mi/types';
import { HttpUtil } from '../util';
import {
   IApplicationService,
   IDateOptions,
   IMessage,
   ITask,
   IUserContext,
   IUserResponse,
   IUserService,
} from './types';

/**
 * @hidden
 */
class Constants {
   /**
    * Gets the default date format (yyMMdd).
    */
   public static readonly dateFormat = 'yyMMdd';

   /**
    * Gets the default long date format (yyyyMMdd).
    */
   public static readonly dateFormatLong = 'yyyyMMdd';

   public static readonly decimalSeparator = '.';
}

/**
 * @hidden
 */
export class Configuration {
   private static userContext = {} as IUserContext;
   private static firstActiveYear = 0;

   public static getDateFormat(): string {
      return this.userContext.dateFormat || Constants.dateFormat;
   }

   public static getDecimalSeparator(): string {
      return this.userContext.DCFM || Constants.decimalSeparator;
   }

   public static getFirstActiveDate(): Date {
      return Configuration.userContext.firstActiveDate;
   }

   public static getFirstActiveYear(): number {
      return Configuration.firstActiveYear;
   }

   public static getLastActiveDate(): Date {
      return Configuration.userContext.lastActiveDate;
   }

   public static update(userContext: IUserContext): any {
      const date = userContext.firstActiveDate;
      if (date) {
         Configuration.firstActiveYear = date.getFullYear();
      }
   }
}

/**
 * Provides utility functions for M3 format conversions.
 *
 * ```
 * import { IUserContext } from '@infor-up/m3-odin';
 * ```
 *
 * @since 2.0.0
 */
export class FormatUtil {
   /**
    * Formats a date using an M3 date format.
    * @param date The date to format.
    * @param options An optional options object that overrides the default formatting behavior.
    */
   public static formatDate(date: Date, options?: IDateOptions): string {
      let format = Configuration.getDateFormat();
      if (options) {
         format = options.dateFormat || format;
      }

      const toString = (value: number): string => {
         return value < 10 ? '0' + value : '' + value;
      };

      const isShortYear = format.length === 6;
      const yearString = date.getFullYear() + '';
      const monthString = toString(date.getMonth() + 1);
      const dayString = toString(date.getDate());

      let dateString = format;
      if (isShortYear) {
         dateString = dateString.replace('yy', yearString.substring(2, 4));
      } else {
         dateString = dateString.replace('yyyy', yearString);
      }
      dateString = dateString.replace('MM', monthString);
      dateString = dateString.replace('dd', dayString);

      return dateString;
   }

   /**
    * Parses an M3 date string to a JavaScript Date object.
    *
    * @param value A date string.
    * @param options An optional options object that overrides the default parsing behavior.
    */
   public static parseDate(value: string, options?: IDateOptions): Date {
      let format = Configuration.getDateFormat();
      let useCalendar = true;
      if (options) {
         format = options.dateFormat || format;
         useCalendar = options.useCalendar !== false;
      }

      const length = value.length;
      if (length !== format.length || !(length === 6 || length === 8)) {
         throw new Error(
            'Invalid format and/or value, format=' + format + ' value=' + value,
         );
      }

      let year;
      let month;
      let day;
      let isShortYear;
      let start = 0;
      let current = format.charAt(0);
      for (let i = 2; i < length; i++) {
         let c = format.charAt(i);
         if (i === length - 1) {
            i++;
            c = '';
         }
         if (c !== current) {
            const part = parseInt(value.substring(start, i), 10);
            if (current === 'y') {
               year = part;
               isShortYear = part < 100;
            } else if (current === 'M') {
               month = part - 1;
            } else if (current === 'd') {
               day = part;
            }
            start = i;
         }
         current = c;
      }

      if (useCalendar && isShortYear) {
         const firstActiveYear = Configuration.getFirstActiveYear();
         if (firstActiveYear > 0) {
            if (firstActiveYear > 1999) {
               year += 2000;
            } else {
               if (year + 1900 >= firstActiveYear) {
                  year += 1900;
               } else {
                  year += 2000;
               }
            }
         }
      }

      return new Date(year, month, day);
   }
}

/**
 * @hidden
 */
export class UserContext extends ErrorState implements IUserContext {
   constructor() {
      super();

      // Set default values
      (<IUserContext>this).numberFormatOptions = {
         separator: '.',
      };
   }

   // /**
   //  * Gets or sets the current user context.
   //  * @hidden
   //  */
   // public static current: IUserContext = new UserContext();
}

/**
 * @hidden
 */
class CommonUtil {
   public static languageMap = {
      // TODO ar, el, he-IL, pt-BR, ru?
      CS: 'zh-CN',
      CZ: 'cs-CZ',
      DE: 'de-DE',
      DK: 'da-DK',
      ES: 'es-ES',
      FI: 'fi-FI',
      FR: 'fr-FR',
      GB: 'en-US',
      HU: 'hu-HU',
      IT: 'it-IT',
      JP: 'ja-JP',
      NL: 'nl-NL',
      NO: 'nb-NO',
      PL: 'pl-PL',
      PT: 'pt-PT',
      SE: 'sv-SE',
      TR: 'tr-TR',
   };

   /**
    * Gets an IETF language tag from a M3 language code.
    *
    * Example: GB -> en-US
    *
    * @param m3Language The M3 language code.
    * @returns An IETF language tag. If no language tag is found the default language tag en-US is returned.
    */
   public static getLanguageTag(m3Language: string): string {
      let language = this.languageMap[m3Language];
      if (!language) {
         language = 'en-US';
         Log.warning(
            'getLanguageTag: M3 language ' +
               m3Language +
               ' not found. Fallback to ' +
               language,
         );
      }
      return language;
   }

   /**
    * Gets a date format from a M3 date format.
    *
    * Example: YMD -> yyMMdd
    *
    * @param m3Format The M3 date format.
    * @returns A date format. If no date format is found the default date format yyMMdd is returned.
    */
   public static getDateFormat(m3Format: string): string {
      let dateFormat = Constants.dateFormat;
      switch (m3Format) {
         case 'YMD':
         case 'YYMMDD':
            dateFormat = 'yyMMdd';
            break;
         case 'YYYYMMDD':
            dateFormat = 'yyyyMMdd';
            break;
         case 'MDY':
         case 'MMDDYY':
            dateFormat = 'MMddyy';
            break;
         case 'MMDDYYYY':
            dateFormat = 'MMddyyyy';
            break;
         case 'DMY':
         case 'DDMMYY':
            dateFormat = 'ddMMyy';
            break;
         case 'DDMMYYYY':
            dateFormat = 'ddMMyyyy';
            break;
      }
      return dateFormat;
   }
}

/**
 * @hidden
 */
export class UserServiceCore extends CoreBase implements IUserService {
   /**
    * @hidden
    */
   static isH5Host = false;

   private isUserContextAvailable = true;
   private m3User;
   private principalUser;
   private userContext: IUserContext;
   private queue: AsyncSubject<UserContext>[] = [];
   private isExecuting = false;
   private isMessagePending = false;

   constructor(private miService: IMIService) {
      super('UserServiceCore');
      this.init();
   }

   private init() {
      if (HttpUtil.isIframe()) {
         this.logDebug('Running in IFrame');

         // When we are in an IFrame we are most likely running in H5.
         // Try to reuse the existing user session from H5 first.
         this.registerMessage();
         const message: IMessage = {
            m3Command: 'user',
         };

         // TODO Replace with RxJS alternative for setTimeout
         setTimeout(() => this.onTimeout(), 500);
         this.isMessagePending = true;
         this.isExecuting = true;
         this.sendMessage(message);
      }
   }

   private onTimeout() {
      if (this.isMessagePending) {
         // If there is no response from H5 in the given max time we assume
         // that we are not being hosted in a supported version of H5.
         this.logDebug('onTimeout: No user message from H5');
         this.isMessagePending = false;
         this.isExecuting = false;
         if (this.queue.length > 0) {
            this.loadUserId();
         }
      }
   }

   private parseMessage(data: any): IMessage {
      try {
         const message = JSON.parse(data) as IMessage;
         return message;
      } catch (ex) {
         this.logError(
            'parseMessage: Failed to parse: ' + JSON.stringify(data),
         );
      }
      return null;
   }

   private onMessage(data: any) {
      if (!data || typeof data !== 'string') {
         return;
      }

      const message = this.parseMessage(data);
      if (!message) {
         return;
      }

      if (message.m3Command === 'user') {
         this.logDebug('onMessage: User message from H5');
         const response = message.m3Response as IUserResponse;
         this.m3User = response.m3User;
         this.principalUser = response.principalUser;
         this.isMessagePending = false;
         UserServiceCore.isH5Host = true;
         const userContext = this.createUserContext(response.userContext);
         this.setContext(userContext);
      }
   }

   private registerMessage() {
      const eventMethod = window.addEventListener
         ? 'addEventListener'
         : 'attachEvent';
      const eventer = window[eventMethod];
      const messageEvent =
         eventMethod === 'attachEvent' ? 'onmessage' : 'message';
      eventer(
         messageEvent,
         (e) => {
            const key = e.message ? 'message' : 'data';
            const data = e[key];
            this.onMessage(data);
         },
         false,
      );
   }

   private sendMessage(message: IMessage) {
      parent.postMessage(JSON.stringify(message), '*');
   }

   private createErrorContext(errorMessage: string) {
      const context = new UserContext() as IUserContext;
      context.errorMessage = errorMessage;
      this.userContext = context;
   }

   private processQueue(isResolved: boolean) {
      const queue = this.queue;
      this.queue = [];
      for (const subject of queue) {
         if (isResolved) {
            subject.next(this.userContext);
            subject.complete();
         } else {
            subject.error(this.userContext);
         }
      }
      this.isExecuting = false;
   }

   private rejectQueue(errrorMessage: string) {
      this.createErrorContext(errrorMessage);
      this.processQueue(false);
   }

   private loadUserId() {
      if (this.isExecuting) {
         return;
      }
      this.isExecuting = true;

      this.loadUserData();
   }

   private loadUserData() {
      const parameters = {};
      const usid = this.m3User;

      const request: IMIRequest = {
         program: 'MNS150MI',
         transaction: 'GetUserData',
      };

      this.miService.execute(request).subscribe(
         (response: IMIResponse) => {
            this.onUserData(response.item);
         },
         (response: any) => {
            this.rejectQueue(response.errorMessage);
         },
      );
   }

   private addAliases(context: IUserContext) {
      // Add additional alias fields for some values
      // Note that some values are duplicated with alternative case for compatibility with MForms / H5
      context.m3User = context.USID;
      context['M3User'] = context.USID;
      context.company = context.CONO;
      context['Company'] = context.CONO;
      context.currentCompany = context['CurrentCompany'] || context.CONO;
      context['CurrentCompany'] = context['CurrentCompany'] || context.CONO;
      context.division = context.DIVI;
      context['Division'] = context.DIVI;
      context.currentDivision = context['CurrentDivision'] || context.DIVI;
      context['CurrentDivision'] = context['CurrentDivision'] || context.DIVI;
      context.language = context.LANC;
      context['Language'] = context.LANC;
      context.currentLanguage = context['CurrentLanguage'] || context.LANC;
      context['CurrentLanguage'] = context['CurrentLanguage'] || context.LANC;

      context.dateFormat = CommonUtil.getDateFormat(context.DTFM);
      context.languageTag = CommonUtil.getLanguageTag(context.LANC);

      context.numberFormatOptions = {
         separator: context.DCFM,
      };

      const options = { dateFormat: Constants.dateFormatLong } as IDateOptions;
      let date = context.FADT;
      if (date) {
         context.firstActiveDate = FormatUtil.parseDate(date, options);
      }
      date = context.LADT;
      if (date) {
         context.lastActiveDate = FormatUtil.parseDate(date, options);
      }

      // User context values from H5 login reply
      const theme = context['Theme'];
      if (theme) {
         context.theme = theme;
      }

      const tenant = context['Tenant'];
      if (tenant) {
         context.tenant = tenant;
         const isSingleTenant = tenant === 'infor';
         context.isMultiTenant = !isSingleTenant;
      }

      const ionApiUrl = context['IonApiUrl'];
      if (ionApiUrl) {
         context.ionApiUrl = ionApiUrl;
      }

      // TODO Consider adding the rest of the aliases that are available in MForms
   }

   private setContext(context: IUserContext) {
      this.m3User = context.USID;
      context.principalUser = this.principalUser;
      this.addAliases(context);
      this.userContext = context;
      this.updateDependent(context);
   }

   private updateDependent(context: IUserContext) {
      // Internally set user context
      const company = context.currentCompany;
      const division = context.currentDivision;
      Configuration.update(context);
      (this.miService['instance'] as any).updateUserContext(company, division);
      this.processQueue(true);
      this.logInfo(
         'setContext: Initialized user context for ' +
            this.m3User +
            ' ' +
            company +
            '/' +
            division,
      );
   }

   private onUserData(item) {
      const context = this.createUserContext(item);
      this.setContext(context);
   }

   private createUserContext(item): IUserContext {
      const context: IUserContext = new UserContext();
      // Add all fields from the response record
      Object.assign(context, item);
      return context;
   }

   public getUserContext(): Observable<IUserContext> {
      const subject = new AsyncSubject<IUserContext>();

      if (!this.isUserContextAvailable) {
         this.createErrorContext('M3 UserContext not available');
         subject.error(this.userContext);
      } else if (this.userContext) {
         subject.next(this.userContext);
         subject.complete();
      } else {
         this.queue.push(subject);
         this.loadUserId();
      }

      return subject.asObservable();
   }

   public updateUserContext(context: IUserContext, principalUser: string) {
      if (principalUser) {
         this.principalUser = principalUser;
      }
      if (this.userContext) {
         this.logDebug('setUserContext: Updating user context after logon');
         Object.assign(this.userContext, context);
      } else {
         this.userContext = this.createUserContext(context);
         this.logDebug('setUserContext: Creating user context after logon');
      }
      this.isUserContextAvailable = true;
      this.addAliases(context);
      this.updateDependent(this.userContext);
   }
}

/**
 * @hidden
 */
export class ApplicationServiceCore
   extends CoreBase
   implements IApplicationService
{
   constructor() {
      super('ApplicationServiceCore');
   }

   isH5(): boolean {
      return UserServiceCore.isH5Host;
   }

   launch(link: string): void {
      const task: ITask = {
         link: link,
      };
      const message: IMessage = {
         m3Command: 'launch',
         m3Parameter: task,
      };
      this.sendMessage(message);
   }

   private sendMessage(message: IMessage) {
      parent.postMessage(JSON.stringify(message), '*');
   }
}
