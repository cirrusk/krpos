import { Component, OnInit } from '@angular/core';

import { ModalComponent } from '../../../core/modal/modal.component';
import { ModalService } from '../../../service/pos';
import { Modal } from '../../../core/modal/modal';

@Component({
  selector: 'pos-hold-order',
  templateUrl: './hold-order.component.html'
})
export class HoldOrderComponent extends ModalComponent  implements OnInit {

  constructor(modalService: ModalService) {
    super(modalService);
  }

  ngOnInit() {
  }

  close() {
    this.closeModal();
  }

}
