import { Injectable } from '@angular/core';
import { Subject } from 'rxjs/Subject';
import { Logger } from '../../../service/pos';
import { Observable } from 'rxjs/Observable';

@Injectable()
export class CancleOrderBroker {
  private subject = new Subject<any>();

  constructor(private logger: Logger) { }

  sendInfo(message: any) {
    this.logger.set('CancleOrderBroker', 'Send info...').debug();
    this.subject.next(message);
  }

  clear() {
    this.subject.next();
  }

  getInfo(): Observable<any> {
    return this.subject.asObservable();
  }

}