import { Component, OnInit, ViewChildren, ElementRef, QueryList, Renderer2, OnDestroy } from '@angular/core';
import { ModalComponent, ModalService, Modal, SpinnerService, AlertService, Logger, StorageService } from '../../../core';
import { Accounts, PaymentModeListByMain, MemberType, PaymentCapture } from '../../../data';
import { Subscription } from 'rxjs/Subscription';

import { CreditCardComponent } from '../ways/credit-card/credit-card.component';
import { IcCardComponent } from '../ways/ic-card/ic-card.component';
import { CashComponent } from '../ways/cash/cash.component';
import { DirectDebitComponent } from '../ways/direct-debit/direct-debit.component';
import { ReCashComponent } from '../ways/re-cash/re-cash.component';
import { PointComponent } from '../ways/point/point.component';
import { CompletePaymentComponent } from '../complete-payment/complete-payment.component';
import { PaymentService, MessageService } from '../../../service';
import { Cart } from '../../../data/models/order/cart';
import { Utils } from '../../../core/utils';
import { InfoBroker } from '../../../broker';

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
  private point: number;
  private recash: number;
  private paymentModesSubscription: Subscription;
  private paymentSubscription: Subscription;
  private cmplsubscription: Subscription;
  public accountInfo: Accounts;
  private cartInfo: Cart;
  private popupList: Array<number>;
  private paymentComponent: any;
  private paymentModeListByMain: PaymentModeListByMain;
  private paymentcapture: PaymentCapture;
  private paymentModes: Map<string, string>;
  public enableMenu: Array<string>;
  public memberType = MemberType;

  constructor(protected modalService: ModalService,
    private paymentService: PaymentService,
    private modal: Modal,
    private alert: AlertService,
    private spinner: SpinnerService,
    private storage: StorageService,
    private logger: Logger,
    private info: InfoBroker,
    private message: MessageService,
    private renderer: Renderer2) {
    super(modalService);
    this.init();
  }

  ngOnInit() {
    this.accountInfo = this.callerData.accountInfo;
    this.cartInfo = this.callerData.cartInfo;
    if (this.callerData.paymentCapture) {
      this.paymentcapture = this.callerData.paymentCapture;
    }
    if (this.accountInfo && this.accountInfo.balance) {
      this.point = this.accountInfo.balance[0].amount;
      this.recash = this.accountInfo.balance[1].amount;
    }
    this.logger.set('complex.payment.component', Utils.stringify(this.paymentcapture)).debug();
    this.cmplsubscription = this.info.getInfo().subscribe(
      result => {
        if (result !== null && result.type === 'orderClear' && result.data === 'clear') { // 복합결제 완료되면 복합결제 팝업 닫기
          this.close();
        }
      }
    );

    this.getPaymentModesByMain(this.cartInfo.user.uid, this.cartInfo.code);
    this.popupList.push(0);
  }

  init() {
    this.storage.removePaymentModeCode(); // 주결제 수단 세션 정보 초기화
    this.storage.removePay(); // 복합결제 남은 금액 정보 초기화
    this.popupList = new Array<number>();
    this.enableMenu = new Array<string>();
    this.paymentcapture = new PaymentCapture();
    this.paymentModes = new Map<string, string>();
  }

  ngOnDestroy() {
    if (this.paymentSubscription) { this.paymentSubscription.unsubscribe(); }
    if (this.cmplsubscription) { this.cmplsubscription.unsubscribe(); }
    if (this.paymentModesSubscription) { this.paymentModesSubscription.unsubscribe(); }
  }

  creditCard(evt: any) { // creditcard
    this.setSelected(evt, 0, 'creditcard');
    if (this.enableMenu.indexOf('creditcard') > -1) {
      this.selectPopup('CreditCardComponent', CreditCardComponent, null, 'creditcard');
    }
  }

  icCard(evt: any) { // cashiccard
    this.setSelected(evt, 1, 'cashiccard');
    if (this.enableMenu.indexOf('cashiccard') > -1) {
      this.selectPopup('IcCardComponent', IcCardComponent, null, 'cashiccard');
    }
  }

  /**
   * 포인트 결제 : 주결제 수단 아님
   * @param evt 이벤트
   */
  amwayPoint(evt: any) { // point
    // this.setSelected(evt, 2, 'point');
    if (this.point <= 0) {
      this.alert.show({ message: this.message.get('no.point', this.accountInfo.parties[0].name) });
      return;
    }
    if (this.enableMenu.indexOf('point') > -1) {
      // sprint 6차로 주석처리
      this.selectPopup('APointComponent_Cplx', PointComponent, 'a', null);
    }
  }

  /**
   * 포인트 결제 : 주결제 수단 아님
   * @param evt 이벤트
   */
  memberPoint(evt: any) { // point
    // this.setSelected(evt, 3, 'point');
    if (this.point <= 0) {
      this.alert.show({ message: this.message.get('no.point', this.accountInfo.parties[0].name) });
      return;
    }
    if (this.enableMenu.indexOf('point') > -1) {
      // sprint 6차로 주석처리
      this.selectPopup('MPointComponent_Cplx', PointComponent, 'm', null);
    }
  }

  cashPayment(evt: any) { // cash
    this.setSelected(evt, 4, 'cash');
    if (this.enableMenu.indexOf('cash') > -1) {
      this.selectPopup('CashComponent_Cplx', CashComponent, null, 'cash');
    }
  }

  /**
   * 수표 결제(cash 에 CashType 만 CHECK)
   * @param evt 이벤트
   */
  checkPayment(evt: any) { // cheque
    this.setSelected(evt, 5, 'cheque');
    if (this.enableMenu.indexOf('cheque') > -1) {
      this.selectPopup('ChequeComponent_Cplx', CashComponent, null, 'cheque');
    }
  }

  directDebitPayment(evt: any) { // directdebit
    this.setSelected(evt, 6, 'directdebit');
    if (this.enableMenu.indexOf('directdebit') > -1) {
      this.selectPopup('DirectDebitComponent_Cplx', DirectDebitComponent, null, 'directdebit');
    }
  }

  reCashPayment(evt: any) { // arCredit
    if (this.recash <= 0) {
      this.alert.show({ message: this.message.get('no.recash', this.accountInfo.parties[0].name) });
      return;
    }
    this.setSelected(evt, 7, 'arCredit');
    if (this.enableMenu.indexOf('arCredit') > -1) {
      this.selectPopup('ReCashComponent_Cplx', ReCashComponent, null, 'arCredit');
    }
  }

  openPopup() {
    this.popupList.sort();
    this.modal.openModalByComponent(CompletePaymentComponent, {
      callerData: { accountInfo: this.accountInfo, cartInfo: this.cartInfo },
      closeByClickOutside: false,
      modalId: 'CompletePaymentComponent',
      paymentType: 'c'
    });
  }

  /**
   * 컴포넌트 모달 팝업 호출
   *
   * @param modalId 모달 아이디
   * @param component 컴포넌트
   * @param pointtype 포인트 유형(ABO, MEMBER)
   * @param payment 주결제 수단 조회 키값(Place Order 시에 주결제 수단을 PaymentMode에 설정)
   */
  selectPopup(modalId: string, component: any, pointtype?: string, payment?: string) {
    this.paymentComponent = component;
    if (payment && !this.storage.getPaymentModeCode()) {
      if (this.paymentModes.has(payment)) { // 주결제 수단일 경우 선택 시 주결제 수단을 세션에 설정
        this.logger.set('complex.payment.component', `주결재 수단 설정 : ${payment}`).debug();
        this.storage.setPaymentModeCode(payment); // 주결제 수단을 세션에 설정
      } else {
        this.logger.set('complex.payment.component', `${payment} 은(는) 주결제 수단이 아닙니다.}`).warn();
      }
    }

    // 선택한 메뉴에 대해서는 다시 선택 못하도록 disable 처리
    if (payment) {
      this.enableMenu = this.enableMenu.filter(item => item !== payment);
    }

    this.modal.openModalByComponent(this.paymentComponent, {
      callerData: { accountInfo: this.accountInfo, cartInfo: this.cartInfo, paymentCapture: this.paymentcapture },
      closeByClickOutside: false,
      modalId: modalId,
      pointType: pointtype,
      paymentType: 'c'
    }).subscribe(payments => {
      if (payments) {
        this.remakePaymentCapture(payments);
      } else {
        this.enableMenu.push(payment); // 그냥 취소했을 경우는 다시 메뉴선택가능하도록 원복
      }
    });
  }

  private remakePaymentCapture(paymentcapture: PaymentCapture) {
    if (paymentcapture) {
      this.logger.set('complex.payment.component params for remake', `${Utils.stringify(paymentcapture)}`).debug();
      if (paymentcapture.ccPaymentInfo) {
        this.paymentcapture.ccPaymentInfo = paymentcapture.ccPaymentInfo;
      }
      if (paymentcapture.cashPaymentInfo) {
        this.paymentcapture.cashPaymentInfo = paymentcapture.cashPaymentInfo;
      }
      if (paymentcapture.directDebitPaymentInfo) {
        this.paymentcapture.directDebitPaymentInfo = paymentcapture.directDebitPaymentInfo;
      }
      if (paymentcapture.icCardPaymentInfo) {
        this.paymentcapture.icCardPaymentInfo = paymentcapture.icCardPaymentInfo;
      }
      if (paymentcapture.monetaryPaymentInfo) {
        this.paymentcapture.monetaryPaymentInfo = paymentcapture.monetaryPaymentInfo;
      }
      if (paymentcapture.pointPaymentInfo) {
        this.paymentcapture.pointPaymentInfo = paymentcapture.pointPaymentInfo;
      }
      if (paymentcapture.voucherPaymentInfo) {
        // this.paymentcapture.voucherPaymentInfo = paymentcapture.voucherPaymentInfo;
        this.logger.set('complex.payment.component', 'no apply voucherPaymentInfo').info();
      }
    }
    this.logger.set('complex.payment.component convert for remake', `${Utils.stringify(this.paymentcapture)}`).debug();
  }

  /**
   * 쿠폰결제 시 메뉴 메뉴활성화
   */
  private setCouponEnabler() {
    if (this.paymentcapture.voucherPaymentInfo) {
      this.setEnableMenu('creditvoucher');
    }
  }

  /**
   * ABO
   *  creditcard
   *  cash
   *  cashiccard
   *  directdebit
   *  cheque
   *  creditvoucher
   *
   * MEMBER
   *  creditcard
   *  cash
   *  point
   *  cheque
   *
   * CUSTOMER
   *  creditcard
   *  cash
   *
   * @param userId
   * @param cartId
   */
  private getPaymentModesByMain(userId: string, cartId: string): void {
    this.spinner.show();
    this.paymentModesSubscription = this.paymentService.getPaymentModesByMain(userId, cartId).subscribe(
      result => {
        if (result) {
          this.paymentModeListByMain = result;

          this.setCouponEnabler(); // 쿠폰결제 하고 들어오면 활성화할 메뉴 체크.

          this.paymentModeListByMain.paymentModes.forEach(paymentmode => {
            this.paymentModes.set(paymentmode.code.substring(paymentmode.code.lastIndexOf('-') + 1), paymentmode.code.substring(paymentmode.code.lastIndexOf('-') + 1));
          });
          // this.logger.set('complex.payment.component', `cash : ${this.paymentModes.get('cash')}`).debug();
          this.paymentModes.forEach((data, key) => {
            this.logger.set('complex.payment.component', `>>> 주결제 수단 : ${key} --> ${data}`).debug();
          });
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
