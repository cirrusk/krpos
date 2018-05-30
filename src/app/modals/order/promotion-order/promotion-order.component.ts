import { Component, OnInit, ViewChildren, QueryList, ElementRef, Renderer2 } from '@angular/core';
import { ModalComponent, ModalService, Modal } from '../../../core';
import { InfoBroker } from '../../../broker';

@Component({
  selector: 'pos-promotion-order',
  templateUrl: './promotion-order.component.html'
})
export class PromotionOrderComponent extends ModalComponent implements OnInit {

  @ViewChildren('promotions') promotions: QueryList<ElementRef>;
  constructor(protected modalService: ModalService, private renderer: Renderer2, private info: InfoBroker) {
    super(modalService);
  }

  ngOnInit() {
  }

  promotionBasic(evt: any) {
    this.setSelected(evt);
  }

  phytoCafeOrder(evt: any) {
    this.info.sendInfo('pyt', { action: true }); // order 에 이벤트 전송 파이토 유저로 변경
    this.close();
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
      parent = this.renderer.parentNode(promotion.nativeElement);
      this.renderer.removeClass(parent, 'on');
      this.renderer.removeClass(promotion.nativeElement, 'on');
    });
    parent = this.renderer.parentNode(evt.target);
    this.renderer.addClass(parent, 'on');
    this.renderer.addClass(evt.target, 'on');
  }

}
