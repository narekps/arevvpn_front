import { Pipe, PipeTransform } from '@angular/core';
import {getMonthWord} from "../util";

@Pipe({
  name: 'monthWord'
})
export class MonthWordPipe implements PipeTransform {
  transform(value: any, nullText: string = '–'): string {
    if (value === null || value === undefined || value === '') {
      return nullText;
    }

    const num = Number(value);
    if (isNaN(num)) {
      return '';
    }

    const word = getMonthWord(num)

    return `${value} ${word}`;
  }
}
