import { CoreBase, ErrorState } from "./base";
import { Log } from "./log";
import { IErrorState } from "./types";

describe("ErrorState", () => {
   it("shoud return no error", () => {
      const error = new ErrorState();
      expect(error.hasError()).toBe(false);
   });

   it("shoud return a error", () => {
      const errorWithErrorMessage = <IErrorState>new ErrorState();
      errorWithErrorMessage.errorMessage = "foo";
      expect(errorWithErrorMessage.hasError()).toBe(true);

      const errorWithErrorCode = <IErrorState>new ErrorState();
      errorWithErrorCode.errorCode = "foo";
      expect(errorWithErrorCode.hasError()).toBe(true);

      const errorWithError = <IErrorState>new ErrorState();
      errorWithError.error = "foo";
      expect(errorWithError.hasError()).toBe(true);
   });
});

describe("CoreBase", () => {
   it("should log error", () => {
      const name = "Error";
      const base = new CoreBase(name);
      const message = "Foo";
      const ex = new Error();
      spyOn(Log, "error").and.callFake(() => {
         return;
      });

      base["logError"](message, ex);
      expect(Log.error).toHaveBeenCalledWith(`[${name}] ${message}`, ex);
   });

   it("should log warning", () => {
      const name = "Warning";
      const base = new CoreBase(name);
      const message = "Foo";
      spyOn(Log, "warning").and.callFake(() => {
         return;
      });

      base["logWarning"](message);
      expect(Log.warning).toHaveBeenCalledWith(`[${name}] ${message}`);
   });

   it("should log info", () => {
      const name = "Info";
      const base = new CoreBase(name);
      const message = "Foo";
      spyOn(Log, "info").and.callFake(() => {
         return;
      });

      base["logInfo"](message);
      expect(Log.info).toHaveBeenCalledWith(`[${name}] ${message}`);
   });

   it("should log debug", () => {
      const name = "Info";
      const base = new CoreBase(name);
      const message = "Foo";
      const ex = new Error();
      spyOn(Log, "debug").and.callFake(() => {
         return;
      });

      base["logDebug"](message, ex);
      expect(Log.debug).toHaveBeenCalledWith(`[${name}] ${message}`, ex);
   });

   it("should return debug flag", () => {
      const base = new CoreBase("");
      spyOn(Log, "isDebug").and.returnValue(true);

      expect(base["isDebug"]()).toBe(true);
   });
});
