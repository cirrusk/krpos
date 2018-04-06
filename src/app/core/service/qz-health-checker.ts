import { Injectable } from '@angular/core';
import { Observable } from 'rxjs/Observable';

import 'rxjs/add/observable/interval';

declare var qz: any;

@Injectable()
export class QzHealthChecker {

  // 5분에 한번 씩 체크하도록
  private checker: Observable<boolean>;
  constructor() {
    this.checker = Observable.interval(1000 * 60 * 5)
    .map(
      result => {
        return qz.websocket.isActive();
      }
    );
  }

  getQzChecker(): Observable<boolean> {
    return this.checker;
  }
}
