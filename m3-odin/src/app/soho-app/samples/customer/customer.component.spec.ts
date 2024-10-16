import { ComponentFixture, fakeAsync, TestBed } from '@angular/core/testing';
import { FormsModule } from '@angular/forms';
import { MIService, UserService } from '@infor-up/m3-odin-angular';
import { SohoComponentsModule } from 'ids-enterprise-ng';
import { CustomerSampleComponent } from './customer.component';

describe('CustomerComponent', () => {
   let component: CustomerSampleComponent;
   let fixture: ComponentFixture<CustomerSampleComponent>;

   beforeEach(fakeAsync(() => {
      TestBed.configureTestingModule({
         declarations: [CustomerSampleComponent],
         imports: [FormsModule, SohoComponentsModule],
         providers: [MIService, UserService],
      }).compileComponents();
   }));

   beforeEach(() => {
      fixture = TestBed.createComponent(CustomerSampleComponent);
      component = fixture.componentInstance;
      fixture.detectChanges();
   });

   it('should create', () => {
      expect(component).toBeTruthy();
   });
});
