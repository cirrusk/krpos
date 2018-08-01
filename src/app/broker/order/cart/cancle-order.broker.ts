import { Injectable } from '@angular/core';
import { Subject } from 'rxjs/Subject';
import { Observable } from 'rxjs/Observable';
import { Logger } from '../../../core';

@Injectable()
export class CancleOrderBroker {
  private subject = new Subject<any>();

  constructor(private logger: Logger) { }

  /**
   * 주문 취소 broker 메시지 전송
   * @param message 주문 취소 메시지
   */
  sendInfo(message: any) {
    this.logger.set('CancleOrderBroker', 'Send info...').debug();
    this.subject.next(message);
  }

  /**
   * 주문 취소 메시지 clear
   */
  clear() {
    this.subject.next();
  }

  /**
   * 주문 취소 broker Observable
   */
  getInfo(): Observable<any> {
    return this.subject.asObservable();
  }

}
