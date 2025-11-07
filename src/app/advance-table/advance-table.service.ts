import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { AdvanceTable } from './advance-table.model';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { UnsubscribeOnDestroyAdapter } from '../shared/UnsubscribeOnDestroyAdapter';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';

@Injectable()
export class AdvanceTableService extends UnsubscribeOnDestroyAdapter {
  private readonly API_URL = 'http://localhost:8000/api/expenses/';
  private readonly sync = 'http://localhost:8000/api/sync-rates/';

  isTblLoading = true;
  dataChange: BehaviorSubject<AdvanceTable[]> = new BehaviorSubject<
    AdvanceTable[]
  >([]);
  // Temporarily stores data from dialogs
  dialogData!: AdvanceTable;
  constructor(private httpClient: HttpClient) {
    super();
  }
  get data(): AdvanceTable[] {
    return this.dataChange.value;
  }
  getDialogData() {
    return this.dialogData;
  }
  /** CRUD METHODS */
  getAllAdvanceTables(): void {
    this.subs.sink = this.httpClient
      .get<AdvanceTable[]>(this.API_URL)
      .subscribe(
        (data) => {
          this.isTblLoading = false;
          this.dataChange.next(data);
        },
        (error: HttpErrorResponse) => {
          this.isTblLoading = false;
        }
      );
  }

  addAdvanceTable(advanceTable: AdvanceTable): Observable<AdvanceTable> {
    return this.httpClient.post<AdvanceTable>(this.API_URL, advanceTable)
      .pipe(catchError(this.handleError));
  }

  updateAdvanceTable(advanceTable: AdvanceTable): Observable<AdvanceTable> {
    return this.httpClient.put<AdvanceTable>(
      `${this.API_URL}${advanceTable.id}/`,
      advanceTable
    ).pipe(catchError(this.handleError));
  }

  private handleError(error: HttpErrorResponse) {
    console.error('API Error:', error);
    return throwError(() => new Error('Something went wrong, please try again.'));
  }

  deleteAdvanceTable(id: number): void {
    this.httpClient.delete(this.API_URL + id).subscribe(data => {
      console.log(id);
      },
      (err: HttpErrorResponse) => {
         // error code here
      }
    );
  }

  syncrates(): void {
    this.httpClient.post<AdvanceTable>(this.sync, {})
    .pipe(catchError(this.handleError));
    }
}
