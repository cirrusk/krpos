import { Injectable } from '@angular/core';

import { Observable } from 'rxjs/Observable';
import { Subject } from 'rxjs/Subject';
import { Logger } from '../service/pos';

@Injectable()
export class InfoBroker {

  private subject = new Subject<any>();
  constructor(private logger: Logger) { }
  sendInfo(message: any) {
    this.logger.debug('*** [info broker] send info...');
    this.subject.next(message);
  }

  clear() {
    this.subject.next();
  }

  getInfo(): Observable<any> {
    return this.subject.asObservable();
  }

}
