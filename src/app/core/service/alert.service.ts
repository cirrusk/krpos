import { Subject } from 'rxjs/Subject';
import { Injectable, Optional, SkipSelf } from '@angular/core';
import { AlertType } from '../alert/alert-type.enum';

export interface AlertState {
  show: boolean;
  alertType: string;
  title?: string;
  message?: string;
}
@Injectable()
export class AlertService {
  private alertSubject = new Subject<AlertState>();
  alertState = this.alertSubject.asObservable();
  constructor(@Optional() @SkipSelf() prior: AlertService) {
    if (prior) { return prior; }
  }

  show(alertType: AlertType, title: string, message: string) {
    this.alertSubject.next(<AlertState> { show: true, alertType: alertType, title: title, message: message });
  }

  hide() {
    this.alertSubject.next(<AlertState> { show: false });
  }

}
