import { Pipe, PipeTransform } from '@angular/core';
import { Utils } from '../utils';

@Pipe({
  name: 'stripHtml'
})
export class StripHtmlPipe implements PipeTransform {

  transform(value: string): any {
    return Utils.stripHtml(value);
  }

}
