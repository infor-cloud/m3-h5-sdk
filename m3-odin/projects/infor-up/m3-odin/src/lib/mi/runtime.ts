import { AsyncSubject, catchError, concatMap, defer, Observable, of, throwError } from 'rxjs';
import { CoreBase } from '../base';
import { AjaxHttpService } from '../http';
import { IHttpRequest, IHttpResponse, IHttpService } from '../types';
import { ArrayUtil, CoreUtil, HttpUtil, StringUtil } from '../util';
import { IMIMetadataInfo, IMIMetadataMap, IMIResponse, IMIService, MIDataType } from './base';
import { IMIRequest } from './types';

/**
 * Represents input and output records used when executing M3 MI transactions.
 *
 * ```typescript
 * import { MIRecord } from '@infor-up/m3-odin';
 * ```
 *
 * The MIRecord class is always used for the output data in transaction responses.
 * The MIRecord class can also be used for input but this is optional. When used for input the MIRecord class can help with
 * converting the input data to the correct transaction format. Input records can also be created with a simple JavaScript object literal.
 *
 * The format of input data is import for date fields and numeric fields that may contain decimals.
 * The date format for date fields must be 'yyyyMMdd' and the decimal separator for decimal fields must be '.'.
 * There are several set functions on the MIRecord class that can be used to set input data on the correct format.
 *
 * For output the MIRecord may contains typed data if the {@link IMIRequest.typedOutput} property was set to true in the request.
 * If this property was not set all output fields will be of type string and may require conversion for dates and numbers.
 *
 * **Example**
 * ```typescript
 * // Create input record with JavaScript object literal
 * const record = { USID: 'MVXSECOFR', STAT: '20' };
 * ```
 *
 * **Example**
 * ```typescript
 * // Create input record with MIRecord
 * const record = new MIRecord();
 * const today = new Date();
 * record.setDateString('ORDT', today);
 * ```
 *
 * @since 2.0.0
 */
export class MIRecord {
   /**
    * Creates a new MIRecord instance
    * @param values Optional initial values.
    */
   public constructor(values?: any) {
      if (values) {
         // Copy values
         Object.assign(this, values);
      }
   }

   /**
    * Gets or sets a field metadata map.
    * To get metdata the [IMIRequest.includemetadata] property has to be set to true.
    */
   public metadata: IMIMetadataMap = null;

   /**
    * Sets a number by converting it to a string using the dot as decimal separator.
    * @param name The name of the field.
    * @param value The value to set.
    */
   public setNumberString(name: string, value: number): void {
      this[name] = value.toString(); // Formatting with . separator is default
   }

   /**
    * Sets a number string. The value must use dot as decimal separator since that is the supported format for M3 API transactions.
    * @param name The name of the field.
    * @param value The value.
    */
   public setNumber(name: string, value: string): void {
      this[name] = value;
   }

   /**
    * Sets a date and transforms it to a string using the date format for M3 API transactions (yyyyMMdd).
    * @param name The name of the field.
    * @param value The value.
    */
   public setDateString(name: string, value: Date): void {
      this[name] = MIUtil.getDateFormatted(value);
   }

   /**
    * Sets the date as a Date.
    * @param name The name of the field.
    * @param value The value.
    */
   public setDate(name: string, value: Date): void {
      this[name] = value;
   }

   /**
    * Sets a string value.
    * @param name The name of the field.
    * @param value The value.
    */
   public setString(name: string, value: string): void {
      this[name] = value;
   }
}

/**
 * Represents the response from an M3 MI transaction. See {@link IMIResponse}.
 * @hidden
 *
 * @since 2.0.0
 */
export class MIResponse implements IMIResponse {
   public program: string = null;
   public transaction: string = null;
   public tag: any;
   public item: MIRecord;
   public items: MIRecord[];
   public errorField: string;
   public errorType: string;
   public error: any;
   public errorMessage: string;
   public errorCode: string;
   public metadata: IMIMetadataMap;

   public hasError(): boolean {
      const state = this;
      return !!(state.errorMessage || state.errorCode || state.error);
   }
}

/**
 * Utility class with MI related functions.
 *
 * ```typescript
 * import { MIUtil } from '@infor-up/m3-odin';
 * ```
 *
 * @since 2.0.0
 */
