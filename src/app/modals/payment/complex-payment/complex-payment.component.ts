import { Component, OnInit, ViewChildren, ElementRef, QueryList, Renderer2, OnDestroy } from '@angular/core';
import { ModalComponent, ModalService, Modal, SpinnerService, Logger, AlertService } from '../../../core';
import { Accounts, PaymentModeListByMain, MemberType } from '../../../data';
import { Subscription } from 'rxjs/Subscription';

import { CreditCardComponent } from '../ways/credit-card/credit-card.component';
import { IcCardComponent } from '../ways/ic-card/ic-card.component';
import { CashComponent } from '../ways/cash/cash.component';
import { DirectDebitComponent } from '../ways/direct-debit/direct-debit.component';
import { ChecksComponent } from '../ways/checks/checks.component';
import { ReCashComponent } from '../ways/re-cash/re-cash.component';
import { CouponComponent } from '../ways/coupon/coupon.component';
import { PointComponent } from '../ways/point/point.component';
import { CompletePaymentComponent } from '../complete-payment/complete-payment.component';
import { PaymentService } from '../../../service';
import { Cart } from '../../../data/models/order/cart';
import { Utils } from '../../../core/utils';


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
  private paymentModesSubscription: Subscription;
  private paymentSubscription: Subscription;

  accountInfo: Accounts;
  private cartInfo: Cart;
  private popupList: Array<number>;
  private activePopup: Array<number>;
  private paymentComponent: any;
  private paymentModeListByMain: PaymentModeListByMain;
  enableMenu: Array<string>;
  public memberType = MemberType;

  constructor(protected modalService: ModalService,
              private paymentService: PaymentService,
              private modal: Modal,
              private alert: AlertService,
              private spinner: SpinnerService,
              private logger: Logger,
              private renderer: Renderer2) {
    super(modalService);
    this.init();
  }

  ngOnInit() {
    this.accountInfo = this.callerData.accountInfo;
    this.cartInfo = this.callerData.cartInfo;
    this.getPaymentModesByMain(this.cartInfo.user.uid, this.cartInfo.code);
    this.popupList.push(0);
  }

  init() {
    this.popupList = new Array<number>();
    this.enableMenu = new Array<string>();
  }

  ngOnDestroy() {
    if (this.paymentSubscription) { this.paymentSubscription.unsubscribe(); }
  }


  creditCard(evt: any) {
    // creditcard
    this.setSelected(evt, 0, 'creditcard');
    if (this.enableMenu.indexOf('creditcard') > -1) {
      this.selectPopup('CreditCardComponent', CreditCardComponent);
    }
  }

  icCard(evt: any) {
    // cashiccard
    this.setSelected(evt, 1, 'cashiccard');
    if (this.enableMenu.indexOf('cashiccard') > -1) {
      this.selectPopup('IcCardComponent', IcCardComponent);
    }
  }

  amwayPoint(evt: any) {
    // point
    // this.setSelected(evt, 2, 'point');
    if (this.enableMenu.indexOf('point') > -1) {
      // sprint 6차로 주석처리
      // this.selectPopup('APointComponent', PointComponent);
    }
  }

  memberPoint(evt: any) {
    // point
    // this.setSelected(evt, 3, 'point');
    if (this.enableMenu.indexOf('point') > -1) {
      // sprint 6차로 주석처리
      // this.selectPopup('MPointComponent', PointComponent);
    }
  }

  cashPayment(evt: any) {
    // cash
    this.setSelected(evt, 4, 'cash');
    if (this.enableMenu.indexOf('cash') > -1) {
      this.selectPopup('CashComponent', CashComponent);
    }
  }

  checkPayment(evt: any) {
    // cheque
    this.setSelected(evt, 5, 'cheque');
    if (this.enableMenu.indexOf('cheque') > -1) {
      this.selectPopup('ChequeComponent', CashComponent);
    }
  }

  directDebitPayment(evt: any) {
    // directdebit
    this.setSelected(evt, 6, 'directdebit');
    if (this.enableMenu.indexOf('directdebit') > -1) {
      this.selectPopup('DirectDebitComponent', DirectDebitComponent);
    }
  }

  reCashPayment(evt: any) {
    // arCredit
    this.setSelected(evt, 7, 'arCredit');
    if (this.enableMenu.indexOf('arCredit') > -1) {
      this.selectPopup('ReCashComponent', ReCashComponent);
    }
  }

  couponPayment(evt: any) {
    // creditcard
    // this.setSelected(evt);
  }

  openPopup() {
    this.popupList.sort();
    this.modal.openModalByComponent(CompletePaymentComponent,
      {
        callerData: { accountInfo: this.accountInfo, cartInfo: this.cartInfo },
        closeByClickOutside: false,
        modalId: 'CompletePaymentComponent',
        paymentType: 'c'
      }
    );
    // this.activePopup = this.popupList.slice(0, this.popupList.length);
    // this.selectPopup(this.activePopup[0]);
  }

  /**
   * 팝업 실행
   * @param num
   */
  // selectPopup(num: number) {
  selectPopup(modalId: string, component: any) {
    // if (this.activePopup.length > 0) {
      this.paymentComponent =  component;
      // this.paymentSubscription =
      this.modal.openModalByComponent(this.paymentComponent,
        {
          callerData: { accountInfo: this.accountInfo, cartInfo: this.cartInfo },
          closeByClickOutside: false,
          modalId: modalId,
          paymentType: 'c'
        }
      );
      // .subscribe(
      //   result => {
      //     const index = this.activePopup.indexOf(num);
      //     this.activePopup.splice(index, 1);
      //     this.selectPopup(this.activePopup[0]);
      //   }
      // );
    // }
  }

  getPaymentModesByMain(userId: string, cartId: string): void {
    this.spinner.show();
    this.paymentModesSubscription = this.paymentService.getPaymentModesByMain(userId, cartId).subscribe(
      result => {
        if (result) {
          this.paymentModeListByMain = result;
        }
      },
      error => {
        this.spinner.hide();
        const errdata = Utils.getError(error);
        if (errdata) {
          this.alert.error({ message: `${errdata.message}` });
        }
      },
      () => { this.spinner.hide(); }
    );
  }

  close() {
    this.closeModal();
  }

  /**
   * Add On
   * @param evt
   * @param num
   */
  private setSelected(evt: any, num: number, type: string) {
    evt.stopPropagation();
    if (this.enableMenu.length === 0) {
      const chk = evt.target.classList.contains('on');
      const parent = this.renderer.parentNode(evt.target);
      if (chk) {
        const index = this.popupList.indexOf(num);
        this.popupList.splice(index, 1);
        this.renderer.removeClass(parent, 'on');
        this.renderer.removeClass(evt.target, 'on');
      } else {
        this.popupList.push(num);

        if (this.enableMenu.length < 1) {
          this.setEnableMenu(type);
        }

        this.renderer.addClass(parent, 'on');
        this.renderer.addClass(evt.target, 'on');
      }
    }
  }

  setEnableMenu(type: string) {
    const existedIdx: number = this.paymentModeListByMain.paymentModes.findIndex(
      function (obj) {
        return obj.code.substring(obj.code.lastIndexOf('-') + 1) === type;
      }
    );

    this.paymentModeListByMain.paymentModes[existedIdx].paymentModes.forEach(paymentType => {
      this.enableMenu.push(paymentType.code);
    });
  }
}
