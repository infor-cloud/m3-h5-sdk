import { INumberFormatOptions } from "./types";

/**
 * Represents options for sort functions in the {@link ArrayUtil} class.
 *
 * ```typescript
 * import { ISortOptions } from '@infor-up/m3-odin';
 * ```
 *
 * @since 2.0.0
 */
export interface ISortOptions {
   /**
    * Gets or sets a value that indicates if sorting should ignore case.
    * The default value is false. If this setting is set to true all values will be converted to strings when sorting.
    */
   ignoreCase?: boolean;
}

/**
 * Utility class for array operations.
 *
 * ```typescript
 * import { ArrayUtil } from '@infor-up/m3-odin';
 * ```
 *
 * @since 2.0.0
 */
export class ArrayUtil {
   /**
    * Checks if an item exists in an array.
    * @returns True if an item exists.
    */
   public static contains(array: any[], value: any): boolean {
      if (array) {
         return array.indexOf(value) >= 0;
      }
      return false;
   }

   /**
    * Sorts the array in acending order of the given property.
    * @param array Array to sort.
    * @param property Property to sort array by.
    * @param options Optional options for controlling the sorting.
    * @returns The sorted array.
    */
   public static sortByProperty(
      array: any[],
      property: string,
      options?: ISortOptions
   ): any[] {
      const ignoreCase = options && options.ignoreCase;
      return array.sort((x, y) => {
         const xProp = x[property];
         const yProp = y[property];

         // User concatenation instead of toString to avoid crashes for missing properties
         const a = ignoreCase ? ("" + xProp).toLocaleLowerCase() : xProp;
         const b = ignoreCase ? ("" + yProp).toLocaleLowerCase() : yProp;

         if (a > b) {
            return 1;
         } else if (a < b) {
            return -1;
         }
         return 0;
      });
   }

   /**
    * Removes an item in an array.
    */
   public static remove(array: any[], item: any): void {
      const index = array.indexOf(item);
      if (index >= 0) {
         array.splice(index, 1);
      }
   }

   /**
    * Removes an item in an array by matching the value of a specific property.
    *
    * @param array the array to remove an item from
    * @param name the name of the propery
    * @param value that value that the property should match
    * @returns the removed item or null if the item could not be found
    */
   public static removeByProperty(array: any[], name: string, value: any): any {
      for (let i = 0; i < array.length; i++) {
         if (array[i][name] === value) {
            return array.splice(i, 1)[0];
         }
      }
      return null;
   }

   /**
    * Removes the first item in an array that matches a predicate function.
    *
    * @param array the array to remove an item from
    * @param predicate a predicate function that returns true for a matching item in the array
    * @returns the removed item or null if the item could not be found
    */
   public static removeByPredicate<T>(
      array: T[],
      predicate: (item: T) => boolean
   ): T {
      for (let i = 0; i < array.length; i++) {
         if (predicate(array[i])) {
            return array.splice(i, 1)[0];
         }
      }
      return null;
   }

   /**
    * Finds the index of an item in an array that matches a predicate function.
    *
    * @param array the arrary to find an item in
    * @param predicate a predicate function that returns true for a matching item in the array
    * @returns the index of the item or -1 if the item could not be found
    */
   public static indexByPredicate<T>(
      array: T[],
      predicate: (item: T) => boolean
   ): number {
      for (let i = 0; i < array.length; i++) {
         if (predicate(array[i])) {
            return i;
         }
      }
      return -1;
   }

   /**
    * Gets the index of an item in an array by matching the value of a specific property.
    */
   public static indexByProperty(
      array: any[],
      name: string,
      value: any
   ): number {
      if (array) {
         for (let i = 0; i < array.length; i++) {
            const item = array[i];
            if (item) {
               if (item[name] === value) {
                  return i;
               }
            }
         }
      }
      return -1;
   }

   /**
    * Gets the item in an array by matching the value of a specific property.
    */
   public static itemByProperty(array: any[], name: string, value: any): any {
      const index = this.indexByProperty(array, name, value);
      return index >= 0 ? array[index] : null;
   }

   /**
    * Gets the item matching the predicate.
    */
   public static itemByPredicate<T>(array: T[], predicate: (item: T) => T) {
      for (let i = 0; i < array.length; i++) {
         if (predicate(array[i])) {
            return array[i];
         }
      }
      return null;
   }

