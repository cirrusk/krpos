import { Injectable } from '@angular/core';

import { Observable } from 'rxjs/Observable';
import { Subject } from 'rxjs/Subject';

@Injectable()
export class InfoBroker {

  private subject = new Subject<any>();
  constructor() { }
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
