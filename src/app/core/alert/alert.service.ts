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
      alertType: (params.alertType) ? params.alertType : AlertType.warn,
      title: (params.title) ? params.title : '확인',
      message: params.message,
      timer: (params.timer) ? params.timer : false,
      interval: (params.interval > 0) ? params.interval : 3500
    });
  }

  hide() {
    this.alertSubject.next(<AlertState> { show: false });
  }

  info(params: any) {
    params.alertType = AlertType.info;
    params.title = (params.title) ? params.title : '확인',
    this.show(params);
  }

  warn(params: any) {
    params.alertType = AlertType.warn;
    params.title = (params.title) ? params.title : '확인',
    this.show(params);
  }

  error(params: any) {
    params.alertType = AlertType.error;
    params.title = (params.title) ? params.title : '오류',
    this.show(params);
  }

}
