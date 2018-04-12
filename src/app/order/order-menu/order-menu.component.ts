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
        closeAllDialogs: false
      }
    );
  }

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
