import { MaterialAppModule } from "./material-app.module";

describe("MaterialAppModule", () => {
   let materialAppModule: MaterialAppModule;

   beforeEach(() => {
      materialAppModule = new MaterialAppModule();
   });

   it("should create an instance", () => {
      expect(materialAppModule).toBeTruthy();
   });
});
