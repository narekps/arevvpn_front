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

export class OrderSuccessRequest {
  paymentId: string;

  constructor(data: OrderSuccessRequest) {
    this.paymentId = data.paymentId;
  }
}

export class OrderSuccessResponse {
  success: boolean;
  subscriptionUrl: string;

  constructor(data: OrderSuccessResponse) {
    this.success = data.success;
    this.subscriptionUrl = data.subscriptionUrl;
  }
}
