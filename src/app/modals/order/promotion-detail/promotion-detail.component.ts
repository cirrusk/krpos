import { Component, OnInit } from '@angular/core';
import { ModalComponent, ModalService } from '../../../core';
import { PromotionList } from '../../../data';

@Component({
  selector: 'pos-promotion-detail',
  templateUrl: './promotion-detail.component.html'
})
export class PromotionDetailComponent extends ModalComponent implements OnInit {
  promotions: PromotionList[];
  constructor(protected modalService: ModalService) {
    super(modalService);
   }

  ngOnInit() {
    this.promotions = this.callerData.promotionList;
  }

  /**
   * @ignore
   */
  close() {
    this.closeModal();
  }

}
