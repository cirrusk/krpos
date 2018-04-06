import { Injectable, Optional, SkipSelf } from '@angular/core';
import { Subject } from 'rxjs/Subject';

export interface ToastMessage {
  title: string;
  message: string;
}

@Injectable()
export class ToastService {

  private toastSubject = new Subject<ToastMessage>();
  toastState = this.toastSubject.asObservable();
  constructor(@Optional() @SkipSelf() prior: ToastService) {
    if (prior) { return prior; }
  }

  active(title?: string, message?: string) {
    this.toastSubject.next(<ToastMessage> { title: title, message: message });
  }
}
