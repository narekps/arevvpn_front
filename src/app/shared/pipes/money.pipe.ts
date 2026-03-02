import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'money'
})
export class MoneyPipe implements PipeTransform {
  transform(value: any, nullText: string = '–'): string {
    if (value === null || value === undefined || value === '') {
      return nullText;
    }

    const num = Number(value);
    if (isNaN(num)) {
      return value.toString();
    }

    const formattedValue = num.toFixed(0).replace(/\B(?=(\d{3})+(?!\d))/g, ' ');
    return `${formattedValue} ₽`;
  }
}