export class MIUtil {
   /**
    * Gets a value that indicates if the parameter is a date.
    * @param date The value to check.
    * @returns True if the value if a Date.
    */
   public static isDate(date: any): boolean {
      return date instanceof Date && !isNaN(date.valueOf());
   }

   /**
    * Converts a date or number to a valid MI Format. Note that strings will not be converted.
    * @param The value, a date, string or number. Note that the value has to be a Date object for dates and a number for numbers.
    * @returns A string in MI format.
    */
   public static toMIFormat(value: any): string {
      if (!CoreUtil.hasValue(value)) {
         return '';
      }
      if (MIUtil.isDate(value)) {
         return MIUtil.getDateFormatted(value);
      } else {
         return value.toString(); // Default separator for numbers are .
      }
   }

   /**
    * Creates a MIRecord that contains only the updated fields and the mandatory keys.
    * Should be used when making an update transaction so that unchanged values are not set by the update transaction.
    * Note that the values must have the correct type. Dates must be date objects and numeric values must be numbers.
    * @param originalValues A {@link MIRecord} with the original values, for example the values from a Get or List transaction.
    * @param newRecord A MIRecord or object with parameters for all values using the correct data type for the transaction.
    * @param fieldNames An array with field names that should be updated (if the value has changed). This list does not need to contain
    * the mandatory fields.
    * @param mandatoryFields An array with mandatoryFields. The mandatory fields should always be added to the new record.
    * @returns A {@link MIRecord} that should be used in an update transaction.
    */
   public static createUpdateRecord(originalValues: MIRecord, newRecord: any, fieldNames: string[], mandatoryFields: string[]): MIRecord {

      const updateRecord = new MIRecord();
      // Create copy
      const allFields = [...fieldNames];

      if (mandatoryFields != null && mandatoryFields.length > 0) {
         for (let i = 0; i < mandatoryFields.length; i++) {
            const mandatoryField = mandatoryFields[i];
            if (!(ArrayUtil.contains(allFields, mandatoryField))) {
               allFields.push(mandatoryField);
            }
         }
      }
      allFields.forEach((field, index) => {
         const oldValue = originalValues[field];
         const newValue = newRecord[field];
         // Always include mandatory fields
         if (ArrayUtil.contains(mandatoryFields, field)) {
            if (CoreUtil.hasValue(newValue)) {
               updateRecord[field] = MIUtil.toMIFormat(newValue);
            } else {
               updateRecord[field] = MIUtil.toMIFormat(oldValue);
            }
         } else if (CoreUtil.hasValue(newValue) && newValue !== oldValue) {
            updateRecord[field] = newValue;
         }
      });
      return updateRecord;
   }

   /**
   * Returns a string formatted in the database format yyyyMMdd which is the format used in all M3 API transactions.
   * @param date A date object.
   * @returns A string representaion of the date in yyyyMMdd format.
   */
   public static getDateFormatted(date: Date): string {
      const yyyy = date.getFullYear().toString();
      const mm = (date.getMonth() + 1).toString(); // getMonth() is zero-based
      const dd = date.getDate().toString();
      return yyyy + (mm.length === 2 ? mm : '0' + mm[0]) + (dd.length === 2 ? dd : '0' + dd[0]); // padding
   }

   /**
    * Converts a string in the database format yyyMMdd to a Date object. This method will throw an exception.
    * @param yyyymmdd A date in database format.
    * @returns A date object.
    */
   public static getDate(yyyymmdd: string): Date {
      const dateString = yyyymmdd;
      const year: number = +dateString.substring(0, 4);
      const month: number = +dateString.substring(4, 6);
      const day: number = +dateString.substring(6, 8);

      // Month is zero based
      return new Date(year, month - 1, day);
   }

   /**
    * Converts a dictionary structure to an array.
    * @param metdataMap A map structure where the key is the field name and the value is a {@link MIMetadataInfo}.
    * @returns An array with {@link MIMetadataInfo}.
    *
    */
   public static metadataToArray(metadataMap: IMIMetadataMap): IMIMetadataInfo[] {
      const array = new Array();
      for (const field in metadataMap) {
         if (metadataMap.hasOwnProperty(field)) {
            const metadata = metadataMap[field];
            array.push(metadata);
         }
      }
      return array;
   }
}

