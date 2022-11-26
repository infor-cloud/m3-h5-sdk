import { HttpClient } from "@angular/common/http";
import {
   AfterViewInit,
   Component,
   Directive,
   ElementRef,
   Input,
} from "@angular/core";
import { CoreBase } from "@infor-up/m3-odin";
import hljs from "highlight.js/lib/core";

@Component({
   selector: "odin-document-viewer",
   template: `
      <pre
         *ngIf="contentLoaded"
      ><code odinHighlight>{{textContent}}</code></pre>
      <i *ngIf="!contentLoaded">{{ textContent }}</i>
   `,
})
export class DocumentViewerComponent extends CoreBase {
   @Input() set documentUrl(url: string) {
      this.loadDocument(url);
   }

   contentLoaded: boolean;
   textContent = "No source file available.";

   constructor(private http: HttpClient) {
      super("DocumentViewerComponent");
   }

   private loadDocument(url: string): void {
      this.http.get(url, { responseType: "text" }).subscribe(
         (document) => this.updateDocument(document),
         (error) =>
            this.logWarning(
               error.message || "Sample source file could not be loaded"
            )
      );
   }

   private updateDocument(document: string) {
      this.textContent = document;
      this.contentLoaded = true;
   }
}

@Directive({
   selector: "code[odinHighlight]",
})
export class HighlightCodeDirective implements AfterViewInit {
   constructor(private eltRef: ElementRef) {}

   ngAfterViewInit() {
      hljs.highlightBlock(this.eltRef.nativeElement);
   }
}
