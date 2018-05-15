import { Component, OnInit } from '@angular/core';
import { ModalComponent, ModalService } from '../../../core';

@Component({
  selector: 'pos-rfid',
  templateUrl: './rfid.component.html'
})
export class RfidComponent extends ModalComponent implements OnInit {

  constructor(protected modalService: ModalService) {
    super(modalService);
  }

  ngOnInit() {
  }

  close() {
    this.closeModal();
  }

}