/**
 * Implementation of {@link IMIMetadataInfo}.
 * @hidden
 *
 * @since 2.0.0
 */
export class MIMetadataInfo implements IMIMetadataInfo {
   public name: string;
   public type: MIDataType;
   public length: number;
   public description: string;

   constructor(name: string, length: number, typeString: string, description: string) {
      this.name = name;
      this.length = length;
      this.description = description;
      this.setType(typeString);
   }

   public isNumeric(): boolean {
      return this.type === MIDataType.Numeric;
   }

   public isDate(): boolean {
      return this.type === MIDataType.Date;
   }
   public isString(): boolean {
      return this.type === MIDataType.String;
   }

   private setType(value: string) {
      if (value === 'D') {
         this.type = MIDataType.Date;
      } else if (value === 'N') {
         this.type = MIDataType.Numeric;
      } else if (value === 'A') {
         this.type = MIDataType.String;
      }
   }
}

/**
 * Implementation of the {@link IMIService} interface.
 *
 * ```typescript
 * import { MIServiceCore } from '@infor-up/m3-odin';
 * ```
 *
 * **This class should not be used directly in Angular projects, inject the MIService class instead.**
 *
 * @since 2.0.0
 */
export class MIServiceCore extends CoreBase implements IMIService {
   /**
    * @hidden
    */
   static baseUrl = ''; // The default base URL for M3 in ION API

   /**
    * @hidden
    */
   static isIonApi = false; // TODO not implemented yet

   private csrfToken: string;
   private csrfTimestamp = 0;
   private csrfStatus = 0;
   private readonly maxTokenAge = 30000;
   private currentCompany: string = null;
   private currentDivision: string = null;

   constructor(private http?: IHttpService) {
      super('MIServiceCore');
      if (!http) {
         this.http = new AjaxHttpService();
         this.logDebug('IHttpService not passed using default implmentation');
      }
   }

   private createRequest(url: string): IHttpRequest {
      return {
         method: 'GET',
         url: url,
         responseType: 'json',
         body: null,
         headers: {
            'Content-Type': 'application/json; charset=UTF-8',
            'Accept': 'application/json'
         }
      };
   }

   private isTokenValid(): boolean {
      if (!this.csrfToken) {
         return false;
      }

      const age = new Date().getTime() - this.csrfTimestamp;
      return age < this.maxTokenAge;
   }

   private useToken(request: IMIRequest): boolean {
      if (request.enableCsrf === false) {
         return false;
      }
      if (this.csrfStatus === 404) {
         return false;
      }
      return true;
   }

   private executeRefreshToken(request: IMIRequest): Observable<IMIResponse> {
      const url = this.getCsrfUrl(this.getBaseUrl(request));
      const httpRequest = {
         method: 'GET',
         url: url,
         cache: false
      };

      return this.executeHttp(httpRequest).pipe(
         concatMap(httpResponse => {
            this.csrfStatus = httpResponse.status;
            this.csrfToken = httpResponse.body;
            this.csrfTimestamp = new Date().getTime();
            return this.executeInternal(request);
         }),
         catchError(httpResponse => {
            this.csrfStatus = httpResponse.status;
            this.csrfToken = null;

            if (this.csrfStatus !== 404) {
               const message = 'Failed to get CSRF token ' + this.csrfStatus;
               this.logError(message);
               const errorResponse = new MIResponse();
               errorResponse.errorMessage = message;
               errorResponse.errorType = 'TOKEN';
               return throwError(() => errorResponse);
            }
            return this.executeInternal(request);
         }),
      );
   }

   private executeHttp<T>(request: IHttpRequest): Observable<IHttpResponse> {
      if (MIServiceCore.isIonApi) {
         // return MIService.widgetContext.executeIonApiAsync(options);
      }
      return this.http.execute(request);
   }

   private resolve<T>(items: AsyncSubject<T>[], value: any): void {
      for (const item of items) {
         item.next(value);
         item.complete();
      }
      // Clear the array
      items.splice(0, items.length);
   }

   private reject<T>(items: AsyncSubject<T>[], reason: any): void {
      for (const item of items) {
         item.error(reason);
      }
      // Clear the array
      items.splice(0, items.length);
   }

