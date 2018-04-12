import { SearchAccountComponent } from './../../modals/account/search-account/search-account.component';
import { PickupOrderComponent } from './../../modals/order/pickup-order/pickup-order.component';
import { Component, OnInit, Renderer2, ElementRef, ViewChildren, QueryList } from '@angular/core';
import { Modal } from '../../service/pos';
import { NormalPaymentComponent } from '../../modals/payment/normal-payment/normal-payment.component';
import { ComplexPaymentComponent } from './../../modals/payment/complex-payment/complex-payment.component';

@Component({
  selector: 'pos-order-menu',
  templateUrl: './order-menu.component.html'
})
export class OrderMenuComponent implements OnInit {

  @ViewChildren('menus') menus: QueryList<ElementRef>;
  constructor(private modal: Modal, private element: ElementRef, private renderer: Renderer2) { }

  ngOnInit() {
  }

  /**
   * 일반 결제 팝업
   *
   * @param evt
   */
  normalPayment(evt: any) {
    this.checkClass(evt);
    this.modal.openModalByComponent(NormalPaymentComponent,
      {
        title: '',
        actionButtonLabel: '',
        closeButtonLabel: '',
        closeByEnter: false,
        closeByEscape: true,
        closeByClickOutside: false,
        closeAllDialogs: false
      }
    );
  }

  /**
   * 복합 결제 팝업
   * @param evt
   */
  complexPayment(evt: any) {
    this.checkClass(evt);
    this.modal.openModalByComponent(ComplexPaymentComponent,
      {
        title: '',
        actionButtonLabel: '',
        closeButtonLabel: '',
        closeByEnter: false,
        closeByEscape: true,
        closeByClickOutside: false,
        closeAllDialogs: false
      }
    );
  }

  /**
   * 그룹 결제 사용자 검색 팝업
   * parameter 로 actionType을 넘겨서 그룹 결제일 경우 활용하도록 함.
   *
   * @param evt
   */
  groupPayment(evt: any) {
    this.checkClass(evt);
    this.modal.openModalByComponent(SearchAccountComponent,
      {
        title: '',
        actionButtonLabel: '',
        closeButtonLabel: '',
        closeByEnter: false,
        closeByEscape: true,
        closeByClickOutside: false,
        closeAllDialogs: false,
        actionType: 'g'
      }
    );
  }

  /**
   * 픽업 오더 팝업
   *
   * @param evt
   */
  pickupOrder(evt: any) {
    this.checkClass(evt);
    this.modal.openModalByComponent(PickupOrderComponent,
      {
        title: '',
        actionButtonLabel: '',
        closeButtonLabel: '',
        closeByEnter: false,
        closeByEscape: true,
        closeByClickOutside: false,
        closeAllDialogs: false
      }
    );
  }

  /**
   * 구매 취소
   *
   * @param evt
   */
  cancelOrder(evt: any) {
    this.checkClass(evt);
  }

  promotionProduct(evt: any) {
    this.checkPromotionClass(evt);
  }

  etcProcess(evt: any) {
    this.checkClass(evt);
  }

  private checkClass(evt: any) {
    evt.stopPropagation();
    this.menus.forEach(menu => {
      this.renderer.removeClass(menu.nativeElement, 'blue');
      this.renderer.removeClass(menu.nativeElement, 'on');
    });
    this.renderer.addClass(evt.target, 'blue');
    this.renderer.addClass(evt.target, 'on');
  }

  private checkPromotionClass(evt: any) {
    evt.stopPropagation();
    this.menus.forEach(menu => {
      this.renderer.removeClass(menu.nativeElement, 'blue');
      this.renderer.removeClass(menu.nativeElement, 'on');
    });
    this.renderer.addClass(evt.target, 'on');
  }

}
