import { Injectable, Injector, Type } from '@angular/core';
import { Observable } from 'rxjs/Observable';

import { ModalComponent } from './modal.component';
import { BasicModalComponent } from './basic-modal.component';
import { ModalService } from './modal.service';
import { StorageService } from '../service/storage.service';

@Injectable()
export class Modal {

  constructor(injector: Injector, private modalService: ModalService, private storage: StorageService) { }

  openMessage(param: any, title?: string) {
    const params: any = this.getParams(param, title);
    params.basicType = 'message';
    this.modalService.addModal(BasicModalComponent, params);
  }

  openConfirm(param: any, title?: string): Observable<any> {
    const params: any = this.getParams(param, title);
    params.basicType = 'confirm';
    return this.modalService.addModal(BasicModalComponent, params);
  }

  openModalByComponent(component: Type<ModalComponent>, param?: any): Observable<any> {
    const params: any = this.getParams(param);
    return this.modalService.addModal(component, params);
  }

  getModalArray(): ModalComponent[] {
    return this.modalService.modals;
  }

  clearAllModals(dialogComponent: ModalComponent) {
    this.modalService.removeModal(dialogComponent, true);
  }

  private getParams(param: any, title?: string): any {
    let params: any = {};
    if (param && typeof param === 'string') {
        // Sigle line inputs.
        params.message = param;
        if (title !== undefined && title !== '') { params.title = title; }
    } else if (param && typeof param === 'object') {
        params = param;
    }
    params.modalId = this.getModalId(params);
    return params;
  }

  private getModalId(param: any): string {
    let modalid: string = '';
    const keys = Object.keys(param);
    for (let idx = 0, length = keys.length; idx < length; idx++) {
      if (keys[idx] === 'modalId') {
        modalid = param['modalId'];
        this.storage.setLatestModalId(modalid);
        break;
      }
    }
    return modalid;
  }

}
