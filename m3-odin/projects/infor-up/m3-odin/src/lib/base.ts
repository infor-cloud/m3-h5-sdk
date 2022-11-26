import { Log } from "./log";
import { IErrorState } from "./types";

/**
 * Error state implementation.
 *
 * ```typescript
 * import { ErrorState } from '@infor-up/m3-odin';
 * ```
 *
 * This class can be extended to get support for the IErrorState interface.
 *
 * @since 2.0.0
 */
export class ErrorState implements IErrorState {
   /**
    * See {@link IErrorState.hasError}
    */
   public hasError(): boolean {
      const state = <IErrorState>this;
      return !!(state.errorMessage || state.errorCode || state.error);
   }
}

/**
 * Optional base class with logging functions.
 *
 * ```typescript
 * import { CoreBase } from '@infor-up/m3-odin';
 * ```
 *
 * Extending classes must call the super function in the constructor and provide the
 * name of the type. The type name is used in the console log output. The CoreBase class
 * will automatically create a log entry on the debug log level when the constructor is called.
 *
 * **Example**
 * ```typescript
 * export class MyCustomClass extends CoreBase {
 *    constructor() {
 *       super('MyCustomClass');
 *    }
 *
 *    onClick(): void {
 *       this.logInfo('onClick: Called');
 *    }
 * }
 * ```
 *
 * @since 2.0.0
 */
export class CoreBase extends ErrorState {
   private logPrefix;

   /**
    * Class constructor.
    *
    * @param typeName The type name of the extending class.
    */
   constructor(typeName: string) {
      super();
      this.logPrefix = "[" + typeName + "] ";
      this.logDebug("constructor");
   }

   /**
    * Gets a value that indicates if the debug log level is enabled.
    *
    * @returns True if the debug log level is enabled.
    */
   protected isDebug(): boolean {
      return Log.isDebug();
   }

   /**
    * Logs an error message an an optional exception.
    *
    * @param message The message to log.
    * @param ex Optional exception to log.
    */
   protected logError(message: string, ex?: any): void {
      Log.error(this.logPrefix + message, ex);
   }

   /**
    * Logs a warning message.
    *
    * @param message The message to log.
    */
   protected logWarning(message: string): void {
      Log.warning(this.logPrefix + message);
   }

   /**
    * Logs an infor message.
    *
    * @param message The message to log.
    */
   protected logInfo(message: string): void {
      Log.info(this.logPrefix + message);
   }

   /**
    * Logs a debug message an an optional exception.
    *
    * @param message The message to log.
    * @param ex Optional exception to log.
    */
   protected logDebug(message: string, ex?: any): void {
      Log.debug(this.logPrefix + message, ex);
   }
}
