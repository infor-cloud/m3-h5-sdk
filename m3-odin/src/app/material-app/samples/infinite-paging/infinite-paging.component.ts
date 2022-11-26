import { CollectionViewer, DataSource } from "@angular/cdk/collections";
import { AfterViewInit, Component, OnInit, ViewChild } from "@angular/core";
import { MatPaginator, PageEvent } from "@angular/material/paginator";
import {
   ArrayUtil,
   CoreBase,
   IMIRequest,
   IMIResponse,
} from "@infor-up/m3-odin";
import { MIService } from "@infor-up/m3-odin-angular";
import { BehaviorSubject, Observable, of } from "rxjs";
import { catchError, finalize, tap } from "rxjs/operators";

@Component({
   templateUrl: "./infinite-paging.component.html",
   styleUrls: ["./infinite-paging.component.css"],
})
export class InfinitePagingSampleComponent
   extends CoreBase
   implements OnInit, AfterViewInit
{
   @ViewChild(MatPaginator) paginator: MatPaginator;

   displayedColumns = ["CUNO", "CUNM", "STAT", "PHNO", "YREF"];
   dataSource: CustomerDataSource;
   maxRecords = 50;

   constructor(private miService: MIService) {
      super("InfinitePagingSampleComponent");
   }

   ngOnInit(): void {
      this.dataSource = new CustomerDataSource(this.miService, this.maxRecords);
      this.dataSource.init();
   }

   /**
    * Set the paginator after the view init so this component will
    * be able to query its view for the initialized paginator.
    */
   ngAfterViewInit() {
      this.dataSource.setPaginator(this.paginator);
   }
}

export class CustomerDataSource extends CoreBase implements DataSource<any> {
   private dataSubject = new BehaviorSubject<any[]>([]);
   private loadingSubject = new BehaviorSubject<boolean>(false);
   private totalCountSubject = new BehaviorSubject<number>(0);

   private items: { [index: number]: any[] } = {};
   private currentPage = 0;
   private endOfRecords = false;
   private lastRecord: string;
   private paginator: MatPaginator;

   isLoading = this.loadingSubject.asObservable();

   constructor(private miService: MIService, private maxRecords: number) {
      super("CustomerDataSource");
   }

   connect(collectionViewer: CollectionViewer): Observable<any[]> {
      return this.dataSubject.asObservable();
   }

   disconnect(collectionViewer: CollectionViewer) {
      this.dataSubject.complete();
      this.loadingSubject.complete();
      this.totalCountSubject.complete();
   }

   init() {
      this.getTotalCount();
      this.getPage(0);
   }

   setPaginator(component: MatPaginator) {
      component.page
         .pipe(
            tap((event: PageEvent) => {
               this.getPage(event.pageIndex);
            })
         )
         .subscribe();

      this.totalCountSubject.subscribe((totalRecords: number) => {
         component.length = totalRecords;
      });

      this.paginator = component;
   }

   private getPage(index: number) {
      const nextBatch = this.items[index];
      const needMoreData = nextBatch === undefined;
      if (needMoreData) {
         this.loadData();
      } else {
         this.dataSubject.next(nextBatch);
      }
      this.currentPage = index;
   }

   private loadData() {
      if (this.endOfRecords) {
         this.logInfo("No more records to fetch.");
         return;
      }
      this.loadingSubject.next(true);

      const request: IMIRequest = {
         program: "CRS610MI",
         transaction: "LstByNumber",
         outputFields: ["CUNO", "CUNM", "STAT", "PHNO", "YREF"],
         maxReturnedRecords: this.maxRecords,
         record: { CUNO: this.lastRecord },
      };

      this.miService
         .execute(request)
         .pipe(
            catchError(() => of([])),
            finalize(() => this.loadingSubject.next(false))
         )
         .subscribe((response: IMIResponse) => {
            const items = response.items;
            this.items[this.currentPage] = items;
            this.lastRecord = ArrayUtil.last(items).CUNO;
            this.endOfRecords =
               items.length === 0 ||
               items.length === 1 ||
               items.length < this.maxRecords;
            this.dataSubject.next(items);
         });
   }

   private getTotalCount() {
      this.loadingSubject.next(true);
      const request: IMIRequest = {
         program: "CRS610MI",
         transaction: "LstByNumber",
         outputFields: ["CUNO"],
         maxReturnedRecords: 0, // Get all records
      };
      this.miService
         .execute(request)
         .pipe(catchError(() => of(0)))
         .subscribe((response: IMIResponse) => {
            this.totalCountSubject.next(response.items.length);
            this.totalCountSubject.complete();
         });
   }
}
