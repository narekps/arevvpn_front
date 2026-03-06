export class CreateOrderRequest {
  tariffId: string;
  email: string;
  agreeToTerms: boolean;
  paymentMethod: number;
  captchaToken: string;

  constructor(data: CreateOrderRequest) {
    this.tariffId = data.tariffId;
    this.email = data.email;
    this.agreeToTerms = data.agreeToTerms;
    this.paymentMethod = data.paymentMethod;
    this.captchaToken = data.captchaToken;
  }
}

export class CreateOrderResponse {
  url: string;

  constructor(data: CreateOrderResponse) {
    this.url = data.url;
  }
}

export class OrderCallbackRequest {
  paymentId: string;

  constructor(data: OrderCallbackRequest) {
    this.paymentId = data.paymentId;
  }
}

export class OrderCallbackResponse {
  subscriptionUrl: string;
  paymentStatus: 'pending' | 'waiting_for_capture' | 'succeeded' | 'canceled';

  constructor(data: OrderCallbackResponse) {
    this.subscriptionUrl = data.subscriptionUrl;
    this.paymentStatus = data.paymentStatus;
  }
}
