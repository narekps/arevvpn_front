export class SubscriptionCancelRequest {
  email: string;
  captchaToken: string;

  constructor(data: SubscriptionCancelRequest) {
    this.email = data.email;
    this.captchaToken = data.captchaToken;
  }
}

export class SubscriptionCancelResponse {
  message: string;

  constructor(data: SubscriptionCancelResponse) {
    this.message = data.message;
  }
}
