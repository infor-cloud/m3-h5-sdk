import { ErrorState } from '../base';
import { IUserContext } from '../m3/types';
import { IErrorState } from '../types';
import { FormConstants } from './constants';
import { FormControl, IFormControlInfo, Panel } from './elements';
import { IBookmark } from './types';

/**
 * Represents a request for M3 Forms.
 *
 * ```typescript
 * import { IFormRequest } from '@infor-up/m3-odin';
 * ```
 *
 * @since 2.0.0
 */
export interface IFormRequest {
   /**
    * The type of command to execute.
    */
   commandType?: string;

   /**
    * Optional command value depending on the type of command.
    */
   commandValue?: string;

   /**
    * Session ID. A session ID is required for most request except for logon.
    */
   sessionId?: string;

   /**
    * Instance ID. The instance ID identifies a running M3 program.
    */
   instanceId?: string;

   /**
    * Additional request parameters.
    */
   params?: any;

   /**
    * Optional request parameter resolver function that will be called when the user context is available.
    */
   resolver?: (request: IFormRequest, userContext: IUserContext) => void;
}

/**
 * Represents a response for M3 Forms.
 *
 * ```typescript
 * import { IFormResponse } from '@infor-up/m3-odin';
 * ```
 *
 * @since 2.0.0
 */
export interface IFormResponse extends IErrorState {
   /**
    * Gets the request object used to get this response.
    */
   request?: IFormRequest;

   /**
    * Gets the result code.
    */
   result?: number;

   /**
    * Gets the session ID for an interactive session if one exists.
    */
   sessionId?: string;

   /**
    * Gets the user data if the response is from a successfull login request.
    */
   userData?: any;

   /**
    * The response document.
    */
   document?: Document;

   /**
    * Gets the principal user if the response is from a successfull login request.
    */
   principalUser?: string;

   /**
    * Get the instance ID if an M3 program is running.
    */
   instanceId?: string;

   /**
    * Gets a message.
    */
   message?: string;

   /**
    * Gets a message ID.
    */
   messageId?: string;

   /**
    * Gets a message level.
    */
   messageLevel?: string;

   /**
    * Gets the language code.
    */
   language?: string;

   /**
    * Gets the response counter.
    */
   counter?: number;

   /**
    * The first panel or null the response does not contain a panel.
    */
   panel?: Panel;

   /**
    * An array of panels or an empty array if the response does not contain a panel.
    */
   panels?: Panel[];

   /**
    * Gets a value that indicates if a dialog was opened.
    */
   isDialog?: boolean;

   /**
    * Gets the dialog type. This property may have a value if isDialog is true.
    */
   dialogType?: string;

   /**
    * Gets a value that indicates if the response has at least one panel.
    */
   hasPanel(): boolean;

   /**
    * Gets a value from one of the the panels in the response.
    *
    * @param name The name of the control.
    * @param defaultValue Optional default value to return if the value cannot be found.
    * @returns The value or the default value.
    */
   getValue(name: string, defaultValue?: string): string;

   /**
    * Gets a control from one of the the panels in the response.
    *
    * @param name The name of the control.
    * @returns The control or null if the control cannot be found.
    */
   getControl(name: string): FormControl;

   /**
    * Gets one or more controls from one or more of the panels in the response.
    *
    * @param names The names of the controls.
    * @returns A control array or an empty array no controls can be found.
    */
   getControls(names: string[]): FormControl[];

   /**
    * Gets a control info from one of the the panels in the response.
    *
    * @param name The name of the control.
    * @returns The control info or null if the control cannot be found.
    */
   getControlInfo(name: string): IFormControlInfo;

   /**
    * Gets one or more controls infos from one or more of the panels in the response.
    *
    * @param names The names of the controls.
    * @returns A control info array or an empty array no controls can be found.
    */
   getControlInfos(names: string[]): IFormControlInfo[];
}

/**
 * @hidden
 */
export class FormResponse extends ErrorState implements IFormResponse {
   public request: IFormRequest;
   public result = 0;
   public sessionId: string;
   public instanceId: string;
   public message: string;
   public messageId: string;
   public messageLevel: string;
   public language: string;
   public counter: number;
   /**
    * Gets the user data values if the form request was a login request.
    */
   public userData?: any;

   public document?: Document;

   public principalUser?: string;

   public panel: Panel = null;

   public panels: Panel[] = [];

   public hasPanel(): boolean {
      return this.panels && this.panels.length > 0;
   }

   getValue(name: string, defaultValue?: string): string {
      const panels = this.panels;
      if (panels) {
         for (const panel of panels) {
            const value = panel.getValue(name);
            if (value != null) {
               return value;
            }
         }
      }
      return defaultValue;
   }

