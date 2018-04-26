import { Component, OnInit, AfterViewInit, Renderer2, ViewChild, ElementRef } from '@angular/core';

import { ModalComponent } from './modal.component';
import { ModalService } from './modal.service';
import { StorageService } from '../service/storage.service';
import { FocusBlurDirective } from './focus-blur.directive';

@Component({
  moduleId: module.id,
  selector: 'pos-basic-modal',
  templateUrl: './basic-modal.component.html',
  styleUrls: ['./basic-modal.component.css']
})
export class BasicModalComponent extends ModalComponent implements AfterViewInit {

  @ViewChild('modalElm') modalElm: ElementRef;
  @ViewChild('headerElm') headerElm: ElementRef;
  @ViewChild('titleElm') titleElm: ElementRef;
  @ViewChild('bodyElm') bodyElm: ElementRef;
  @ViewChild('messageElm') messageElm: ElementRef;
  @ViewChild('footerElm') footerElm: ElementRef;
  @ViewChild('actionButtonElm') actionButtonElm: ElementRef;
  @ViewChild('closeButtonElm') closeButtonElm: ElementRef;
  message: string;
  constructor(modalService: ModalService, private renderer: Renderer2, private storage: StorageService) {
    super(modalService);
  }

  ngAfterViewInit() {
    if (this.modalAddClass !== undefined && this.modalAddClass !== '') {
      // this.renderer.setElementClass(this.modalElm.nativeElement, this.modalAddClass, true);
      this.renderer.addClass(this.modalElm.nativeElement, this.modalAddClass);
    }
    if (this.headerAddClass !== undefined && this.headerAddClass !== '') {
      // this.renderer.setElementClass(this.headerElm.nativeElement, this.headerAddClass, true);
      this.renderer.addClass(this.headerElm.nativeElement, this.headerAddClass);
    }
    if (this.titleAddClass !== undefined && this.titleAddClass !== '') {
      // this.renderer.setElementClass(this.titleElm.nativeElement, this.titleAddClass, true);
      this.renderer.addClass(this.titleElm.nativeElement, this.titleAddClass);
    }
    if (this.bodyAddClass !== undefined && this.bodyAddClass !== '') {
      // this.renderer.setElementClass(this.bodyElm.nativeElement, this.bodyAddClass, true);
      this.renderer.addClass(this.bodyElm.nativeElement, this.bodyAddClass);
    }
    if (this.messageAddClass !== undefined && this.messageAddClass !== '') {
      // this.renderer.setElementClass(this.messageElm.nativeElement, this.messageAddClass, true);
      this.renderer.addClass(this.messageElm.nativeElement, this.messageAddClass);
    }
    if (this.footerAddClass !== undefined && this.footerAddClass !== '') {
      // this.renderer.setElementClass(this.footerElm.nativeElement, this.footerAddClass, true);
      this.renderer.addClass(this.footerElm.nativeElement, this.footerAddClass);
    }
    if (this.actionButtonAddClass !== undefined && this.actionButtonAddClass !== '') {
      // this.renderer.setElementClass(this.actionButtonElm.nativeElement, this.actionButtonAddClass, true);
      this.renderer.addClass(this.actionButtonElm.nativeElement, this.actionButtonAddClass);
    }
    if (this.closeButtonAddClass !== undefined && this.closeButtonAddClass !== '') {
      // this.renderer.setElementClass(this.closeButtonElm.nativeElement, this.closeButtonAddClass, true);
      this.renderer.addClass(this.closeButtonElm.nativeElement, this.closeButtonAddClass);
    }

  }

  protected action() {
    this.result = true;
    this.modalResult();
  }

  close() {
    this.result = false;
    this.storage.removeLatestModalId();
    this.modalResult();
  }

}
