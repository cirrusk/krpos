import { OnDestroy } from '@angular/core';
import { Component, Input, ElementRef, Renderer2, OnInit } from '@angular/core';

import { PosModalService } from './pos-modal.service';
import * as jquery from 'jquery';


@Component({
  moduleId: module.id,
  selector: 'pos-modal',
  template: `<ng-content></ng-content>`
})
export class PosModalComponent implements OnInit, OnDestroy {
  @Input() id: string;
  @Input() dimClickClose = 'false';
  @Input() escKeyClose = 'true';
  private element: JQuery;
  constructor(private modalService: PosModalService,
              private el: ElementRef,
              private renderer: Renderer2) {
      this.element = $(el.nativeElement);
    }

  ngOnInit() {
    const modal = this;

    // ensure id attribute exists
    if (!this.id) {
        console.error('modal must have an id');
        return;
    }

    // move element to bottom of page (just before </body>) so it can be displayed above everything else
    this.element.appendTo('body');

    // close modal on background click
    if (this.dimClickClose === 'true') {
        console.log(`modal dim click close : ${this.dimClickClose}`);
        this.element.on('click', function (e: any) {
            const target = $(e.target);
            if (!target.closest('.modal-body').length) {
                modal.close();
            }
        });
    }

    // 커스터마이징. ESC close 추가
    // document 전체에 대한 event listener 를 등록한다. (Component 포커스 받으려면 인풋 필드 필요)
    if (this.escKeyClose === 'true') {
        console.log(`modal esc key close : ${this.escKeyClose}`);
        // this.renderer.listenGlobal('document', 'keyup', (evt) => {
        this.renderer.listen('document', 'keyup', (evt) => {
            if (evt.keyCode === 27) {
                modal.close();
            }
        });
    }

    // add self (this modal instance) to the modal service so it's accessible from controllers
    this.modalService.add(this);
  }

  ngOnDestroy() {
    this.modalService.remove(this.id);
    this.element.remove();
 }
    // open modal
    open(): void {
      this.element.show();
      $('body').addClass('modal-open');
  }

  // close modal
  close(): void {
      this.element.hide();
      $('body').removeClass('modal-open');
  }

}
