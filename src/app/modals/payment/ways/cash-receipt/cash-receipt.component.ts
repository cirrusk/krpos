import { Component, OnInit } from '@angular/core';
import { ModalComponent, ModalService } from '../../../../core';

@Component({
  selector: 'pos-cash-receipt',
  templateUrl: './cash-receipt.component.html'
})
export class CashReceiptComponent extends ModalComponent  implements OnInit {
  constructor(protected modalService: ModalService) {
    super(modalService);
  }

  ngOnInit() {
  }

  close() {
    this.closeModal();
  }
}