   /**
    * Filters an array based on a predicate.
    */
   public static filterByPredicate<T>(
      array: T[],
      predicate: (item: T) => T
   ): T[] {
      const target: T[] = [];
      for (let i = 0; i < array.length; i++) {
         if (predicate(array[i])) {
            target.push(array[i]);
         }
      }
      return target;
   }

   /**
    * Checks if an item exists in an array by matching the value of a specific property.
    * @ returns True if an item with the property and value exists.
    */
   public static containsByProperty(
      array: any[],
      name: string,
      value: any
   ): boolean {
      return this.indexByProperty(array, name, value) >= 0;
   }

   /**
    * Gets the last item in an array.
    * @returns The last item or null if the array is null or empty.
    */
   public static last(array: any[]): any {
      if (array && array.length > 0) {
         return array[array.length - 1];
      }
      return null;
   }

   /**
    * Finds the first item in the array that matches the conditions defined in the predicate function.
    * @param array An array of items to search.
    * @param predicate A predicate function that should return true if the item parameter matches the predicate condition.
    */
   public static find<T>(array: T[], predicate: (item: T) => boolean) {
      if (array) {
         for (const item of array) {
            if (predicate(item)) {
               return item;
            }
         }
      }
      return null;
   }

   /**
    * Finds all items in the array that matches the conditions defined in the predicate function.
    * @param array An array of items to search.
    * @param predicate A predicate function that should return true if the item parameter matches the predicate condition.
    */
   public static findAll<T>(array: T[], predicate: (item: T) => boolean): T[] {
      if (array) {
         const arr = [];
         for (const item of array) {
            if (predicate(item)) {
               arr.push(item);
            }
         }
         return arr;
      }
      return null;
   }

   /**
    * Moves a object in an array to another index.
    */
   public static move(array: any[], index: number, newIndex: number): void {
      if (newIndex >= array.length) {
         let k = newIndex - array.length;
         while (k-- + 1) {
            array.push(undefined);
         }
      }
      array.splice(newIndex, 0, array.splice(index, 1)[0]);
   }

   /**
    * Swaps to items in an array
    *
    * @param items the array
    * @param index1 the index of the first item
    * @param index2 the index of the second item
    */
   public static swap(items: any[], index1: number, index2: number): void {
      const temp = items[index1];
      items[index1] = items[index2];
      items[index2] = temp;
   }
}

/**
 * Number utility functions.
 *
 * ```typescript
 * import { NumUtil } from '@infor-up/m3-odin';
 * ```
 *
 * @since 2.0.0
 */
export class NumUtil {
   private static defaultSeparator: string = NumUtil.getLocaleSeparator();

   private static defaultOptions: INumberFormatOptions = {
      separator: NumUtil.defaultSeparator,
   };

   private static getLocaleSeparator(): string {
      const n = 1.1;
      const s = n.toLocaleString().substring(1, 2);
      return s;
   }

   /**
    * Gets the default options used by the functions in the class.
    * @returns The default options.
    */
   public static getDefaultOptions(): INumberFormatOptions {
      return NumUtil.defaultOptions;
   }

   /**
    * Sets the default options used by the functions in the class.
    * @options The default options.
    */
   public static setDefaultOptions(options: INumberFormatOptions): void {
      NumUtil.defaultOptions = options;
      if (options.separator) {
         NumUtil.defaultSeparator = options.separator;
      }
   }

   /**
    * Gets a values that indicates if the parameter is a number.
    *
    * The value is considered to be a number if it can be parsed as a float, it is a number and it is finite.
    * @param n The value to check.
    * @returns True if the value is a number.
    */
   public static isNumber(n: any): boolean {
      return !isNaN(parseFloat(n)) && isFinite(n);
   }

   /**
    * Gets an integer value from a string.
    * @param s The string to parse.
    * @param defaultValue Optional default value to return if the string cannot be parsed. The default is zero.
    * @returns An integer parsed from the string or the default value.
    */
   public static getInt(s: string, defaultValue = 0) {
      if (s) {
         try {
            return parseInt(s, 10);
         } catch (e) {
            /* empty */
         }
      }
      return defaultValue;
   }

