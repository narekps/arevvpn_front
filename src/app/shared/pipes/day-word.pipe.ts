import { Pipe, PipeTransform } from '@angular/core';
import {getDayWord} from "../util";

@Pipe({
  name: 'dayWord'
})
export class DayWordPipe implements PipeTransform {
  transform(value: any, nullText: string = '–'): string {
    if (value === null || value === undefined || value === '') {
      return nullText;
    }

    const num = Number(value);
    if (isNaN(num)) {
      return '';
    }

    const word = getDayWord(num)

    return `${value} ${word}`;
  }
}
