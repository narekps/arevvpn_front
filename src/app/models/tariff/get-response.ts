import {Tariff} from "./tariff";

export class GetResponse {
  tariff: Tariff;

  constructor(data: GetResponse) {
      this.tariff = new Tariff(data.tariff);
  }
}
