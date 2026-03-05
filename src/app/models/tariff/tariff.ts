export class Tariff {
  id: string;
  name: string;
  description: string;
  durationMonths: number;
  amount: number;
  currency: string;
  isActive: boolean;
  isTrial: boolean;
  isBestseller: boolean;
  isProfitable: boolean;

  constructor(data: Tariff) {
    this.id = data.id;
    this.name = data.name;
    this.description = data.description;
    this.durationMonths = data.durationMonths;
    this.amount = data.amount;
    this.currency = data.currency;
    this.isActive = data.isActive;
    this.isTrial = data.isTrial;
    this.isBestseller = data.isBestseller;
    this.isProfitable = data.isProfitable;
  }
}
