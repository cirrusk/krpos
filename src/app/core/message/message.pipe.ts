import { Pipe, PipeTransform } from '@angular/core';
import { MessageService } from './message.service';

@Pipe({
  name: 'message'
})
export class MessagePipe implements PipeTransform {

  constructor(private msg: MessageService) {}

  transform(value: any, args?: any): any {
    if (!value) {
      return;
    }
    return this.msg.get(value);
  }

}
