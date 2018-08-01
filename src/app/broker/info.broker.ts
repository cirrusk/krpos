import { Injectable } from '@angular/core';
import { Observable } from 'rxjs/Observable';
import { Subject } from 'rxjs/Subject';

@Injectable()
export class InfoBroker {

  private subject = new Subject<any>();
  constructor() { }

  /**
   * 정보 전송 broker
   *
   * @param type 정보 전송 broker 타입
   * @param message 정보 전송 broker 메시지
   */
  sendInfo(type: string, message: any) {
    const data = {type: type, data: message };
    this.subject.next(data);
  }

  clear() {
    this.subject.next();
  }

  getInfo(): Observable<any> {
    return this.subject.asObservable();
  }

}
