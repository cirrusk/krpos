import { Pipe, PipeTransform } from '@angular/core';
import { Utils } from '../utils';

@Pipe({
  name: 'stripHtml'
})
export class StripHtmlPipe implements PipeTransform {

  transform(value: string, type?: string): any {
    let rtn;
    switch (type) {
      case 'ber': {
        if (value && value.length > 9) {
          const semucode = value.substring(0, 3); // 세무서코드
          const bizcode = value.substring(3, 5);  // 개인,법인,면세,비영리구분
          const seqcode = value.substring(5, 9);  // 일련번호
          const valcode = value.substring(9, 10); // 검증번호
          rtn = semucode + '-' + bizcode + '-' + seqcode + valcode;
        }
      } break;
      default: {
        rtn = Utils.stripHtml(value);
      }
    }
    return rtn;
  }

}
