import { Component, OnInit } from '@angular/core';
import { ModalComponent } from '../../../core/modal/modal.component';
import { ModalService } from '../../../service/pos';
import { FocusBlurDirective } from '../../../core/modal/focus-blur.directive';

@Component({
  selector: 'pos-normal-payment',
  templateUrl: './normal-payment.component.html'
})
export class NormalPaymentComponent extends ModalComponent  implements OnInit {

  constructor(protected modalService: ModalService) {
    super(modalService);
  }

  ngOnInit() {
  }

  close() {
    this.closeModal();
  }

}
