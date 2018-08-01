import { Injectable } from '@angular/core';

import { Observable } from 'rxjs/Observable';
import { Subject } from 'rxjs/Subject';

@Injectable()
export class AddCartBroker {
    /**
     * @ignore
     */
    private subject = new Subject<any>();

    /**
     * add to cart 메시지 전송
     *
     * @param message cart broker 전송 메시지
     */
    sendMessage(message: any) {
        this.subject.next(message);
    }

    /**
     * 메시지 삭제(빈 메시지 전송)
     */
    clearMessage() {
        this.subject.next();
    }

    /**
     * Observable 구하기
     */
    getSubscription(): Observable<any> {
        return this.subject.asObservable();
    }
}
