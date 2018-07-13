import { Component, OnInit } from '@angular/core';
import { ModalComponent } from '../../../core/modal/modal.component';
import { ModalService } from '../../../core';
import { CancleOrderBroker } from '../../../broker';

@Component({
  selector: 'pos-cancel-cart',
  templateUrl: './cancel-cart.component.html'
})
export class CancelCartComponent extends ModalComponent implements OnInit {

  constructor(protected modalService: ModalService,
              private cancleOrderBroker: CancleOrderBroker) {
    super(modalService);
  }

  ngOnInit() {
  }

  cancleOrder() {
    this.cancleOrderBroker.sendInfo('delCart');
    this.close();
  }

  close() {
    this.closeModal();
  }
}
