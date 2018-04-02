
import { Component, ViewChild, ViewContainerRef, ComponentFactoryResolver,
  Type, ReflectiveInjector, HostListener, Renderer } from '@angular/core';

import { ModalComponent } from './modal.component';
import { ModalConfig } from './modal-config';

@Component({
  moduleId: module.id,
  selector: 'pos-modal-main',
  templateUrl: './modal-main.component.html',
  styleUrls: ['./modal-main.component.css']
})
export class ModalMainComponent {

  @ViewChild('element', { read: ViewContainerRef }) private element: ViewContainerRef;

  private shown = false;
  private content: ModalComponent;
  dialogPaddingTop = 0;
  dialogWidth: string;
  isGrayBg: boolean;
  isDraggable: boolean;

  constructor(private resolver: ComponentFactoryResolver, private renderer: Renderer) { }

  addComponent(component: Type<ModalComponent>) {
    const factory = this.resolver.resolveComponentFactory(component);
    const injector = ReflectiveInjector.fromResolvedProviders([], this.element.injector);
    const componentRef = factory.create(injector);
    this.element.insert(componentRef.hostView);
    this.content = <ModalComponent>componentRef.instance;
    this.content.modalMain = this;
    return this.content;
  }

  show(): void {
    // Check and overwrite default settings by dialog-level custom configs.
    this.dialogWidth = this.content.width === undefined ? ModalConfig.width : this.content.width;
    if (this.content.width === undefined) { this.content.width = this.dialogWidth; }

    this.isGrayBg = this.content.grayBg === undefined ? ModalConfig.grayBg : this.content.grayBg;
    if (this.content.grayBg === undefined) { this.content.grayBg = this.isGrayBg; }

    this.isDraggable = this.content.draggable === undefined ? ModalConfig.draggable : this.content.draggable;
    if (this.content.draggable === undefined) { this.content.draggable = this.isDraggable; }

    if (this.content.closeByEnter === undefined) { this.content.closeByEnter = ModalConfig.closeByEnter; }
    if (this.content.closeByEscape === undefined) { this.content.closeByEscape = ModalConfig.closeByEscape; }
    if (this.content.closeByClickOutside === undefined) { this.content.closeByClickOutside = ModalConfig.closeByClickOutside; }
    if (this.content.closeAllModals === undefined) { this.content.closeAllModals = ModalConfig.closeAllModals; }
    if (this.content.closeImmediateParent === undefined) { this.content.closeImmediateParent = ModalConfig.closeImmediateParent; }
    if (this.content.keepOpenForAction === undefined) { this.content.keepOpenForAction = ModalConfig.keepOpenForAction; }
    if (this.content.keepOpenForClose === undefined) { this.content.keepOpenForClose = ModalConfig.keepOpenForClose; }

    if (this.content.closeDelay === undefined) { this.content.closeDelay = ModalConfig.closeDelay; }
    if (this.content.closeDelayParent === undefined) { this.content.closeDelayParent = ModalConfig.closeDelayParent; }

    // For basic type dialogs only.
    if (this.content.basicType === 'message') {
      if (this.content.title === undefined) { this.content.title = ModalConfig.messageTitle; }
      if (this.content.closeButtonLabel === undefined || this.content.closeButtonLabel === '') {
        this.content.closeButtonLabel = ModalConfig.messageCloseButtonLabel;
        // Use action button pattern if no value for closeButtonLabel.
        if ((this.content.closeButtonLabel === undefined || this.content.closeButtonLabel === '') &&
          this.content.actionButtonLabel === undefined) {
          this.content.actionButtonLabel = ModalConfig.messageActionButtonLabel;
        }
      }
    } else if (this.content.basicType === 'confirm') {
      if (this.content.title === undefined) { this.content.title = ModalConfig.confirmTitle; }
      if (this.content.actionButtonLabel === undefined) { this.content.actionButtonLabel = ModalConfig.confirmActionButtonLabel; }
      if (this.content.closeButtonLabel === undefined) { this.content.closeButtonLabel = ModalConfig.confirmCloseButtonLabel; }
    }
    this.shown = true;
  }

  hide(): void {
    this.shown = false;
  }

  clickOutside(event) {
    if (this.content.closeByClickOutside && event.target.classList.contains('dim_box')) {
      this.content.modalResult();
    }
  }

  // Press Esc or Enter key to close dialog.
  @HostListener('window:keydown', ['$event'])
  keyboardInput(event: any) {
    // event.preventDefault();
    event.stopPropagation();
    if ((this.content.closeByEnter && event.keyCode === 13) ||
      (this.content.closeByEscape && event.keyCode === 27)) {
      this.content.modalResult();
    }
  }

}