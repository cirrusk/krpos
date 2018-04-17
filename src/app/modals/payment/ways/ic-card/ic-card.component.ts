import { Component, OnInit } from '@angular/core';

import { ModalComponent } from '../../../../core/modal/modal.component';
import { ModalService } from '../../../../service/pos';
import { FocusBlurDirective } from '../../../../core/modal/focus-blur.directive';

@Component({
  selector: 'pos-ic-card',
  templateUrl: './ic-card.component.html'
})
export class IcCardComponent extends ModalComponent implements OnInit {

  constructor(protected modalService: ModalService) {
    super(modalService);
  }

  ngOnInit() {
  }

  close() {
    this.closeModal();
  }

}
