import { Component, ViewChild, ViewContainerRef, ComponentFactoryResolver,
  ReflectiveInjector, Type } from '@angular/core';

import { Observable } from 'rxjs/Observable';

import { ModalComponent } from './modal.component';
import { ModalMainComponent } from './modal-main.component';
import { StorageService } from '../service/storage.service';

@Component({
  selector: 'pos-modal-host',
  template: '<template #element></template>'
})
export class ModalHostComponent {

  @ViewChild('element', {read: ViewContainerRef}) private element: ViewContainerRef;

  modals: Array<ModalComponent> = [];

  constructor(private resolver: ComponentFactoryResolver, private storage: StorageService) { }

  addModal(component: Type<ModalComponent>, data?: any, index?: number): Observable<any> {
    const factory = this.resolver.resolveComponentFactory(ModalMainComponent);
    const componentRef = this.element.createComponent(factory, index);
    const modalMain: ModalMainComponent = <ModalMainComponent> componentRef.instance;
    const _component: ModalComponent = modalMain.addComponent(component);
    if (typeof (index) !== 'undefined') {
        this.modals.splice(index, 0, _component);
    } else {
        this.modals.push(_component);
    }

    setTimeout(() => {
      modalMain.show();
    });
    return _component.fillData(data);
  }

  removeModal(component: ModalComponent, closeDelay?: number) {
    let delayMs = closeDelay === undefined ? component.closeDelay : closeDelay;
    // No visible delay if no animaion fade in.
    delayMs = 5;
    component.modalMain.hide();
    this.storage.removeLatestModalId();
    setTimeout(() => {
      const index = this.modals.indexOf(component);
      if (index > -1) {
          this.element.remove(index);
          this.modals.splice(index, 1);
      }
    }, delayMs);
  }

  removeModalAndParent(component: ModalComponent) {
    this.storage.removeAllModalIds();
    const _thisRef = this;
    const modalIndex = this.modals.indexOf(component);
    this.modals.forEach(function (value, index) {
      if (index === modalIndex || index === modalIndex - 1) {
          _thisRef.removeModal(value, _thisRef.getCloseDelayForParent(value, index));
      }
    });
  }

  removeAllModals() {
    this.storage.removeAllModalIds();
    const _thisRef = this;
    this.modals.forEach(function (value, index) {
      _thisRef.removeModal(value, _thisRef.getCloseDelayForParent(value, index));
    });
  }

  private getCloseDelayForParent(component: ModalComponent, index: number): number {
    let closeDelayParent: number;
    if (index < this.modals.length - 1) {
      closeDelayParent = component.closeDelay === undefined ? component.closeDelayParent : component.closeDelay;
    } else {
      closeDelayParent = component.closeDelay;
    }
    return closeDelayParent;
  }

}
