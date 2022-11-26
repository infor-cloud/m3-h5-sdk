import { SohoAppModule } from './soho-app.module';

describe('SohoAppModule', () => {
   let sohoAppModule: SohoAppModule;

   beforeEach(() => {
      sohoAppModule = new SohoAppModule();
   });

   it('should create an instance', () => {
      expect(sohoAppModule).toBeTruthy();
   });
});
