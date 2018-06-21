import { Component, OnInit } from '@angular/core';
import { ModalComponent, ModalService } from '../../../core';

@Component({
  selector: 'pos-complete-payment',
  templateUrl: './complete-payment.component.html'
})
export class CompletePaymentComponent extends ModalComponent implements OnInit {

  constructor(protected modalService: ModalService) {
    super(modalService);
  }

  ngOnInit() {
  }

  close() {
    this.closeModal();
  }
}