   getControl(name: string): FormControl {
      const panels = this.panels;
      if (panels) {
         for (const panel of panels) {
            const control = panel.getControl(name);
            if (control != null) {
               return control;
            }
         }
      }
      return null;
   }

   getControls(names: string[]): FormControl[] {
      const controls = [];
      const panels = this.panels;
      const found = {};
      if (panels) {
         for (const panel of panels) {
            for (const name of names) {
               if (!found[name]) {
                  const control = this.getControl(name);
                  if (control) {
                     found[name] = true;
                     controls.push(control);
                  }
               }
            }
         }
      }
      return controls;
   }

   getControlInfo(name: string): IFormControlInfo {
      const panels = this.panels;
      if (panels) {
         for (const panel of panels) {
            const control = panel.getControlInfo(name);
            if (control) {
               return control;
            }
         }
      }
      return null;
   }

   getControlInfos(names: string[]): IFormControlInfo[] {
      const controls = [];
      const panels = this.panels;
      const found = {};
      if (panels) {
         for (const panel of panels) {
            for (const name of names) {
               if (!found[name]) {
                  const control = this.getControlInfo(name);
                  if (control) {
                     found[name] = true;
                     controls.push(control);
                  }
               }
            }
         }
      }
      return controls;
   }
}

/**
 * See {@link IBookmark}
 *
 * @since 2.0.0
 */
export class Bookmark {

   private static nameMap = {
      BM_PROGRAM: 'program',
      BM_TABLE_NAME: 'tablename',
      BM_PANEL: 'panel',
      BM_KEY_FIELDS: 'keys',
      BM_OPTION: 'option',
      BM_START_PANEL: 'startpanel',
      BM_FOCUS_FIELD_NAME: 'focus',
      BM_PANEL_SEQUENCE: 'panelsequence',
      BM_INCLUDE_START_PANEL: 'includestartpanel',
      BM_INQUIRY_TYPE: 'sortingorder',
      BM_VIEW: 'view',
      BM_SOURCE: 'source',
      BM_STATELESS: 'stateless',
      BM_START_PANEL_FIELDS: 'fields',
      BM_PARAMETERS: 'parameters',
      BM_AUTOMATION: 'automation',
      BM_AUTOMATION_TEMPLATE: 'automationtemplate',
      BM_SUPPRESS_CONFIRM: 'requirepanel',
      BM_REQUIRE_PANEL: 'suppressconfirm'
   };

   private static getSource(bookmark: IBookmark) {
      return bookmark.source ? bookmark.source : 'Web';
   }

   private static add(params: any, name: string, value: string) {
      if (name && value) {
         params[name] = value;
      }
   }

   private static addBool(params: any, name: string, value: boolean) {
      if (name) {
         params[name] = value ? 'True' : 'False';
      }
   }

   private static addValue(str: string, key: string, value: string): string {
      if (str.length > 0) {
         str += ',';
      }

      // Bookmark key values must be URL encoded in UTF-8 in the same way as done on the BE server.
      return str + key + ',' + encodeURIComponent(value);
   }

   private static addInformationCategory(str: string, bookmark: IBookmark): string {
      str = Bookmark.addValue(str, FormConstants.fieldInformationCategory, bookmark.informationCategory);

      let filters = bookmark.numberOfFilters;
      if (!filters) {
         // Workaround for Foundation bug, always send 0 instead of blank value.
         filters = '0';
      }
      str = Bookmark.addValue(str, FormConstants.fieldNumberOfFilters, filters);
      return str;
   }

   private static createValues(userContext: IUserContext, keyString: string, values: any, isKeys: boolean) {
      let str = '';

      const keys = keyString.split(',');
      for (let i = 0; i < keys.length; i++) {
         const key = keys[i];
         let value = values[key];
         if (value === '' || (!value && isKeys)) {
            // Automatically convert the empty string to a blank that is expected by BE for optional values.
            // Always send blank space for missing keys, some key values are optional.
            // Fallbacks are used for key values.

            if (isKeys && key.length > 4) {
               // Fallback to the reference field name (ex FACI == WWFACI)
               const refKey = key.slice(2);
               const tempValue = values[refKey];
               if (tempValue && tempValue.length > 0) {
                  // Fallback for CONO without prefix in values
                  value = tempValue;
               } else {
                  if (userContext) {
                     // Fallback to the user context for CONO and DIVI
                     if (refKey === 'CONO') {
                        value = userContext.currentCompany;
                     } else if (refKey === 'DIVI') {
                        value = userContext.currentDivision;
                     }
                  }
               }
               if (!value) {
                  value = ' ';
               }
            } else {
               value = ' ';
            }
         }
         if (value) {
            str = Bookmark.addValue(str, key, value);
         }
      }
      return str;
   }

