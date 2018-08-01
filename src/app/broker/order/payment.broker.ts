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
   *
   * @param type
   * @param message
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
   * @ignore
   */
  getInfo(): Observable<any> {
    return this.subject.asObservable();
  }

}
