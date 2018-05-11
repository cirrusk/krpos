import { Component, OnInit } from '@angular/core';
import { ModalComponent, ModalService } from '../../../core';

@Component({
  selector: 'pos-serial',
  templateUrl: './serial.component.html'
})
export class SerialComponent extends ModalComponent implements OnInit {

  constructor(protected modalService: ModalService) {
    super(modalService);
  }

  ngOnInit() {
  }

  close() {
    this.closeModal();
  }

}
