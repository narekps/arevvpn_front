import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import {catchError, map} from 'rxjs/operators';
import { environment } from '../../environments/environment';
import {
  SubscriptionCancelRequest,
  SubscriptionCancelResponse
} from "../models/subscription/subscription-data.interface";

@Injectable({
  providedIn: 'root'
})
export class SubscriptionService {
  private API_URL = environment.API_URL;

  constructor(private http: HttpClient) {}

  /**
   * Отмена подписки
   */
  cancel(req: SubscriptionCancelRequest): Observable<SubscriptionCancelResponse> {
    const url = `${this.API_URL}/api/v1/subscription/cancel`;
    return this.http.post<SubscriptionCancelResponse>(url, req).pipe(
      map((resp: SubscriptionCancelResponse) => {
        return new SubscriptionCancelResponse(resp);
      }),
      catchError(error => {
        console.error('Error cancelling subscription:', error);
        return throwError(() => error);
      })
    );
  }
}
