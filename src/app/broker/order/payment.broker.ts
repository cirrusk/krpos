import { Injectable } from '@angular/core';
import { Subject } from 'rxjs/Subject';
import { Observable } from 'rxjs/Observable';

@Injectable()
export class PaymentBroker {
  /**
   * @ignore
   */
  private subject = new Subject<any>();

  /**
   * payment broker
   *
   * @param type 메시지 타입
   * @param message 메시지
   */
  sendInfo(type: string, message: any) {
    const data = {type: type, data: message };
    this.subject.next(data);
  }

  /**
   * @ignore
   */
  clear() {
    this.subject.next();
  }

  /**
   * payment 정보 전송 Observable
   */
  getInfo(): Observable<any> {
    return this.subject.asObservable();
  }

}
