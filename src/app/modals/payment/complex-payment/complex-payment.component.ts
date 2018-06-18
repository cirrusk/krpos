import { Component, OnInit, ViewChildren, ElementRef, QueryList, Renderer2, OnDestroy } from '@angular/core';
import { ModalComponent, ModalService, Modal } from '../../../core';
import { OrderEntry, Accounts } from '../../../data';
import { Subscription } from 'rxjs/Subscription';

import { CreditCardComponent } from '../ways/credit-card/credit-card.component';
import { IcCardComponent } from '../ways/ic-card/ic-card.component';
import { CashComponent } from '../ways/cash/cash.component';
import { DirectDebitComponent } from '../ways/direct-debit/direct-debit.component';
import { ChecksComponent } from '../ways/checks/checks.component';
import { ReCashComponent } from '../ways/re-cash/re-cash.component';
import { CouponComponent } from '../ways/coupon/coupon.component';
import { PointComponent } from '../ways/point/point.component';

@Component({
  selector: 'pos-complex-payment',
  templateUrl: './complex-payment.component.html'
})
export class ComplexPaymentComponent extends ModalComponent implements OnInit, OnDestroy {
  @ViewChildren('paytypes') paytypes: QueryList<ElementRef>;

  private PAYMENT_LIST = [[0, 'CreditCardComponent', CreditCardComponent],
                          [1, 'IcCardComponent', IcCardComponent],
                          [2, 'PointComponent', PointComponent],
                          [3, 'PointComponent', PointComponent],
                          [4, 'CashComponent', CashComponent],
                          [5, 'CashComponent', CashComponent],
                          [6, 'DirectDebitComponent', DirectDebitComponent],
                          [7, 'ReCashComponent', ReCashComponent]];

  private accountInfo: Accounts;
  private cartList: Array<OrderEntry>;
  private popupList: Array<number>;
  private activePopup: Array<number>;
  private paymentComponent: any;
  private paymentSubscription: Subscription;
  constructor(protected modalService: ModalService,
              private modal: Modal,
              private renderer: Renderer2) {
    super(modalService);
    this.popupList = new Array<number>();
  }

  ngOnInit() {
    this.accountInfo = this.callerData.accountInfo;
    this.cartList = this.callerData.cartList;
    this.popupList.push(0);
  }

  ngOnDestroy() {
    if (this.paymentSubscription) { this.paymentSubscription.unsubscribe(); }
  }


  creditCard(evt: any) {
    this.setSelected(evt, 0);
  }

  icCard(evt: any) {
    this.setSelected(evt, 1);
  }

  amwayPoint(evt: any) {
    this.setSelected(evt, 2);
  }

  memberPoint(evt: any) {
    this.setSelected(evt, 3);
  }

  cashPayment(evt: any) {
    this.setSelected(evt, 4);
  }

  checkPayment(evt: any) {
    this.setSelected(evt, 5);
  }

  directDebitPayment(evt: any) {
    this.setSelected(evt, 6);
  }

  reCashPayment(evt: any) {
    this.setSelected(evt, 7);
  }

  couponPayment(evt: any) {
    // this.setSelected(evt);
  }

  openPopup() {
    this.popupList.sort();
    this.activePopup = this.popupList.slice(0, this.popupList.length);
    this.selectPopup(this.activePopup[0]);
  }

  /**
   * 팝업 실행
   * @param num
   */
  selectPopup(num: number) {
    if (this.activePopup.length > 0) {
      this.paymentComponent =  this.PAYMENT_LIST[num][2];
      this.paymentSubscription = this.modal.openModalByComponent(this.paymentComponent,
        {
          title: '',
          actionButtonLabel: '',
          closeButtonLabel: '',
          closeByClickOutside: false,
          modalId: this.PAYMENT_LIST[num][1]
        }
      ).subscribe(
        result => {
          const index = this.activePopup.indexOf(num);
          this.activePopup.splice(index, 1);
          this.selectPopup(this.activePopup[0]);
        }
      );
    }
  }

  close() {
    this.closeModal();
  }

  /**
   * Add On
   * @param evt
   * @param num
   */
  private setSelected(evt: any, num: number) {
    evt.stopPropagation();
    const chk = evt.target.classList.contains('on');
    const parent = this.renderer.parentNode(evt.target);
    if (chk) {
      const index = this.popupList.indexOf(num);
      this.popupList.splice(index, 1);
      this.renderer.removeClass(parent, 'on');
      this.renderer.removeClass(evt.target, 'on');
    } else {
      this.popupList.push(num);
      this.renderer.addClass(parent, 'on');
      this.renderer.addClass(evt.target, 'on');
    }
  }
}
