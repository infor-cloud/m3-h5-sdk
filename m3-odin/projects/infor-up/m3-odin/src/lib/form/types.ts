import { Observable } from 'rxjs';
import {
   IFormRequest,
   IFormResponse,
   ITranslationRequest,
   ITranslationResponse,
} from './base';

/**
 * Represents an M3 bookmark.
 *
 * ```typescript
 * import { IBookmark } from '@infor-up/m3-odin';
 * ```
 *
 * **Example**
 *
 * This example shows how to define a stateless bookmark definition for the E-panel in CRS610.
 *
 * ```typescript
 * private bookmark = {
 *    program: 'CRS610',
 *    table: 'OCUSMA',
 *    keyNames: 'OKCONO,OKCUNO',
 *    option: '5',
 *    panel: 'E',
 *    isStateless: true
 * } as IBookmark;
 * ```
 *
 * **Example**
 *
 * This example shows how to clone an existing bookmark definition and set some key values.
 * Note that CONO and DIVI fields can normally be left out since they are resolved automatically
 * using the M3 user context (if available).
 *
 * ```typescript
 * var bookmark = Object.assign(this.bookmark);
 * bookmark.values = {
 *    OKCONO: '100',
 *    OKCUNO: 'TEST'
 * };
 * ```
 *
 *@since 2.0.0
 */
export interface IBookmark {
   /**
    * Gets or sets the name of the bookmarked program.
    */
   program?: string;

   /**
    * Gets or sets the name of the database table.
    */
   table?: string;

   /**
    * Gets or sets the panel to start.
    */
   panel?: string;

   /**
    * Gets or sets the panel sequence.
    * If the panel sequence is not set the Bookmark will start using the default panel sequence for the user.
    */
   panelSequence?: string;

   /**
    * Gets or sets the start panel. Use this property to override the default start panel for the program.
    */
   startPanel?: string;

   /**
    * Gets or sets a value that indicates if the start panel (A or B) should be included when the Bookmark is started.
    */
   includeStartPanel?: boolean;

   /**
    * Gets or sets the option to use when starting the Bookmark.
    */
   option?: string;

   /**
    * Gets or sets the sorting order to use when starting the Bookmark.
    */
   sortingOrder?: string;

   /**
    * Gets or sets the View to use when starting the Bookmark.
    */
   view?: string;

   /**
    * Gets or sets an optional name of a field that should get focus when a detail panel bookmark is started.
    */
   focusFieldName?: string;

   /**
    * Gets or sets a comma separated list of key names. Use this property or the keys property.
    */
   keyNames?: string;

   /**
    * Gets or sets a comma separated list of key names and values. Use this property or the keyNames property.
    * The string should include all key names and values in the following pattern?: Key-1,Value-1,Key-2,Value-2,Key-N,Value-N.
    * The values should be URL encoded using the UTF-8 encoding to ensure that that the keys string can be parsed
    *  correctly on the BE server.
    */
   keys?: string;

   /**
    * Gets or sets a comma separated list of parameter names and values.
    */
   parameters?: string;

   /**
    * Gets or sets a comma separated list of parameter names.
    */
   parameterNames?: string;

   /**
    * Gets or sets a comma separated list of field names and values. Used for for setting field values on start panels.
    */
   fieldNames?: string;

   /**
    * Gets or sets a comma separated list of field names and values. Used for for setting field values on start panels.
    */
   fields?: string;

   /**
    * Gets or sets a value that indicates if the bookmark should be statelenss or not.
    * Stateless bookmarks will execute on the MUA server and then close the BE program before returning the response.
    *
    * The default value is true.
    */
   isStateless?: boolean;

   /**
    * Gets or sets an optional source application.
    */
   source?: string;

   /**
    * Gets or sets an automation XML string.
    */
   automation?: string;

   /**
    * Gets or sets the name of an automation template.
    */
   automationTemplate?: string;

   /**
    * Gets or sets a value that indicates if the bookmark must return an interactive panel or not.
    * The default value is true. This property should only be set to false in special cases for bookmarks that do
    * not return a panel. If this property is set to false no message will be displayed if the bookmark executed correctly
    * but did not return a panel.
    */
   requirePanel?: boolean;

