import { Injectable } from '@angular/core';
import { Observable } from 'rxjs/Observable';
import { Subject } from 'rxjs/Subject';
import { Logger } from '../../../core';

@Injectable()
export class RestoreCartBroker {

  private subject = new Subject<any>();

  constructor(private logger: Logger) { }

  /**
   * cart 복구 메시지 전송 broker
   *
   * @param message cart 복구 메시지
   */
  sendInfo(message: any) {
    this.logger.set('RestoreCartBroker', 'Send info...').debug();
    this.subject.next(message);
  }

  /**
   * cart 복구 메시지 clear
   */
  clear() {
    this.subject.next();
  }

  /**
   * cart 복구 broker Observable
   */
  getInfo(): Observable<any> {
    return this.subject.asObservable();
  }

}
