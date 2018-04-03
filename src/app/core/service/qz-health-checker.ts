
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs/Observable';

import 'rxjs/add/observable/interval';
import 'rxjs/add/operator/first';

declare var qz: any;

@Injectable()
export class QzHealthChecker {

  // 5분에 한번 씩 체크하도록
  private checker: Observable<boolean>;
  constructor() {
    this.checker = Observable.interval(1000 * 60 * 5)
    // .first()
    .map(
      result => {
        return qz.websocket.isActive();
      }
    ); // .share();
  }

  getQzChecker(): Observable<boolean> {
    return this.checker;
  }
}
