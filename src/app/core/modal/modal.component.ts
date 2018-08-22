import { Component } from '@angular/core';
import { Observer } from 'rxjs/Observer';
import { Observable } from 'rxjs/Observable';

import { ModalMainComponent } from './modal-main.component';
import { ModalService } from './modal.service';

@Component({
  selector: 'pos-modal-component',
  template: ''
})
export class ModalComponent {

  private observer: Observer<any>;
  protected result: any;

  modalMain: ModalMainComponent;
  modalCallback: any;
  isEnter: boolean = undefined;

  callerData: any;

  width: string = undefined;
  grayBg: boolean = undefined;
  draggable: boolean = undefined;

  closeDelay: number = undefined;
  closeDelayParent: number = undefined;
  closeByClickOutside: boolean = undefined;
  closeByEnter: boolean = undefined;
  closeByEscape: boolean = undefined;
  closeAllModals: boolean = undefined;
  closeImmediateParent: boolean = undefined;
  keepOpenForAction: boolean = undefined;
  keepOpenForClose: boolean = undefined;
  beforeActionCallback: any = undefined;
  beforeCloseCallback: any = undefined;

  title: string = undefined;
  modalId: string = undefined; // 2018.04.16 모달 key event 중복 처리 방지
  actionButtonLabel: string = undefined;
  closeButtonLabel: string = undefined;
  modalAddClass: string = undefined;
  headerAddClass: string = undefined;
  titleAddClass: string = undefined;
  bodyAddClass: string = undefined;
  messageAddClass: string = undefined;
  footerAddClass: string = undefined;
  actionButtonAddClass: string = undefined;
  closeButtonAddClass: string = undefined;

  basicType: string = undefined;

  constructor(protected modalService: ModalService) { }

  fillData(data: any = {}): Observable<any> {
    const keys = Object.keys(data);
    for (let idx = 0, length = keys.length; idx < length; idx++) {
        const key = keys[idx];
        this[key] = data[key];
    }
    return Observable.create((observer) => {
        this.observer = observer;
        return () => {
            this.modalResult();
        };
    });
  }

  modalResult(): void {
    // Callback function that returns an observable and handles before-close callback. Otherwise just close the dialog.
    if (this.result && this.beforeActionCallback) {
      this.modalCallback = this.beforeActionCallback;
    } else if (!this.result && this.beforeCloseCallback) {
      this.modalCallback = this.beforeCloseCallback;
    }
    let callBackResult: any;
    if (!this.result && this.beforeCloseCallback && typeof this.beforeCloseCallback === 'function') {
      callBackResult = this.beforeCloseCallback.call(this);
    } else if (this.result && this.beforeActionCallback && typeof this.beforeActionCallback === 'function') {
      callBackResult = this.beforeActionCallback.call(this);
    } else {
      this.closeModal();
      return;
    }
    if (callBackResult && typeof callBackResult === 'object') {
      callBackResult.subscribe((result) => {
        if (result) {
          this.closeModal();
        } else {
          return;
        }
      });
    } else {
      this.closeModal();
    }
  }

  closeModal(): void {
    if (this.observer) {
      this.observer.next(this.result);
    }
    if ((this.result && !this.keepOpenForAction) || (!this.result && !this.keepOpenForClose) ) {
      this.modalService.removeModal(this);
    }
  }

}
