import { Component, OnInit } from '@angular/core';
import { ModalComponent, ModalService, Modal } from '../../../core';
import Utils from '../../../core/utils';

@Component({
  selector: 'pos-restrict',
  templateUrl: './restrict.component.html'
})
export class RestrictComponent extends ModalComponent implements OnInit {

  constructor(protected modalService: ModalService) {
    super(modalService);
  }

  ngOnInit() {
    console.log('restricted data : ' + Utils.stringify(this.callerData.data));
  }

  prev() {

  }

  next() {

  }

  close() {
    this.closeModal();
  }
}
