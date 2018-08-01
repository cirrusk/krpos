import { Injectable } from '@angular/core';
import { Subject } from 'rxjs/Subject';
import { Observable } from 'rxjs/Observable';
import { Logger } from '../../../core';

@Injectable()
export class SearchBroker {
  private subject = new Subject<any>();

  constructor(private logger: Logger) { }

  /**
   * 검색 이벤트 메시지 전송 broker
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
   * 검색 이벤트 메시지 전송 Observable
   */
  getInfo(): Observable<any> {
    return this.subject.asObservable();
  }

}
