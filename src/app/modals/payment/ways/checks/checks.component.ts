import { Component, OnInit } from '@angular/core';

import { ModalComponent } from '../../../../core/modal/modal.component';
import { ModalService } from '../../../../service/pos';
import { FocusBlurDirective } from '../../../../core/modal/focus-blur.directive';

@Component({
  selector: 'pos-checks',
  templateUrl: './checks.component.html'
})
export class ChecksComponent extends ModalComponent implements OnInit {

  constructor(protected modalService: ModalService) {
    super(modalService);
  }

  ngOnInit() {
  }

  close() {
    this.closeModal();
  }

}
