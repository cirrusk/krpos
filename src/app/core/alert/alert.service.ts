import { Subject } from 'rxjs/Subject';
import { Injectable, Optional, SkipSelf } from '@angular/core';
import { AlertType } from '../alert/alert-type.enum';

export interface AlertState {
  show: boolean;
  alertType: string;
  title?: string;
  message?: string;
  timer?: boolean;
  interval?: number;
}
@Injectable()
export class AlertService {
  private alertSubject = new Subject<AlertState>();
  alertState = this.alertSubject.asObservable();
  constructor(@Optional() @SkipSelf() prior: AlertService) {
    if (prior) { return prior; }
  }

  show(params: any) {
    this.alertSubject.next(<AlertState>
      {
      show: true,
      alertType: params.alertType,
      title: params.title,
      message: params.message,
      timer: params.timer,
      interval: params.interval
    });
  }

  hide() {
    this.alertSubject.next(<AlertState> { show: false });
  }

}
