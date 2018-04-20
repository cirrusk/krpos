import { Injectable } from '@angular/core';
import { Subject } from 'rxjs/Subject';
import { Observable } from 'rxjs/Observable';
import { Logger } from '../../../service/pos';

@Injectable()
export class SearchBroker {
  private subject = new Subject<any>();

  constructor(private logger: Logger) { }

  sendInfo(message: any) {
    this.logger.set({n: 'search.broker', m: 'Send info...'}).debug();
    this.subject.next(message);
  }

  clear() {
    this.subject.next();
  }

  getInfo(): Observable<any> {
    return this.subject.asObservable();
  }

}
