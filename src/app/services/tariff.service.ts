import {Injectable} from '@angular/core';
import {Observable, throwError} from 'rxjs';
import {HttpClient} from '@angular/common/http';
import {environment} from "../../environments/environment";
import {catchError, map} from "rxjs/operators";
import {ListResponse} from "../models/tariff/list-response";
import {GetResponse} from "../models/tariff/get-response";

@Injectable({
  providedIn: 'root'
})
export class TariffService {
  private API_URL = environment.API_URL;

  constructor(
    private http: HttpClient,
  ) {
  }

  get(id: string): Observable<GetResponse> {
    const url = `${this.API_URL}/api/v1/tariff/get`;
    return this.http.post<GetResponse>(url, {id: id}).pipe(
      map((resp: GetResponse) => {
        return new GetResponse(resp);
      }),
      catchError(error => {
        console.error('Error fetching invite:', error);
        return throwError(() => error);
      })
    );
  }

  public getList(): Observable<ListResponse> {
    const url = `${this.API_URL}/api/v1/tariff/list`;
    return this.http.post<ListResponse>(url, {}).pipe(
      map((resp: ListResponse) => {
        return new ListResponse(resp);
      }),
    );
  }
}
