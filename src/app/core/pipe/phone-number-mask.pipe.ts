import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'phoneNumberMask'
})
export class PhoneNumberMaskPipe implements PipeTransform {
  transform(phoneNumber: any, symbols?: any): any {
    const firstIndex = phoneNumber.indexOf('-');
    const lastIndex = phoneNumber.lastIndexOf('-');
    return phoneNumber.substring(0, firstIndex + 1) + '****' + phoneNumber.substring(lastIndex, phoneNumber.length);
  }

}
