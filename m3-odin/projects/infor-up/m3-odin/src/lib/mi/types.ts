
/**
 * Represents a name value pair that is returned by the M3 API for each field.
 *
 * @hidden
 *
 * @since 2.0.0
 */
export interface INameValue {
   /**
    * Gets thhe name of the value.
    */
   name: string;
   /**
    * Gets the value.
    */
   value: string;
}

/**
 * Represents options for executing an MI request. See {@link IMIRequest}.
 *
 * ```typescript
 * import { IMIOptions } from '@infor-up/m3-odin';
 * ```
 *
 * **Example**
 * ```typescript
 * const request = {
 *    program: 'CRS610MI',
 *    transaction: 'LstByNumber',
 *    excludeEmptyValues: true,
 *    maxReturnedRecords: 10
 * } as IMIRequest;
 * ```
 *
 * @since 2.0.0
 */
export interface IMIOptions {
   /**
    * Gets or sets the company to use for the request.
    * If this value is set it will override the company from other sources such as the user context.
    */
   company?: string;

   /**
    * Gets or sets the division to use for the request.
    * If this value is set it will override the division other sources such as the user context.
    */
   division?: string;

   /**
    * Gets or sets a value that indicates if empty values should be returned from the server.
    * The default value is false.
    */
   excludeEmptyValues?: boolean;

   /**
    * Gets or sets the maximum number of records to return.
    * Always check maxReturnedRecordsFieldSpecified before using this value since 0 means that all rows should be returned.
    */
   maxReturnedRecords?: number;

   /**
    * Gets or sets an arbitrary object value that can be used to store custom information about this request.
    * The value will be returned in the tag property of the MIReponse object.
    */
   tag?: any;

   /**
    * Gets or sets a value that indicates if metadata should be included as part of the response.
    * The default value is false.
    */
   includeMetadata?: boolean;

   /**
   * Gets or sets a value that indicates if output should be converted to numbers and dates
   * according to the metadata definition for the MI transaction.
   * This implicitly turns on includeMetadata in the options to load the metadata information.
   * The default value is false.
   */
   typedOutput?: boolean;

   /**
    * Gets or sets a value that indicates if CSRF tokens should be used for MI-requests.
    * The default value is true.
    */
   enableCsrf?: boolean;

   /**
    * Overrides the user that will execute the API call towards M3
    */
   m3User?: string;
}

/**
 * Represents an M3 MI transaction request.
 *
 * ```typescript
 * import { IMIRequest } from '@infor-up/m3-odin';
 * ```
 *
 * It is recommended to always set the {@link IMIRequest.outputFields} property to limit the amount of data that is returned.
 * Also consider setting {@link IMIOptions.maxReturnedRecords} property to the lowest possible value for list transactions when applicable.
 *
 * **Example**
 * ```typescript
 * const record = { USID: 'MVXSECOFR' };
 * const request = {
 *    program: 'MNS150',
 *    transaction: 'GetUserData',
 *    record: record,
 *    outputFields: ['CONO', 'DIVI', 'USID', 'NAME']
 * };
 * ```
 *
 * You can also use the [[MIRecord]] class to set input data to get date or numeric values converted to the correct format.
 *
 * **Example**
 * ```
 * const record = new MIRecord();
 * const today = new Date();
 * record.setDateString('LSTD', today);
 *
 * const quantity = 1.5;
 * record.setNumberString('QQTY', quantity);
 * ```
 *
 * @since 2.0.0
 */
export interface IMIRequest extends IMIOptions {
   /**
    * Gets or sets the name of the MI program.
    */
   program: string;

   /**
    * Gets or sets the name of the transaction.
    */
   transaction: string;

   /**
   * Gets or sets the MIRecord containing the input data to the transaction.
   * This property is not required for transactions without mandatory input fields.
   */
   record?: any;

   /**
    * Gets or sets an array with the names of the output fields to return from a transaction.
    *
    * Use this property to limit the amount of data to transfer from the server.
    * Only specify the names of the fields that will actually be used since that will approve the performance.
    */
   outputFields?: string[];
}