   private getLogInfo(response: IMIResponse): string {
      return response.program + ' ' + response.transaction;
   }

   /**
    * See {@link IMIService.execute}
    */
   public execute(request: IMIRequest): Observable<IMIResponse> {
      return defer(() => {
         if (!this.useToken(request) || this.isTokenValid()) {
            return this.executeInternal(request);
         } else {
            return this.executeRefreshToken(request);
         }
      });
   }

   // Called internally to save the user context. Note that it is not in the interface.
   /**
    * @hidden
    */
   public updateUserContext(company: string, division: string): void {
      this.logDebug('updateUserContext: ' + company + '/' + division);
      this.currentCompany = company;
      this.currentDivision = division;
   }

   /**
    * @hidden
    */
   public getDefaultBaseUrl() {
      return '/m3api-rest/execute';
   }

   /**
    * @hidden
    */
   public getCsrfUrl(baseUrl: string): string {
      return HttpUtil.combine(baseUrl, '/m3api-rest/csrf');
   }

   /**
    * @hidden
    */
   public createUrl(baseUrl: string, request: IMIRequest): string {
      let url = baseUrl + '/' + request.program + '/' + request.transaction;
      let maxRecords = 100;
      let excludeEmpty = 'true';
      let metadata = 'true';
      let returnCols = null;
      if (request.maxReturnedRecords >= 0) {
         maxRecords = request.maxReturnedRecords;
      }
      if (!request.excludeEmptyValues) {
         excludeEmpty = 'false';
      }
      if (request.outputFields && request.outputFields.length > 0) {
         returnCols = request.outputFields.join(',');
      }

      if (request.includeMetadata) {
         metadata = 'true';
         request.includeMetadata = true;
      } else {
         request.includeMetadata = false;
      }

      // Add 'mandatory' parameters
      url += ';metadata=' + metadata + ';maxrecs=' + maxRecords + ';excludempty=' + excludeEmpty;

      let company = request.company;
      let division = request.division;

      if (!company && this.currentCompany) {
         // If no values are set in the request and a user context exist the values from the user context are used.
         company = this.currentCompany;
         division = this.currentDivision;
         if (this.isDebug()) {
            this.logDebug('createUrl: using company ' + company + ' and division ' + division + ' from user context');
         }
      } else {
         this.logInfo('createUrl: company not set, user context not available.');
      }

      if (company) {
         url += ';cono=' + company;

         if (division || division === '') {
            url += ';divi=' + division;
         }
      }

      // Add optional parameters
      if (returnCols) {
         url += ';returncols=' + returnCols;
      }

      url += '?';

      let recordAdded = false;
      const record = request.record;
      if (record) {
         for (const field in record) {
            if (record.hasOwnProperty(field)) {
               const value = record[field];
               if (value != null) {
                  url += (recordAdded ? '&' : '') + field + '=' + encodeURIComponent(value);
                  if (!recordAdded) {
                     recordAdded = true;
                  }
               }
            }
         }
      }

      // TODO There should be an options that controls if the request ID
      url += (recordAdded ? '&_rid=' : '_rid=') + CoreUtil.random();

      return url;
   }

   public executeInternal(request: IMIRequest): Observable<IMIResponse> {
      const baseUrl = HttpUtil.combine(this.getBaseUrl(request), this.getDefaultBaseUrl());
      const url = this.createUrl(baseUrl, request);

      const httpRequest: IHttpRequest = this.createRequest(url);
      if (this.useToken(request)) {
         httpRequest.headers['fnd-csrf-token'] = this.csrfToken;
      }

      this.logDebug('execute: ' + url);
      return this.executeHttp(httpRequest).pipe(
         catchError(httpResponse => {
            const response = new MIResponse();
            const status = httpResponse.status;
            const message = 'Failed to call ' + request.program + '.' + request.transaction + ' ' + status;
            this.logWarning('execute: ' + message);
            response.errorMessage = message;
            response.errorCode = status.toString();
            return throwError(() => response);
         }),
         concatMap((httpResponse: IHttpResponse) => {
            try {
               const response = this.parseResponse(request, httpResponse.body); // was .data
               const hasError = response.hasError();
               if (hasError) {
                  this.logInfo('execute: ' + this.getLogInfo(response) + ' returned error.');
                  return throwError(() => response);
               }
               this.logInfo('execute: ' + this.getLogInfo(response) + ' completed OK');
               return of(response);
            } catch (ex) {
               const errorResponse = new MIResponse();
               this.logWarning('execute: exception parsing response ' + JSON.stringify(ex));
               errorResponse.error = ex;
               return throwError(() => errorResponse);
            }
         }),
      );
   }

