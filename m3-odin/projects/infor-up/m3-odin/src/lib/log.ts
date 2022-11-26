import { ArrayUtil } from "./util";

/**
 * Interface for custom log appender callback functions.
 *
 * ```typescript
 * import { ILogAppender } from '@infor-up/m3-odin';
 * ```
 *
 * A log appender function can be used to get all logs from the Log class for the current log level.
 *
 * @since 2.0.0
 */
export interface ILogAppender {
   (level: number, text: string, ex?: any);
}

/**
 * Log text messages and exceptions on different log levels to the browser console and optional custom log appenders.
 *
 * ```typescript
 * import { Log } from '@infor-up/m3-odin';
 * ```
 *
 * **Example:**
 * ```typescript
 * // Log on the info log level
 * Log.info('Application initialized');
 * ```
 *
 * **Example:**
 * ```typescript
 * // Enable debug log level
 * Log.setDebug();
 * ```
 *
 * **Example:**
 * ```typescript
 * // Check log level before logging
 * if(Log.isDebug()) {
 *    Log.debug('onResponse: Received response data: ' + JSON.stringify(response));
 * }
 * ```
 *
 * @since 2.0.0
 */
export class Log {
   /**
    * Fatal log level. Severe errors that prevents the application from functioning.
    */
   public static levelFatal = 0;

   /**
    * Error log level.
    */
   public static levelError = 1;

   /**
    * Warning log level.
    */
   public static levelWarning = 2;

   /**
    * Information log level.
    */
   public static levelInfo = 3;

   /**
    * Debug log level. Detailed information for debug purposes.
    */
   public static levelDebug = 4;

   /**
    * Trace log level. Most detailed information for debug purposes.
    */
   public static levelTrace = 5;

   /**
    * Gets or sets the current log level. The default log level is information.
    */
   public static level: number = Log.levelInfo;

   /**
    * Gets or sets a value that indicates if logging to the browser console is enabled.
    * The default value is true.
    */
   public static isConsoleLogEnabled = true;

   private static prefixes: string[] = [
      "[FATAL]",
      "[ERROR]",
      "[WARNING]",
      "[INFO]",
      "[DEBUG]",
      "[TRACE]",
   ];
   private static appenders: ILogAppender[] = [];

   /**
    * Adds a new log appender that will receive log entries for the current log level.
    * @param A log appender.
    */
   public static addAppender(appender: ILogAppender) {
      Log.appenders.push(appender);
   }

   /**
    * Removes an existing log appender.
    * @param appender An existing appender to remove.
    */
   public static removeAppender(appender: ILogAppender) {
      ArrayUtil.remove(Log.appenders, appender);
   }

   /**
    * Gets a military time string with hours, minutes, seconds and milliseconds on the format hh:mm:ss,ttt.
    * @returns A military time string.
    */
   private static getTime(): string {
      const date = new Date();
      const hours = date.getHours();
      const minutes = date.getMinutes();
      const seconds = date.getSeconds();
      const ms = date.getMilliseconds();

      const time =
         (hours < 10 ? "0" : "") +
         hours +
         ":" +
         (minutes < 10 ? "0" : "") +
         minutes +
         ":" +
         (seconds < 10 ? "0" : "") +
         seconds +
         "," +
         (ms < 10 ? "00" : (ms < 100 ? "0" : "") + ms);

      return time;
   }

   /**
    * Gets a formatted log entry.
    * @param level The log level.
    * @param ex An optional exception object.
    */
   public static getLogEntry(level: number, text: string, ex?: any) {
      let logText =
         "[" + Log.getTime() + "] " + this.prefixes[level] + " " + text;
      if (ex) {
         const message = ex.message;
         const stack = ex.stack;
         if (stack) {
            if (message && stack.indexOf(message) < 0) {
               logText += " " + message;
            }
            logText += " " + ex.stack;
         } else if (message) {
            logText += " " + message;
         } else {
            logText += " " + ex;
         }
      }
      return logText;
   }

   private static log(
      currentLevel: number,
      level: number,
      text: string,
      ex?: any
   ) {
      /* eslint-disable no-console */
      if (level <= currentLevel) {
         // Log to the console if it is enabled and exist in the current browser.
         if (Log.isConsoleLogEnabled && window.console) {
            const logText = Log.getLogEntry(level, text, ex);
            if (level <= 1) {
               console.error(logText);
            } else if (level === 2) {
               console.warn(logText);
            } else if (level === 3) {
               console.info(logText);
            } else {
               console.log(logText);
            }
         }

         if (Log.appenders) {
            for (let i = 0; i < Log.appenders.length; i++) {
               try {
                  Log.appenders[i](level, text, ex);
               } catch (e) {
                  /* empty */
               }
            }
         }
      }
      /* eslint-enable no-console */
   }

   /**
    * Sets the default log level which is information.
    */
   public static setDefault() {
      this.level = this.levelInfo;
   }

   /**
    * Logs a text message and an optional exception on the fatal log level.
    * @param text A log message.
    * @param ex An optional exception object.
    */
   public static fatal(text: string, ex?: any) {
      this.log(this.level, this.levelFatal, text, ex);
   }

   /**
    * Logs a text message and an optional exception on the error log level.
    * @param text A log message.
    * @param ex An optional exception object.
    */
   public static error(text: string, ex?: any) {
      this.log(this.level, this.levelError, text, ex);
   }

   /**
    * Logs a text message and an optional exception on the warning log level.
    * @param text A log message.
    * @param ex An optional exception object.
    */
   public static warning(text: string, ex?: any) {
      this.log(this.level, this.levelWarning, text, ex);
   }

   /**
    * Logs a text message and an optional exception on the information log level.
    * @param text A log message.
    * @param ex An optional exception object.
    */
   public static info(text: string, ex?: any) {
      this.log(this.level, this.levelInfo, text, ex);
   }

   /**
    * Gets a value that indicates if the debug log level is enabled. Use this before logging large debug messages.
    *
    * @returns True if the debug log level is enabled
    */
   public static isDebug() {
      return this.level >= this.levelDebug;
   }

   /**
    * Sets the current log level to debug.
    */
   public static setDebug() {
      this.level = this.levelDebug;
   }

   /**
    * Logs a text message and an optional exception on the debug log level.
    * @param text A log message.
    * @param ex An optional exception object.
    */
   public static debug(text: string, ex?: any) {
      this.log(this.level, this.levelDebug, text, ex);
   }

   /**
    * Gets a value that indicates if the trace log level is enabled. Use this before logging large trace messages.
    *
    * @returns True if the trace log level is enabled
    */
   public static isTrace() {
      return this.level >= this.levelTrace;
   }

   /**
    * Sets the current log level to trace.
    */
   public static setTrace() {
      this.level = this.levelTrace;
   }

   /**
    * Logs a text message and an optional exception on the trace log level.
    * @param text A log message.
    * @param ex An optional exception object.
    */
   public static trace(text: string, ex?: any) {
      this.log(this.level, this.levelTrace, text, ex);
   }
}