   /**
    * Formats a number or string using default or specified formatting options.
    *
    * This function currently only supports formatting using a specified decimal separator.
    * The value to format is expected to be either a number or a string containing a number where any
    * decimal separator is dot (.). If the value is a string it may not contain any thousand separators
    * or other formatting characters.
    *
    * @param value The value to format which can be a number or a number in string format.
    * @param options Optional formatting options.
    */
   public static format(value: any, options?: INumberFormatOptions): string {
      let s = value.toString();
      if ("" === s) {
         return s;
      }
      let separator = options
         ? options.separator
         : NumUtil.defaultOptions.separator;
      if (!separator) {
         separator = NumUtil.defaultSeparator;
      }
      s = s.replace(".", separator);
      return s;
   }

   /**
    * Pads a number with leading zeroes up to the specified length.
    * @param num The number to pad.
    * @param length The length of the string.
    */
   public static pad(num: number, length: number): string {
      let s = num + "";
      while (s.length < length) {
         s = "0" + s;
      }
      return s;
   }

   /**
    * Gets a value that indicates if the string contains only integers (1234567890).
    * @param s The string value to check.
    * @returns True if string contains only integers.
    */
   public static hasOnlyIntegers(s: string): boolean {
      if (!s) {
         return false;
      }

      const digits = "1234567890";
      for (let i = 0; i < s.length; i++) {
         if (digits.indexOf(s.charAt(i)) === -1) {
            return false;
         }
      }

      return true;
   }
}

/**
 * Utility functions.
 *
 * ```typescript
 * import { CoreUtil } from '@infor-up/m3-odin';
 * ```
 *
 * @since 2.0.0
 */
export class CoreUtil {
   private static chars = "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ";

   public static getUuid(prefix: string): string {
      /* eslint-disable no-bitwise */
      return (
         prefix +
         (((1 + Math.random()) * 0x10000) | 0).toString(16).substring(1) +
         (((1 + Math.random()) * 0x10000) | 0).toString(16).substring(1)
      );
      /* eslint-enable no-bitwise */
   }

   public static hasValue(anyObject: any): boolean {
      if (typeof anyObject !== "undefined") {
         return anyObject != null;
      }
      return false;
   }

   public static isUndefined(anyObject: any): boolean {
      return typeof anyObject === "undefined";
   }

   /**
    * Creates a string with random uppercase letters and numbers.
    * The default length is 16 if the stringLength parameter is omitted.
    */
   public static random(stringLength = 16): string {
      const chars = CoreUtil.chars;
      let randomstring = "";
      for (let i = 0; i < stringLength; i++) {
         const rnum = Math.floor(Math.random() * chars.length);
         randomstring += chars.substring(rnum, rnum + 1);
      }
      return randomstring;
   }
}

/**
 * String utility functions.
 *
 * ```typescript
 * import { StringUtil } from '@infor-up/m3-odin';
 * ```
 *
 * @since 2.0.0
 */
export class StringUtil {
   /**
    * Gets a value that indicates if the string is null, undefined or empty.
    * @param value The string to check.
    * @returns True if the string is null, undefined or empty.
    */
   public static isNullOrEmpty(value: string): boolean {
      return !value ? true : false;
   }

   /**
    * Gets a value that indicates if a string starts with a specified value.
    * @param value The string value to check.
    * @param prefix The value that the string should start with.
    * @returns True if the string starts with the specified prefix value.
    */
   public static startsWith(value: string, prefix: string): boolean {
      if (CoreUtil.hasValue(value)) {
         return value.indexOf(prefix) === 0;
      }
      return false;
   }

   /**
    * Gets a value that indicates if a string ends with a specified value.
    * @param value The string value to check.
    * @param prefix The value that the string should end with.
    * @returns True if the string ends with the specified suffix value.
    */
   public static endsWith(value: string, suffix: string): boolean {
      if (value == null) {
         return false;
      }
      return value.indexOf(suffix, value.length - suffix.length) !== -1;
   }

   /**
    * Trims whitespace from the end of a string.
    * @param value The value to trim.
    * @returns The trimmed value.
    */
   public static trimEnd(value: string) {
      return value.replace(/\s+$/, "");
   }

