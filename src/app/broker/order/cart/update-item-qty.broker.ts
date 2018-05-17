import { Injectable } from '@angular/core';
import { Observable } from 'rxjs/Observable';
import { Subject } from 'rxjs/Subject';
import { Logger } from '../../../core';

@Injectable()
export class UpdateItemQtyBroker {

  private subject = new Subject<any>();

  constructor(private logger: Logger) { }

  sendInfo(message: any) {
    this.logger.set('UpdateItemQtyBroker', 'Send info...').debug();
    this.subject.next(message);
  }

  clear() {
    this.subject.next();
  }

  getInfo(): Observable<any> {
    return this.subject.asObservable();
  }

}
