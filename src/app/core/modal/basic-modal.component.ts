import { Component, OnInit, AfterViewInit, Renderer, ViewChild, ElementRef } from '@angular/core';

import { ModalComponent } from './modal.component';
import { ModalService } from './modal.service';

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

  constructor(modalService: ModalService, private renderer: Renderer) {
    super(modalService);
  }

  ngAfterViewInit() {
    if (this.modalAddClass !== undefined && this.modalAddClass !== '') {
      this.renderer.setElementClass(this.modalElm.nativeElement, this.modalAddClass, true);
    }
    if (this.headerAddClass !== undefined && this.headerAddClass !== '') {
      this.renderer.setElementClass(this.headerElm.nativeElement, this.headerAddClass, true);
    }
    if (this.titleAddClass !== undefined && this.titleAddClass !== '') {
      this.renderer.setElementClass(this.titleElm.nativeElement, this.titleAddClass, true);
    }
    if (this.bodyAddClass !== undefined && this.bodyAddClass !== '') {
      this.renderer.setElementClass(this.bodyElm.nativeElement, this.bodyAddClass, true);
    }
    if (this.messageAddClass !== undefined && this.messageAddClass !== '') {
      this.renderer.setElementClass(this.messageElm.nativeElement, this.messageAddClass, true);
    }
    if (this.footerAddClass !== undefined && this.footerAddClass !== '') {
      this.renderer.setElementClass(this.footerElm.nativeElement, this.footerAddClass, true);
    }
    if (this.actionButtonAddClass !== undefined && this.actionButtonAddClass !== '') {
      this.renderer.setElementClass(this.actionButtonElm.nativeElement, this.actionButtonAddClass, true);
    }
    if (this.closeButtonAddClass !== undefined && this.closeButtonAddClass !== '') {
      this.renderer.setElementClass(this.closeButtonElm.nativeElement, this.closeButtonAddClass, true);
    }

  }

  protected action() {
    this.result = true;
    this.modalResult();
  }
  protected close() {
    this.result = false;
    this.modalResult();
  }

}
