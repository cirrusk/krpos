import { Injectable } from '@angular/core';
import { Subject } from 'rxjs/Subject';
import { Observable } from 'rxjs/Observable';
import { Logger } from '../../../core';
import { Utils } from '../../../core/utils';

@Injectable()
export class AddCartBroker {
  private subject = new Subject<any>();

  constructor(private logger: Logger) { }

  /**
   * add cart broker 메시지 전송
   *
   * @param message add cart 시 전송할 메시지
   */
  sendInfo(message: any) {
    this.logger.set('add to cart broker', 'Send info... ').debug();
    this.subject.next(message);
  }

  /**
   * broker 메시지 clear
   */
  clear() {
    this.subject.next();
  }

  /**
   * add cart broker 메시지 수신 Observable
   */
  getInfo(): Observable<any> {
    return this.subject.asObservable();
  }
}
