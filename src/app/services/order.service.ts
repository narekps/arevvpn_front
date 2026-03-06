import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import {catchError, map} from 'rxjs/operators';
import { environment } from '../../environments/environment';
import {
  CreateOrderRequest,
  CreateOrderResponse,
  OrderCallbackRequest,
  OrderCallbackResponse,
} from '../models/order/order-data.interface';

@Injectable({
  providedIn: 'root'
})
export class OrderService {
  private API_URL = environment.API_URL;

  constructor(private http: HttpClient) {}

  /**
   * Создать заказ
   */
  createOrder(req: CreateOrderRequest): Observable<CreateOrderResponse> {
    const url = `${this.API_URL}/api/v1/order/create`;
    return this.http.post<CreateOrderResponse>(url, req).pipe(
      map((resp: CreateOrderResponse) => {
        return new CreateOrderResponse(resp);
      }),
      catchError(error => {
        console.error('Error creating order:', error);
        return throwError(() => error);
      })
    );
  }

  /**
   * Активация подписки после оплаты
   */
  callback(req: OrderCallbackRequest): Observable<OrderCallbackResponse> {
    const url = `${this.API_URL}/api/v1/order/callback`;
    return this.http.post<OrderCallbackResponse>(url, req).pipe(
      map((resp: OrderCallbackResponse) => {
        return new OrderCallbackResponse(resp);
      }),
      catchError(error => {
        console.error('Error activating order:', error);
        return throwError(() => error);
      })
    );
  }
}
