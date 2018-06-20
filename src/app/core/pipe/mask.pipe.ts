import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'mask'
})
export class MaskPipe implements PipeTransform {

  transform(value: any, type?: string): string {
    let rtn;
    switch (type) {
      case 'phone': {
        const firstIndex = value.indexOf('-');
        const lastIndex = value.lastIndexOf('-');
        rtn = value.substring(0, firstIndex + 1) + '****' + value.substring(lastIndex, value.length);
      } break;
      case 'name': {
        const firstnm = value.substring(0, 1);
        const lastnm = value.substring(value.length - 1);
        let split = '';
        for (let i = 0; i < value.length; i++) {
          split += '*';
        }
        rtn = firstnm + split + lastnm;
      } break;
      case 'uid': {
        rtn = value.substring(0, 4) + '****';
      } break;
      default: { } break;
    }
    return rtn;
  }

}
