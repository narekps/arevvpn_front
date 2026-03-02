import {Tariff} from "./tariff";

export class ListResponse {
  tariffs: Tariff[] = [];

  constructor(data: ListResponse) {
    if (data.tariffs) {
      this.tariffs = data.tariffs.map(tariff => new Tariff(tariff));
    }
  }
}
