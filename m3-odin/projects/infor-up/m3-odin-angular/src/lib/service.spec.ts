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
      const response = await executeFakeRequest(200, RESPONSES.OK);
      expect(response.hasError()).toBeFalse();
      expect(response.items).toEqual(jasmine.arrayContaining([]));
   });

   it('#execute should handle a http error response', async () => {
      try {
         await executeFakeRequest(400);
         throw new Error('an error should be thrown on failed requests');
      } catch (err) {
         if (isResponse(err)) {
            expect(err.hasError()).toBeTrue();
            expect(err.errorCode).toBe('400');
         } else {
            throw err;
         }
      }
   });

   it('#execute should handle a NOK response', async () => {
      try {
         await executeFakeRequest(200, RESPONSES.NOK);
         throw new Error('an error should be thrown on failed requests');
      } catch (err) {
         if (isResponse(err)) {
            expect(err.hasError()).toBeTrue();
            expect(err.errorCode).toBe('CPF9898');
            expect(err.errorType).toBe('ServerReturnedNOK');
            expect(err.errorField).toBe('RETT');
            expect(err.errorMessage).toBe('Designed to fail!');
         } else {
            throw err;
         }
      }
   });

   it('#execute should handle partial NOK response (KB 2159861)', async () => {
      try {
         await executeFakeRequest(200, RESPONSES.NOK_AFTER_5);
         throw new Error('an error should be thrown on failed requests');
      } catch (err) {
         if (isResponse(err)) {
            expect(err.hasError()).toBeTrue();
            expect(err.errorCode).toBe('CPF9898');
            expect(err.errorType).toBe('ServerReturnedNOK');
            expect(err.errorField).toBe('RCNT      ');
            expect(err.errorMessage).toBe(
               "Designed to fail! Record count was:'-5      '",
            );
         } else {
            throw err;
         }
      }
   });

   function executeFakeRequest(
      fakeStatus: number,
      fakeResponse?: unknown,
   ): Promise<IMIResponse> {
      jasmine.Ajax.stubRequest(/TST001MI\/Lst10Out/).andReturn({
         status: fakeStatus,
         responseJSON: fakeResponse,
      });
      return service
         .execute({
            program: 'TST001MI',
            transaction: 'Lst10Out',
            company: 'test',
         })
         .toPromise();
   }

   function isResponse(value: any): value is IMIResponse {
      return (value as IMIResponse).hasError !== undefined;
   }
});

/**
 * Test responses from KB 2159861
 */
