import { Injectable, Optional, SkipSelf } from '@angular/core';
import { Subject } from 'rxjs/Subject';

export interface SpinnerState {
  show: boolean;
  iconType: string;
}

@Injectable()
export class SpinnerService {

  private spinnerSubject = new Subject<SpinnerState>();
  spinnerState = this.spinnerSubject.asObservable();
  constructor(@Optional() @SkipSelf() prior: SpinnerService) {
    if (prior) { return prior; }
   }

   show(iconType?: string) {
     this.spinnerSubject.next(<SpinnerState> { show: true, iconType: iconType });
   }

   hide() {
     this.spinnerSubject.next(<SpinnerState> { show: false });
   }

}