   public static format(...args: any[]): string {
      let stringValue = "missing";
      try {
         stringValue = args[0];
         const params = Array.prototype.slice.call(args, 1);
         stringValue = stringValue.replace(
            /{(\d+)}/g,
            function (...replaceArgs: any[]): any {
               const value = params[replaceArgs[1]];
               return typeof value !== "undefined" ? value : replaceArgs[0];
            }
         );
      } catch (ex) {
         // TODO Log?
         // Log.error('Failed to format string. Args: ' + args);
      }
      return stringValue;
   }
}

/**
 * HTTP utility functions.
 *
 * ```typescript
 * import { HttpUtil } from '@infor-up/m3-odin';
 * ```
 *
 * @since 2.0.0
 */
export class HttpUtil {
   private static queryMap: { [key: string]: string };
   private static jsonStart = /^\[|^\{(?!\{)/;
   private static jsonEnds = {
      "[": /]$/,
      "{": /}$/,
   };

   /**
    * Gets a value that indicates is the HTTP status code was successful (200-299).
    *
    * @param status An HTTP status code.
    */
   public static isSuccess(status: number): boolean {
      return status >= 200 && status <= 299;
   }

   /**
    * Gets a value that indicates if the hostname for the current application is localhost.
    * @returns True if the hostname is localhost
    */
   public static isLocalhost(): boolean {
      return window.location.hostname === "localhost";
   }

   /**
    * Gets a value that indicates if the supplied string value is likely to be JSON.
    *
    * @param value A JSON string value to test.
    */
   public static isJsonLike(value: string): boolean {
      const jsonStart = value.match(HttpUtil.jsonStart);
      return jsonStart && HttpUtil.jsonEnds[jsonStart[0]].test(value);
   }

   /**
    * Gets a string map with the URL query parameters for the current application.
    *
    * @returns A string map with query parameters.
    */
   public static getQuery(): { [key: string]: string } {
      let map = HttpUtil.queryMap;
      if (!map) {
         HttpUtil.queryMap = map = HttpUtil.parseQuery(window.location.search);
      }
      return map;
   }

   /**
    * Gets an URL query parameter.
    *
    * @param name The name of the parameter.
    * @returns The parameter value or undefined.
    */
   public static getParameter(name: string): string {
      return HttpUtil.getQuery()[name];
   }

   /**
    * Parses a query string to a parameter map.
    *
    * Note that this function does not support multiple parameters with the same name.
    *
    * @param query A query string.
    * @returns A parameter map.
    */
   public static parseQuery(query: string): { [key: string]: string } {
      if (query.indexOf("?") === 0) {
         query = query.substring(1);
      }
      let match;
      const pl = /\+/g, // Regex for replacing addition symbol with a space
         search = /([^&=]+)=?([^&]*)/g,
         decode = (s: string) => decodeURIComponent(s.replace(pl, " "));

      const parameters = {};
      while ((match = search.exec(query))) {
         parameters[decode(match[1])] = decode(match[2]);
      }
      return parameters;
   }

   /**
    * Combines two URL path fragments into one path.
    *
    * @param url1 The first URL path fragment.
    * @param url2 The second URL path fragment.
    * @returns A combined URL path
    */
   public static combine(url1: string, url2): string {
      if (!url1) {
         return url2;
      }
      if (!url2) {
         return url1;
      }
      const end = url1.length - 1;
      if (url1.charAt(end) === "/") {
         url1 = url1.substring(0, end);
      }
      if (url2.charAt(0) === "/") {
         url2 = url2.substring(1);
      }
      return url1 + "/" + url2;
   }

   /**
    * Converts an object to a query string with names and encoded values separated by ampersand characters.
    *
    * @param params An object to convert to a query string.
    * @returns A query string with encoded values.
    */
   public static toQuery(params: any): string {
      let query = "";
      for (const key of Object.keys(params)) {
         if (query.length > 0) {
            query += "&";
         }
         let value = params[key];
         value = value != null ? value.toString() : "";
         if (value.length > 0) {
            query += key + "=" + encodeURIComponent(value);
         } else {
            query += key;
         }
      }
      return query;
   }

   /**
    * Gets a value that indicates if the current window is an IFrame or not.
    *
    * @returns True if in an IFrame.
    */
   public static isIframe(): boolean {
      try {
         return window.self !== window.top;
      } catch (e) {
         return true;
      }
   }
}