const RESPONSES = {
   OK: {
      Program: 'TST001MI',
      Transaction: 'Lst10Out',
      Metadata: {
         Field: [
            {
               '@name': 'F001',
               '@type': 'A',
               '@length': 8,
               '@description': 'Text field',
            },
            {
               '@name': 'F002',
               '@type': 'A',
               '@length': 8,
               '@description': 'Text field',
            },
            {
               '@name': 'F003',
               '@type': 'A',
               '@length': 8,
               '@description': 'Text field',
            },
            {
               '@name': 'F004',
               '@type': 'A',
               '@length': 8,
               '@description': 'Text field',
            },
            {
               '@name': 'F005',
               '@type': 'A',
               '@length': 8,
               '@description': 'Text field',
            },
            {
               '@name': 'F006',
               '@type': 'A',
               '@length': 8,
               '@description': 'Text field',
            },
            {
               '@name': 'F007',
               '@type': 'A',
               '@length': 8,
               '@description': 'Text field',
            },
            {
               '@name': 'F008',
               '@type': 'A',
               '@length': 8,
               '@description': 'Text field',
            },
            {
               '@name': 'F009',
               '@type': 'A',
               '@length': 8,
               '@description': 'Text field',
            },
            {
               '@name': 'F010',
               '@type': 'A',
               '@length': 8,
               '@description': 'Text field',
            },
         ],
      },
      MIRecord: [
         {
            NameValue: [
               {
                  Name: 'F001',
                  Value: '00000001',
               },
               {
                  Name: 'F002',
                  Value: '00000002',
               },
               {
                  Name: 'F003',
                  Value: '00000003',
               },
               {
                  Name: 'F004',
                  Value: '00000004',
               },
               {
                  Name: 'F005',
                  Value: '00000005',
               },
               {
                  Name: 'F006',
                  Value: '00000006',
               },
               {
                  Name: 'F007',
                  Value: '00000007',
               },
               {
                  Name: 'F008',
                  Value: '00000008',
               },
               {
                  Name: 'F009',
                  Value: '00000009',
               },
               {
                  Name: 'F010',
                  Value: '00000010',
               },
            ],
            RowIndex: 0,
         },
         {
            NameValue: [
               {
                  Name: 'F001',
                  Value: '00000002',
               },
               {
                  Name: 'F002',
                  Value: '00000003',
               },
               {
                  Name: 'F003',
                  Value: '00000004',
               },
               {
                  Name: 'F004',
                  Value: '00000005',
               },
               {
                  Name: 'F005',
                  Value: '00000006',
               },
               {
                  Name: 'F006',
                  Value: '00000007',
               },
               {
                  Name: 'F007',
                  Value: '00000008',
               },
               {
                  Name: 'F008',
                  Value: '00000009',
               },
               {
                  Name: 'F009',
                  Value: '00000010',
               },
               {
                  Name: 'F010',
                  Value: '00000011',
               },
            ],
            RowIndex: 1,
         },
         {
            NameValue: [
               {
                  Name: 'F001',
                  Value: '00000003',
               },
               {
                  Name: 'F002',
                  Value: '00000004',
               },
               {
                  Name: 'F003',
                  Value: '00000005',
               },
               {
                  Name: 'F004',
                  Value: '00000006',
               },
               {
                  Name: 'F005',
                  Value: '00000007',
               },
               {
                  Name: 'F006',
                  Value: '00000008',
               },
               {
                  Name: 'F007',
                  Value: '00000009',
               },
               {
                  Name: 'F008',
                  Value: '00000010',
               },
               {
                  Name: 'F009',
                  Value: '00000011',
               },
               {
                  Name: 'F010',
                  Value: '00000012',
               },
            ],
            RowIndex: 2,
         },
         {
            NameValue: [
               {
                  Name: 'F001',
                  Value: '00000004',
               },
               {
                  Name: 'F002',
                  Value: '00000005',
               },
               {
                  Name: 'F003',
                  Value: '00000006',
               },
               {
                  Name: 'F004',
                  Value: '00000007',
               },
               {
                  Name: 'F005',
                  Value: '00000008',
               },
               {
                  Name: 'F006',
                  Value: '00000009',
               },
               {
                  Name: 'F007',
                  Value: '00000010',
               },
               {
                  Name: 'F008',
                  Value: '00000011',
               },
               {
                  Name: 'F009',
                  Value: '00000012',
               },
               {
                  Name: 'F010',
                  Value: '00000013',
               },
            ],
            RowIndex: 3,
         },
         {
            NameValue: [
               {
                  Name: 'F001',
                  Value: '00000005',
               },
               {
                  Name: 'F002',
                  Value: '00000006',
               },
               {
                  Name: 'F003',
                  Value: '00000007',
               },
               {
                  Name: 'F004',
                  Value: '00000008',
               },
               {
                  Name: 'F005',
                  Value: '00000009',
               },
               {
                  Name: 'F006',
                  Value: '00000010',
               },
               {
                  Name: 'F007',
                  Value: '00000011',
               },
               {
                  Name: 'F008',
                  Value: '00000012',
               },
               {
                  Name: 'F009',
                  Value: '00000013',
               },
               {
                  Name: 'F010',
                  Value: '00000014',
               },
            ],
            RowIndex: 4,
         },
      ],
   },

   NOK: {
      Message:
         'Designed to fail!                                                                                                                   ',
      '@type': 'ServerReturnedNOK',
      '@code': 'CPF9898',
      '@cfg': null,
      '@field': 'RETT',
   },

   NOK_AFTER_5: {
      Program: 'TST001MI',
      Transaction: 'Lst10Out',
      Metadata: {
         Field: [
            {
               '@name': 'F001',
               '@type': 'A',
               '@length': 8,
               '@description': 'Text field',
            },
            {
               '@name': 'F002',
               '@type': 'A',
               '@length': 8,
               '@description': 'Text field',
            },
            {
               '@name': 'F003',
               '@type': 'A',
               '@length': 8,
               '@description': 'Text field',
            },
            {
               '@name': 'F004',
               '@type': 'A',
               '@length': 8,
               '@description': 'Text field',
            },
            {
               '@name': 'F005',
               '@type': 'A',
               '@length': 8,
               '@description': 'Text field',
            },
            {
               '@name': 'F006',
               '@type': 'A',
               '@length': 8,
               '@description': 'Text field',
            },
            {
               '@name': 'F007',
               '@type': 'A',
               '@length': 8,
               '@description': 'Text field',
            },
            {
               '@name': 'F008',
               '@type': 'A',
               '@length': 8,
               '@description': 'Text field',
            },
            {
               '@name': 'F009',
               '@type': 'A',
               '@length': 8,
               '@description': 'Text field',
            },
            {
               '@name': 'F010',
               '@type': 'A',
               '@length': 8,
               '@description': 'Text field',
            },
         ],
      },
      MIRecord: [
         {
            NameValue: [
               {
                  Name: 'F001',
                  Value: '00000001',
               },
               {
                  Name: 'F002',
                  Value: '00000002',
               },
               {
                  Name: 'F003',
                  Value: '00000003',
               },
               {
                  Name: 'F004',
                  Value: '00000004',
               },
               {
                  Name: 'F005',
                  Value: '00000005',
               },
               {
                  Name: 'F006',
                  Value: '00000006',
               },
               {
                  Name: 'F007',
                  Value: '00000007',
               },
               {
                  Name: 'F008',
                  Value: '00000008',
               },
               {
                  Name: 'F009',
                  Value: '00000009',
               },
               {
                  Name: 'F010',
                  Value: '00000010',
               },
            ],
            RowIndex: 0,
         },
         {
            NameValue: [
               {
                  Name: 'F001',
                  Value: '00000002',
               },
               {
                  Name: 'F002',
                  Value: '00000003',
               },
               {
                  Name: 'F003',
                  Value: '00000004',
               },
               {
                  Name: 'F004',
                  Value: '00000005',
               },
               {
                  Name: 'F005',
                  Value: '00000006',
               },
               {
                  Name: 'F006',
                  Value: '00000007',
               },
               {
                  Name: 'F007',
                  Value: '00000008',
               },
               {
                  Name: 'F008',
                  Value: '00000009',
               },
               {
                  Name: 'F009',
                  Value: '00000010',
               },
               {
                  Name: 'F010',
                  Value: '00000011',
               },
            ],
            RowIndex: 1,
         },
         {
            NameValue: [
               {
                  Name: 'F001',
                  Value: '00000003',
               },
               {
                  Name: 'F002',
                  Value: '00000004',
               },
               {
                  Name: 'F003',
                  Value: '00000005',
               },
               {
                  Name: 'F004',
                  Value: '00000006',
               },
               {
                  Name: 'F005',
                  Value: '00000007',
               },
               {
                  Name: 'F006',
                  Value: '00000008',
               },
               {
                  Name: 'F007',
                  Value: '00000009',
               },
               {
                  Name: 'F008',
                  Value: '00000010',
               },
               {
                  Name: 'F009',
                  Value: '00000011',
               },
               {
                  Name: 'F010',
                  Value: '00000012',
               },
            ],
            RowIndex: 2,
         },
         {
            NameValue: [
               {
                  Name: 'F001',
                  Value: '00000004',
               },
               {
                  Name: 'F002',
                  Value: '00000005',
               },
               {
                  Name: 'F003',
                  Value: '00000006',
               },
               {
                  Name: 'F004',
                  Value: '00000007',
               },
               {
                  Name: 'F005',
                  Value: '00000008',
               },
               {
                  Name: 'F006',
                  Value: '00000009',
               },
               {
                  Name: 'F007',
                  Value: '00000010',
               },
               {
                  Name: 'F008',
                  Value: '00000011',
               },
               {
                  Name: 'F009',
                  Value: '00000012',
               },
               {
                  Name: 'F010',
                  Value: '00000013',
               },
            ],
            RowIndex: 3,
         },
         {
            NameValue: [
               {
                  Name: 'F001',
                  Value: '00000005',
               },
               {
                  Name: 'F002',
                  Value: '00000006',
               },
               {
                  Name: 'F003',
                  Value: '00000007',
               },
               {
                  Name: 'F004',
                  Value: '00000008',
               },
               {
                  Name: 'F005',
                  Value: '00000009',
               },
               {
                  Name: 'F006',
                  Value: '00000010',
               },
               {
                  Name: 'F007',
                  Value: '00000011',
               },
               {
                  Name: 'F008',
                  Value: '00000012',
               },
               {
                  Name: 'F009',
                  Value: '00000013',
               },
               {
                  Name: 'F010',
                  Value: '00000014',
               },
            ],
            RowIndex: 4,
         },
      ],
      ErrorMessage: {
         '@type': 'ServerReturnedNOK',
         '@code': 'CPF9898',
         '@cfg': '97',
         '@field': 'RCNT      ',
         Message:
            "Designed to fail! Record count was:'-5      '                                                                                       ",
      },
   },
};
