import { Component, OnInit } from '@angular/core';

import { ModalComponent } from '../../../../core/modal/modal.component';
import { ModalService } from '../../../../service/pos';
import { FocusBlurDirective } from '../../../../core/modal/focus-blur.directive';

@Component({
  selector: 'pos-point',
  templateUrl: './point.component.html'
})
export class PointComponent extends ModalComponent implements OnInit {

  pointType: string;
  pointTypeText: string;
  constructor(protected modalService: ModalService) {
    super(modalService);
  }

  ngOnInit() {
    console.log('----> ' + this.pointType);
    if (this.pointType === 'a') {
      this.pointTypeText = 'A포인트';
    } else {
      this.pointTypeText = 'Member 포인트';
    }
  }

  close() {
    this.closeModal();
  }

}
