import { Component, OnInit } from '@angular/core';
import { ModalComponent, ModalService, Modal } from '../../../core';

@Component({
  selector: 'pos-restrict',
  templateUrl: './restrict.component.html'
})
export class RestrictComponent extends ModalComponent implements OnInit {

  constructor(protected modalService: ModalService) {
    super(modalService);
  }

  ngOnInit() {
  }

  prev() {

  }

  next() {

  }

  close() {
    this.closeModal();
  }
}