   private getBaseUrl(request: IMIRequest): string {
      return request['baseUrl'] || MIServiceCore.baseUrl;
   }

   private parseMessage(response: IMIResponse, content: any) {
      const errorContent = content.ErrorMessage || content; // Error can be in the response, or in an ErrorMessage object, see KB 2159861
      const code = errorContent['@code'];
      const field = errorContent['@field'];
      const errorType = errorContent['@type'];
      let message = errorContent['Message'];
      if (message) {
         // Clean up the message that might contain the code, field and a lot of whitespace.
         if (code) {
            message = message.replace(code, '');
         }
         if (field) {
            message = message.replace(field, '');
         }
         response.errorMessage = message.trim();
      }
      response.errorCode = code ? code : errorType;
      response.errorField = field;
      response.errorType = errorContent['@type'];
   }

   /**
    * @hidden
    */
   public parseResponse(request: IMIRequest, content: any): IMIResponse {
      const response: IMIResponse = new MIResponse();
      response.tag = request.tag;

      const items = [];
      response.items = items;
      response.program = request.program;
      response.transaction = request.transaction;

      this.parseMessage(response, content);

      let metadata: IMIMetadataMap = null;
      if (request.includeMetadata) {
         metadata = this.getMetadata(content);
         response.metadata = metadata;
      }

      const records = content.MIRecord;
      if (records == null || records.length < 1) {
         // An empty response
         return response;
      }

      const isTypedOutput = request.typedOutput;
      for (let i = 0; i < records.length; i++) {
         const record: any = records[i];
         if (record != null) {
            const miRecord = new MIRecord();
            miRecord.metadata = metadata;

            if (record.NameValue) {
               for (let index = 0; index < record.NameValue.length; index++) {
                  const nameValue = record.NameValue[index];
                  const name: string = nameValue.Name;
                  let value: string = nameValue.Value;
                  if (value != null) {
                     value = StringUtil.trimEnd(value);
                  }
                  if (isTypedOutput) {
                     miRecord[name] = this.getTypedValue(name, value, metadata);
                  } else {
                     miRecord[name] = value;
                  }
               }
            }
            items.push(miRecord);
         }
      }

      if (items.length > 0) {
         response.item = items[0];
      }
      return response;
   }

   private getTypedValue(name: string, value: string, metadata: { [k: string]: IMIMetadataInfo }): any {
      try {
         if (metadata) {
            const metaDataInfo = metadata[name];
            if (!metaDataInfo) {
               return value;
            }

            const result = this.parseValue(value, metaDataInfo);
            return result;
         } else {
            return value;
         }
      } catch (e) {
         // TODO log but only once per field / transaction / program
         return value;
      }
   }

   private parseValue(value: string, metadataInfo: IMIMetadataInfo): any {
      if (metadataInfo.isString()) {
         return value;
      }
      if (metadataInfo.isNumeric()) {
         if (!value) {
            return 0;
         }
         return +value;
      }
      if (metadataInfo.isDate()) {
         if (!value) {
            return null;
         }
         return MIUtil.getDate(value);
      }
      return value;
   }

   private getMetadata(content: any): IMIMetadataMap {
      try {
         const input = content.Metadata;
         if (input && input.Field && input.Field.length > 1) {
            const metadataMap: IMIMetadataMap = {};
            const fields = input.Field;
            for (const record in fields) {
               if (fields.hasOwnProperty(record)) {
                  const entry = input.Field[record];
                  const name = entry['@name'];
                  const metaDataInfo = new MIMetadataInfo(name, entry['@length'], entry['@type'], entry['@description']);
                  metadataMap[name] = metaDataInfo;
               }
            }
            return metadataMap;
         }
      } catch (e) {
         // TODO Support some kind of logger injection for logging.
      }
      return null;
   }
}