   /**
    * Gets or sets a value that indicates if initial confirm dialogs from BE should be automatically suppressed by pressing the ENTER key.
    * The default value is false. Only use this property for special cases.
    * There is currently no way to capture the message in the confirm dialog.
    */
   suppressConfirm?: boolean;

   /**
    *
    */
   values?: any;

   /**
    * Gets or sets the Information category used for customized lists.
    */
   informationCategory?: string;

   /**
    * Gets or sets the number of filters for customized lists.
    */
   numberOfFilters?: string;

   /**
    * Gets or sets additional request parameters that is not bookmark specific but will be included in the request.
    */
   params?: any;
}

/**
 * Represents a search request for functional search in an M3 program.
 *
 * ```typescript
 * import { IBookmark } from '@infor-up/m3-odin';
 * ```
 *
 * @since 2.0.0.
 */
export interface ISearchRequest {
   /**
    * The name of the M3 program.
    *
    * Example: 'MMS001'
    */
   program: string;

   /**
    * The search query.
    */
   query: string;

   /**
    * Optional sorting order. If not specified the default sorting order in the program will be used.
    *
    * Example: '1'
    */
   sortingOrder?: string;

   /**
    * Optional view. If not specified the default view in the program will be used.
    *
    * Example: 'STD01-01'
    */
   view?: string;

   /**
    * Optional array pf filter field names.
    *
    * Example: ['ITNO', 'ITTY', 'ITDS', 'STAT', 'TPCD']
    */
   filterFields?: string[];

   /**
    * Optional map start panel fields and values.
    *
    * Example: { 'W1OBKV': 'TEST', 'W2OBKV': ' ' }
    */
   startPanelFields?: { [key: string]: string };
}

/**
 * Defines environment context values. The values are also available on the user context if the application is running in a H5 tab.
 * This context is only useful when there is an application without an existing H5 session but there is still the need to get
 * the ION Api URL. Calling this method might result in a login if the data isn't already available.
 *
 * ```
 * import { IEnvironmentContext } from '@infor-up/m3-odin';
 * ```
 *
 * @since 2.0.0
 */
export interface IEnvironmentContext {
   /**
    * If H5 is running multiple tenants. Default is false.
    */
   isMultiTenant: boolean;
   /**
    * The ION Api Url. Default if not configured is null.
    */
   ionApiUrl: string;
   /**
    * Get the H5 version.
    */
   version?: string;
}

/**
 * Represents the M3 form service.
 *
 * ```typescript
 * import { IBookmark } from '@infor-up/m3-odin';
 * ```
 *
 * The form service can be used to launch stateless requests for bookmarks, search and translation.
 *
 * @since 2.0.0
 */
export interface IFormService {
   /**
    * Executes a stateless bookmark request for an M3 detail or list panel.
    * @param bookmark The bookmark to execute.
    * @returns An observable that will be completed with a form response.
    */
   executeBookmark(bookmark: IBookmark): Observable<IFormResponse>;

   /**
    * Executes a stateless search request for an M3 list panel.
    * @param request The search request to execute.
    * @returns An observable that will be completed with a form response.
    */
   executeSearch(request: ISearchRequest): Observable<IFormResponse>;

   /**
    * Executes a stateless translation request.
    * @param request The translation request to execute.
    * @returns An observable that will be completed with a translation response.
    */
   translate(request: ITranslationRequest): Observable<ITranslationResponse>;

   /**
    * Gets the environment context information. If there is an existing user context the values will be retreived from the user context.
    * Don't call this method if the application will run within the H5 tab system.
    * The values in the Environment context are also available on the user context if the application is running in a H5 tab.
    */
   getEnvironmentContext(): Observable<IEnvironmentContext>;

   /**
    * Only to be used under development. Can be used to force a specific environment context.
    * @param context Environment context
    */
   developmentSetEnvironmentContext(context: IEnvironmentContext);

   /**
    * Executes a form request.
    * @param request The request to execute.
    * @returns An observable that will be completed with a form response.
    */
   executeRequest(request: IFormRequest): Observable<IFormResponse>;

   /**
    * Executes a form command.
    * @param commandType The command type to execute.
    * @param commandValue Optional command value depending on the type of commands.
    * @param params Optional additional parameters.
    * @returns An observable that will be completed with a form response.
    */
   executeCommand(
      commandType: string,
      commandValue?: string,
      params?: any
   ): Observable<IFormResponse>;
}
