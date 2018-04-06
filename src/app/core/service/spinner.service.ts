import { Injectable, Optional, SkipSelf } from '@angular/core';
import { Subject } from 'rxjs/Subject';

export interface SpinnerState {
  show: boolean;
  message?: string;
}

@Injectable()
export class SpinnerService {

  private spinnerSubject = new Subject<SpinnerState>();
  spinnerState = this.spinnerSubject.asObservable();
  constructor(@Optional() @SkipSelf() prior: SpinnerService) {
    if (prior) {return prior; }
   }

   show(message?: string) {
     this.spinnerSubject.next(<SpinnerState> { show: true, message: message });
   }

   hide() {
     this.spinnerSubject.next(<SpinnerState> { show: false });
   }

}
