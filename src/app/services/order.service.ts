import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import {catchError, map} from 'rxjs/operators';
import { environment } from '../../environments/environment';
import {
  CreateOrderRequest,
  CreateOrderResponse,
  OrderSuccessRequest,
  OrderSuccessResponse,
} from '../models/order/order-data.interface';
import {GetResponse} from "../models/tariff/get-response";

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
   * Активация подписки после успешной оплаты
   */
  success(req: OrderSuccessRequest): Observable<OrderSuccessResponse> {
    const url = `${this.API_URL}/api/v1/order/success`;
    return this.http.post<OrderSuccessResponse>(url, req).pipe(
      map((resp: OrderSuccessResponse) => {
        return new OrderSuccessResponse(resp);
      }),
      catchError(error => {
        console.error('Error activating order:', error);
        return throwError(() => error);
      })
    );
  }
}
