import { Component, OnInit, ViewChildren, QueryList, ElementRef, Renderer2 } from '@angular/core';
import { ModalComponent } from '../../../core/modal/modal.component';
import { ModalService } from '../../../service/pos';
import { FocusBlurDirective } from '../../../core/modal/focus-blur.directive';

@Component({
  selector: 'pos-promotion-order',
  templateUrl: './promotion-order.component.html'
})
export class PromotionOrderComponent extends ModalComponent implements OnInit {

  @ViewChildren('promotions') promotions: QueryList<ElementRef>;
  constructor(protected modalService: ModalService, private renderer: Renderer2) {
    super(modalService);
  }

  ngOnInit() {
  }

  promotionBasic(evt: any) {
    this.setSelected(evt);
  }

  promotion(evt: any, productcode: string) {
    this.setSelected(evt);
    console.log(`product code : ${productcode}`);
  }

  close() {
    this.closeModal();
  }

  private setSelected(evt: any) {
    evt.stopPropagation();
    this.promotions.forEach(promotion => {
      this.renderer.removeClass(promotion.nativeElement, 'on');
    });
    this.renderer.addClass(evt.target, 'on');
  }

}
