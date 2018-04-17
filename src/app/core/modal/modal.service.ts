import { Injectable, ComponentFactoryResolver, ApplicationRef, Injector,
  EmbeddedViewRef, Type } from '@angular/core';
import { Observable } from 'rxjs/Observable';

import { ModalComponent } from './modal.component';
import { ModalHostComponent } from './modal-host.component';

@Injectable()
export class ModalService {

  modals: any;
  private modalHostComponent: ModalHostComponent;
  constructor(private resolver: ComponentFactoryResolver,
    private applicationRef: ApplicationRef,
    private injector: Injector) { }

  addModal(component: Type<ModalComponent>, data?: any, index?: number): Observable<any> {
    // Create an instance of dialogMainComponent if not exist.
    if (!this.modalHostComponent) {
        this.modalHostComponent = this.createModalHost();
    }
    // Populate dialogs array for access by service caller.
    this.modals = this.modalHostComponent.modals;

    return this.modalHostComponent.addModal(component, data, index);
  }

  removeModal(component: ModalComponent, clearAll: boolean = false): void {
    if (!this.modalHostComponent) {
      return;
    }
    // Close all dialogs if clearAll flag is passed.
    if (clearAll) {
      this.modalHostComponent.removeAllModals();
    } else if (component.closeAllModals) { // Closing all dialogs.
      this.modalHostComponent.removeAllModals();
    } else if (component.closeImmediateParent) {
      this.modalHostComponent.removeModalAndParent(component);
    } else {
      this.modalHostComponent.removeModal(component);
    }
  }

  private createModalHost(): ModalHostComponent {
    const componentFactory = this.resolver.resolveComponentFactory(ModalHostComponent);
    const componentRef = componentFactory.create(this.injector);
    const componentRootNode = (componentRef.hostView as EmbeddedViewRef<any>).rootNodes[0] as HTMLElement;
    const componentRootViewConainer = this.applicationRef['components'][0]; /*this.applicationRef['_rootComponents'][0];*/
    const rootLocation: Element = (componentRootViewConainer.hostView as EmbeddedViewRef<any>).rootNodes[0] as HTMLElement;
    this.applicationRef.attachView(componentRef.hostView);

    componentRef.onDestroy(() => {
      this.applicationRef.detachView(componentRef.hostView);
    });

    rootLocation.appendChild(componentRootNode);

    return componentRef.instance;
  }

}
