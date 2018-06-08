import {
  Component, ElementRef, ViewChild, ViewContainerRef, ComponentFactoryResolver,
  Type, ReflectiveInjector, HostListener
} from '@angular/core';

import { ModalComponent } from './modal.component';
import { ModalConfig } from './modal-config';
import { StorageService } from '../service/storage.service';
import { KeyCode } from '../../data/models/key-code';

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

  constructor(private resolver: ComponentFactoryResolver, private elem: ElementRef, private storage: StorageService) { }

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
    if (this.content.closeByClickOutside && event.target.classList.contains('layer_pop')) {
      this.content.modalResult();
    }
  }

  // Press Esc or Enter key to close dialog.
  @HostListener('document:keydown', ['$event', '$event.target'])
  keyboardInput(event: any, targetElm: HTMLElement) {
    event.stopPropagation();   // event.preventDefault();
    const modalid = this.content.modalId;
    const latestmodalid = this.storage.getLatestModalId();
    if ((this.content.closeByEnter && event.keyCode === KeyCode.ENTER) ||
      (this.content.closeByEscape && event.keyCode === KeyCode.ESCAPE)) {
      if (modalid && latestmodalid) { // 모달 찾는 값들이 있어야만 처리
        if (modalid === latestmodalid) { // session 의 마지막 모달 아이디와 전송한 모달 아이디가 같을 경우
          // this.storage.removeLatestModalId();
          this.content.modalResult();
        }
      } else {
        console.log('close modal basic');
        this.content.modalResult();
      }
    }
  }

}