   public static toUri(bookmark: IBookmark, userContext?: IUserContext): string {
      const params = Bookmark.toParams(bookmark, userContext);
      let query = '';
      const nameMap = Bookmark.nameMap;
      for (const param in params) {
         if (param) {
            const name = nameMap[param] || param;
            if (query) {
               query += '&';
            }
            query += name + '=' + encodeURIComponent(params[param]);
         }
      }

      const uri = 'bookmark?' + query;
      return uri;
   }

   public static toParams(bookmark: IBookmark, userContext: IUserContext): any {
      const params = bookmark.params || {};

      this.add(params, 'BM_PROGRAM', bookmark.program);
      this.add(params, 'BM_PANEL_SEQUENCE', bookmark.panelSequence);
      this.add(params, 'BM_START_PANEL', bookmark.startPanel);
      this.add(params, 'BM_PANEL', bookmark.panel);
      this.add(params, 'BM_FOCUS_FIELD_NAME', bookmark.focusFieldName);
      this.add(params, 'BM_TABLE_NAME', bookmark.table);
      this.add(params, 'BM_OPTION', bookmark.option);
      this.add(params, 'BM_INQUIRY_TYPE', bookmark.sortingOrder);
      this.add(params, 'BM_SOURCE', this.getSource(bookmark));
      this.add(params, 'BM_VIEW', bookmark.view);
      this.add(params, 'BM_AUTOMATION', bookmark.automation);
      this.add(params, 'BM_AUTOMATION_TEMPLATE', bookmark.automationTemplate);

      this.addBool(params, 'BM_INCLUDE_START_PANEL', bookmark.includeStartPanel);
      this.addBool(params, 'BM_REQUIRE_PANEL', bookmark.requirePanel);
      this.addBool(params, 'BM_SUPPRESS_CONFIRM', bookmark.suppressConfirm);

      if (bookmark.isStateless) {
         this.addBool(params, 'BM_STATELESS', true);
      }

      const values = bookmark.values;

      let keys = bookmark.keys;
      if (bookmark.keyNames && values) {
         keys = Bookmark.createValues(userContext, bookmark.keyNames, values, true);
      }
      this.add(params, 'BM_KEY_FIELDS', keys);

      let parameters = bookmark.parameters;
      if (bookmark.parameterNames && values) {
         parameters = Bookmark.createValues(userContext, bookmark.parameterNames, values, false);
      }
      this.add(params, 'BM_PARAMETERS', parameters);

      let fields = bookmark.fields;
      const hasCategory = bookmark.informationCategory;
      if ((bookmark.fieldNames && values) || hasCategory) {
         fields = Bookmark.createValues(userContext, bookmark.fieldNames, values, false);
         if (hasCategory) {
            fields = Bookmark.addInformationCategory(fields, bookmark);
         }
      }
      this.add(params, 'BM_START_PANEL_FIELDS', fields);

      return params;
   }
}

/**
 * Represents an item that is used for translating M3 BE constants and messages.
 *
 * @hidden
 * @since 2.0.0
 */
export interface ITranslationItem {
   /**
    * Gets or sets the name of the language file.
    * If the file property is not set the default file MVXCON will be used.
    */
   file?: string;

   /**
    * Gets or sets the key for a language constant or message.
    */
   key: string;

   /**
    * Gets or sets the translated text.
    */
   text?: string;

   /**
    * Gets or sets the BE language.
    */
   language?: string;

   /**
    * Gets or sets an optional target object for the translated text.
    */
   target?: string;

   /**
    * Gets or sets an name of a property of the target object.
    * If the target property is set but the targetName propery is not set the key will be used as the value for targetName.
    */
   targetName?: string;
}

/**
 * See {@link ITranslationItem}
 *
 * @hidden
 * @since 2.0.0
 */
export class TranslationItem implements ITranslationItem {
   constructor(public key: string, public file: string = null) {
   }
}

/**
 * Represents an M3 translation request.
 *
 * @hidden
 * @since 2.0.0
 */
export interface ITranslationRequest {
   /**
    * Gets or sets the language to translate the items to.
    */
   language?: string;
   items?: ITranslationItem[];
}

/**
 * Represents an M3 translation response.
 *
 * @hidden
 * @since 2.0.0
 */
export interface ITranslationResponse {
   language?: string;
   items?: ITranslationItem[];
}

/**
 * @hidden
 * @since 2.0.0
 */
export interface ITranslationJob extends IFormRequest {
   items: ITranslationItem[];
   language: string;
   constants?: string;
}
