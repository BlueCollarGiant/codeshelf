import { Pipe, PipeTransform } from '@angular/core';
import { relativeDate } from '../../core/utils/date.utils';

@Pipe({ name: 'relativeDate', standalone: true })
export class RelativeDatePipe implements PipeTransform {
  transform(value: string): string {
    return relativeDate(value);
  }
}
