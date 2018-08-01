import { Injectable } from '@angular/core';
import { Subject } from 'rxjs/Subject';
import { Observable } from 'rxjs/Observable';

@Injectable()
export class SearchAccountBroker {
  private subject = new Subject<any>();

  constructor() { }

  /**
   * 회원 조회 시 broker 전송
   *
   * @param type 회원 조회 broker 타입
   * @param message 회원 조회 broker 메시지
   */
  sendInfo(type: string, message: any) {
    const data = {type: type, data: message };
    this.subject.next(data);
  }

  /**
   * 메시지 초기화
   */
  clear() {
    this.subject.next();
  }

  /**
   * Observalbe 조회
   */
  getInfo(): Observable<any> {
    return this.subject.asObservable();
  }

}
