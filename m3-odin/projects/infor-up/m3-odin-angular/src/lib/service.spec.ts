import { TestBed } from '@angular/core/testing';
import { IMIResponse } from '@infor-up/m3-odin';
import { MIService } from './service';

describe('MIService', () => {
   let service: MIService;

   beforeEach(() => {
      jasmine.Ajax.install();
      jasmine.Ajax.stubRequest(/.*m3api-rest\/csrf/).andReturn({
         status: 200,
         responseJSON: 'FAKE-CSRF-TOKEN',
      });

      TestBed.configureTestingModule({
         providers: [MIService],
      });
      service = TestBed.inject(MIService);
   });

   afterEach(() => {
      jasmine.Ajax.uninstall();
   });

   it('should create', () => {
      expect(service).toBeDefined();
   });

   it('#execute should handle non-error response', async () => {
      const response = await executeFakeRequest(200, { MIRecord: [] });
      expect(response.hasError()).toBeFalse();
      expect(response.items).toEqual(jasmine.arrayContaining([]));
   });

   it('#execute should handle a http error response', async () => {
      try {
         await executeFakeRequest(400);
         throw new Error('an error should be thrown on failed requests');
      } catch (err) {
         const response = err as IMIResponse;
         expect(response.hasError()).toBeTrue();
      }
   });

   it('#execute should handle an error Message response', async () => {
      try {
         await executeFakeRequest(200, { Message: 'Test Error Message' });
         throw new Error('an error should be thrown on failed requests');
      } catch (err) {
         const response = err as IMIResponse;
         expect(response.hasError()).toBeTrue();
         expect(response.errorMessage).toBe('Test Error Message');
      }
   });

   function executeFakeRequest(fakeStatus: number, fakeResponse?: unknown): Promise<IMIResponse> {
      jasmine.Ajax.stubRequest(/FakeProgram\/FakeTransaction/).andReturn({
         status: fakeStatus,
         responseJSON: fakeResponse,
      });
      return service.execute({
         program: 'FakeProgram',
         transaction: 'FakeTransaction',
         company: 'test',
      }).toPromise();
   }
});
