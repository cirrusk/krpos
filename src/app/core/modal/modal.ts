import { Injectable, Injector, Type } from '@angular/core';
import { Observable } from 'rxjs/Observable';

import { ModalComponent } from './modal.component';
import { BasicModalComponent } from './basic-modal.component';
import { ModalService } from './modal.service';

@Injectable()
export class Modal {

  constructor(injector: Injector, private modalService: ModalService) { }

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

  openModalByComponent(component: Type<ModalComponent>, params?: any): Observable<any> {
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
    return params;
  }


}
