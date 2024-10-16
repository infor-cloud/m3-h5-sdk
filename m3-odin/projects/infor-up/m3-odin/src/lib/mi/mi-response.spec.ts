import { MIResponse } from './runtime';

describe('MI Response', () => {
   it('should has no error', () => {
      const record = new MIResponse();
      expect(record.hasError()).toBe(false);
   });

   it('should has an error', () => {
      const recordWithErrorMessage = new MIResponse();
      recordWithErrorMessage.errorMessage = 'foo';
      expect(recordWithErrorMessage.hasError()).toBe(true);

      const recordWithErrorCode = new MIResponse();
      recordWithErrorCode.errorCode = 'foo';
      expect(recordWithErrorCode.hasError()).toBe(true);

      const recordWithError = new MIResponse();
      recordWithError.error = 'foo';
      expect(recordWithError.hasError()).toBe(true);
   });
});
