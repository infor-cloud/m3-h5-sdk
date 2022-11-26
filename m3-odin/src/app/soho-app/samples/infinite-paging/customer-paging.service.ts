import { Injectable, OnDestroy } from '@angular/core';
import {
   ArrayUtil,
   CoreBase,
   IMIRequest,
   IMIResponse,
} from '@infor-up/m3-odin';
import { MIService } from '@infor-up/m3-odin-angular';
import { BehaviorSubject, Observable, of } from 'rxjs';
import { catchError, finalize } from 'rxjs/operators';

export interface IPagingResult {
   items: any[];
   request?: SohoDataGridSourceRequest;
}

@Injectable()
export class CustomerPagingService extends CoreBase implements OnDestroy {
   private dataSubject = new BehaviorSubject<IPagingResult>({
      items: [],
      request: {
         filterExpr: undefined,
         preserveSelected: false,
         hideDisabledPagers: true,
      },
   });
   private loadingSubject = new BehaviorSubject<boolean>(false);
   private items: { [index: number]: any[] } = {};
   private currentPage = 0;
   private lastRecord: string;
   private endOfRecords = false;
   private readonly maxRecords = 50;

   isLoading = this.loadingSubject.asObservable();

   constructor(private miService: MIService) {
      super('CustomerPagingService');
   }

   ngOnDestroy() {
      this.dataSubject.complete();
      this.loadingSubject.complete();
   }

   getData(request: SohoDataGridSourceRequest): Observable<any> {
      switch (request.type) {
         case 'initial':
            this.getPage(this.currentPage, request);
            break;
         case 'next':
            this.getPage(this.currentPage + 1, request);
            break;
         case 'prev':
            this.getPage(this.currentPage - 1, request);
            break;
         default:
            this.logInfo('Unsupported request type: ' + request.type);
      }

      return this.dataSubject.asObservable();
   }

   private getPage(index: number, request?: SohoDataGridSourceRequest) {
      const nextBatch = this.items[index];
      const needMoreRecords = nextBatch === undefined;
      if (needMoreRecords) {
         this.loadData(request);
      } else {
         this.dataSubject.next({ items: nextBatch, request: request });
      }
      this.currentPage = index;
   }

   private loadData(request?: SohoDataGridSourceRequest) {
      if (this.endOfRecords) {
         this.logInfo('No more records to fetch.');
         return;
      }
      this.loadingSubject.next(true);
      const miRequest: IMIRequest = {
         program: 'CRS610MI',
         transaction: 'LstByNumber',
         outputFields: ['CUNO', 'CUNM', 'STAT', 'PHNO', 'YREF'],
         maxReturnedRecords: this.maxRecords,
         record: { CUNO: this.lastRecord },
      };

      this.miService
         .execute(miRequest)
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
            request.lastPage = this.endOfRecords;
            this.dataSubject.next({ items: items, request: request });
         });
   }
}
