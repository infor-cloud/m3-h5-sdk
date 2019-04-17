import { Observable } from 'rxjs';
import { IMIRequest } from './types';

/**
 * Defines the possible data types for an MI value (String, Numeric or Date).
 *
 * ```typescript
 * import { MIDataType } from '@infor-up/m3-odin';
 * ```
 *
 * @since 2.0.0
 */
export enum MIDataType {
   /**
    * String data type.
    */
   String,
   /**
    * Numeric data type.
    */
   Numeric,
   /**
    * Date data type.
    */
   Date
}

/**
 * Defines constants used by MI related classes.
 *
 * ```typescript
 * import { MIConstants } from '@infor-up/m3-odin';
 * ```
 *
 * @since 2.0.0
 */
export class MIConstants {
   /**
    * Gets the database date format for M3 API transactions (yyyyMMdd).
    */
   public static readonly datePattern = 'yyyyMMdd';

   /**
    * Gets the decimal separator for M3 API values (.).
    */
   public static readonly decimalSeparator = '.';
}

/**
 * Represents metadata about an M3 API field.
 *
 * ```typescript
 * import { IMIMetadataInfo } from '@infor-up/m3-odin';
 * ```
 *
 * @since 2.0.0
 */
export interface IMIMetadataInfo {
   /**
    * Gets the name of the field.
    */
   name: string;

   /**
    * Gets the field type.
    */
   type: MIDataType;

   /**
    * Gets the maximum length of the field.
    */
   length: number;

   /**
    * Gets the description of the field.
    */
   description: string;

   /**
    * Gets a value that indicates if the field is defined as a numeric type.
    *
    * @returns True if the field is numeric.
    */
   isNumeric(): boolean;

   /**
    * Gets a value that indicates if the field is defined as a date type.
    *
    * @returns True if the field is a date.
    */
   isDate(): boolean;

   /**
    * Gets a value that indicates if the field is defined as a string type.
    *
    * @returns True if the field is a string.
    */
   isString(): boolean;
}

/**
 * Represent a dictionary of MI field metadata objects.
 *
 * ```typescript
 * import { IMIMetadataMap } from '@infor-up/m3-odin';
 * ```
 *
 * **Example**
 * ```typescript
 * const info = metadataMap['ITNO'];
 * ```
 *
 * @since 2.0.0
 */
export interface IMIMetadataMap {
   /**
    * Gets metadata for a field.
    *
    * @param name The name of the field. For example ITNO.
    * @returns the metadata info for that field
    */
   [name: string]: IMIMetadataInfo;
}

/**
 * Represents the response from an M3 MI transaction.
 *
 * ```typescript
 * import { IMIResponse } from '@infor-up/m3-odin';
 * ```
 *
 * The response contains a single MIRecord or a list of MIRecords that can be accesses through the item and items properties.
 * Note that the type of the item and items properties are any and any[] to simplify field value access.
 *
 * If the request has [[IMIRequest.typedOutput]] set to true all values in the response will be typed according
 * to the [[MIDataType]], (String, Numeric and Date). The default is that all values are strings.
 *
 * **Example**
 * ```typescript
 * this.miService.execute(request).subscribe((response: IMIResponse) => {
 *    const item = response.item
 *    if (item) {
 *       this.updateName(item.NAME);
 *    }
 * }
 * ```
 *
 * @since 2.0.0
 */
export interface IMIResponse {
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
    * Gets or sets the name of the MI program.
    */
   program?: string;

   /**
    * Gets or sets the name of the transaction.
    */
   transaction?: string;

   /**
   * Gets the first item in the items list. The item is of type [[MIRecord]].
   */
   item?: any;

   /**
    * Gets or sets a list or MIRecords returned from the transaction. See [[MIRecord]].
    */
   items?: any[];

   /**
    * Gets or sets the transaction field that is the cause of the error.
    */
   errorField?: string;

   /**
    * Gets or sets the error type.
    */
   errorType?: string;

   /**
    * Metadata describing the values and their data types. To get the metadata set [[IMIOptions.includeMetadata]]
    */
   metadata: IMIMetadataMap;

   /**
    * Gets an arbitrary object value that was set on the tag property on the IMIRequest object.
    */
   tag?: any;

   /**
    * Gets a value that indicates if an error exists in the response.
    *
    * An error is considered to exist if any of the error, errorMessage or errorCode properties are set.
    * Note that if one property is set there is no guarantee that any of the other properties are set.
    *
    * @returns True if an error exists.
    */
   hasError(): boolean;
}

/**
 * Represents a service for executing transactions in M3 MI programs.
 *
 * ```typescript
 * import { IMIService } from '@infor-up/m3-odin';
 * ```
 *
 * The service has a single function called executeRequest that returns an Observable
 * since the MI request is asynchronous. The Observable will be comleted with an [[IMIResponse]]
 * when the transaction has finished executing.
 *
 *  **Example**
 * ```typescript
 * const record = { USID:'MVXSECOFR' };
 * const request: = {
 *    program: 'MNS150MI',
 *    transaction: 'GetUserData',
 *    record: record,
 *    outputFields: ['CONO', 'DIVI', 'USID', 'NAME']
 * } as IMIRequest;
 *
 * this.miService.executeRequest(request).subscribe((response: IMIResponse) => {
 *    // Handle the response...
 * }, (response: IMIResponse) => {
 *    // Handle the error response...
 * });
 * ```
 *
 * @since 2.0.0
 */
export interface IMIService {
   /**
    * Executes an MI transaction.
    *
    * @param request The request to execute.
    * @returns An Observable that will be completed with a response or an error response if the transaction failes.
    */
   execute(request: IMIRequest): Observable<IMIResponse>;
}
