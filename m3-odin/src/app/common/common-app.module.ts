import { CommonModule } from '@angular/common';
import { HttpClientModule } from '@angular/common/http';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { DocumentViewerComponent, HighlightCodeDirective } from './document-viewer';

@NgModule({
   declarations: [
      DocumentViewerComponent,
      HighlightCodeDirective
   ],
   exports: [
      DocumentViewerComponent
   ],
   imports: [
      CommonModule,
      HttpClientModule,
      FormsModule
   ],
   providers: []
})
export class CommonAppModule { }
