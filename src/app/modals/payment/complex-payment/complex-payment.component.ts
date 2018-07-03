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
import { PaymentService } from '../../../service';
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
  private paymentModesSubscription: Subscription;
  private paymentSubscription: Subscription;
  private cmplsubscription: Subscription;
  public accountInfo: Accounts;
  private cartInfo: Cart;
  private popupList: Array<number>;
  private activePopup: Array<number>;
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
    private renderer: Renderer2) {
    super(modalService);
    this.init();
  }

  // 주결제 수단
  // "code": "pos-bn1-ap-pickup-cash",
  // "code": "pos-bn1-ap-pickup-cashiccard",
  // "code": "pos-bn1-ap-pickup-cheque",
  // "code": "pos-bn1-ap-pickup-directdebit",
  // "code": "pos-bn1-ap-pickup-arCredit",
  // "code": "pos-bn1-ap-pickup-creditcard",

  ngOnInit() {
    this.accountInfo = this.callerData.accountInfo;
    this.cartInfo = this.callerData.cartInfo;
    if (this.callerData.paymentCapture) {
      this.paymentcapture = this.callerData.paymentCapture;
    }

    console.log(JSON.stringify(this.paymentcapture));

    this.cmplsubscription = this.info.getInfo().subscribe(
      result => {
        const type = result && result.type;
        const data = result && result.data;
        if (result !== null && type === 'orderClear' && data === 'clear') { // 복합결제 완료되면 복합결제 팝업 닫기
          this.close();
        } /*else if (result != null && type === 'coupon') {
          this.remakePaymentCapture(data);
        }*/
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

  creditCard(evt: any) {
    // creditcard
    this.setSelected(evt, 0, 'creditcard');
    if (this.enableMenu.indexOf('creditcard') > -1) {
      this.selectPopup('CreditCardComponent', CreditCardComponent, null, 'creditcard');
    }
  }

  icCard(evt: any) {
    // cashiccard
    this.setSelected(evt, 1, 'cashiccard');
    if (this.enableMenu.indexOf('cashiccard') > -1) {
      this.selectPopup('IcCardComponent', IcCardComponent, null, 'cashiccard');
    }
  }

  /**
   * 포인트 결제 : 주결제 수단 아님
   * @param evt 이벤트
   */
  amwayPoint(evt: any) {
    // point
    // this.setSelected(evt, 2, 'point');
    if (this.enableMenu.indexOf('point') > -1) {
      // sprint 6차로 주석처리
      this.selectPopup('APointComponent_Cplx', PointComponent, 'a', null);
    }
  }

  /**
   * 포인트 결제 : 주결제 수단 아님
   * @param evt 이벤트
   */
  memberPoint(evt: any) {
    // point
    // this.setSelected(evt, 3, 'point');
    if (this.enableMenu.indexOf('point') > -1) {
      // sprint 6차로 주석처리
      this.selectPopup('MPointComponent_Cplx', PointComponent, 'm', null);
    }
  }

  cashPayment(evt: any) {
    // cash
    this.setSelected(evt, 4, 'cash');
    if (this.enableMenu.indexOf('cash') > -1) {
      this.selectPopup('CashComponent_Cplx', CashComponent, null, 'cash');
    }
  }

  /**
   * 수표 결제(cash 에 CashType 만 CHECK)
   * @param evt 이벤트
   */
  checkPayment(evt: any) {
    // cheque
    this.setSelected(evt, 5, 'cheque');
    if (this.enableMenu.indexOf('cheque') > -1) {
      this.selectPopup('ChequeComponent_Cplx', CashComponent, null, 'cheque');
    }
  }

  directDebitPayment(evt: any) {
    // directdebit
    this.setSelected(evt, 6, 'directdebit');
    if (this.enableMenu.indexOf('directdebit') > -1) {
      this.selectPopup('DirectDebitComponent_Cplx', DirectDebitComponent, null, 'directdebit');
    }
  }

  reCashPayment(evt: any) {
    // arCredit
    this.setSelected(evt, 7, 'arCredit');
    if (this.enableMenu.indexOf('arCredit') > -1) {
      this.selectPopup('ReCashComponent_Cplx', ReCashComponent, null, 'arCredit');
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
   * 컴포넌트 모달 팝업 호출
   *
   * @param modalId 모달 아이디
   * @param component 컴포넌트
   * @param pointtype 포인트 유형(ABO, MEMBER)
   * @param payment 주결제 수단 조회 키값(Place Order 시에 주결제 수단을 PaymentMode에 설정)
   */
  selectPopup(modalId: string, component: any, pointtype?: string, payment?: string) {
    // if (this.activePopup.length > 0) {
    this.paymentComponent = component;
    if (payment && !this.storage.getPaymentModeCode()) {
      // this.storage.setPaymentModeCode(this.paymentModes.get(payment)); // 주결제 수단을 세션에 설정
      this.storage.setPaymentModeCode(payment); // 주결제 수단을 세션에 설정
    }

    // 선택한 메뉴에 대해서는 다시 선택 못하도록 disable 처리
    if (payment) {
      // this.enableMenu = this.enableMenu.filter(item => item !== payment);
    }

    // this.paymentSubscription =
    this.modal.openModalByComponent(this.paymentComponent,
      {
        callerData: { accountInfo: this.accountInfo, cartInfo: this.cartInfo, paymentCapture: this.paymentcapture },
        closeByClickOutside: false,
        modalId: modalId,
        pointType: pointtype,
        paymentType: 'c'
      }
    ).subscribe(payments => {
      if (payments) {
        this.remakePaymentCapture(payments);
      }
    });
    // .subscribe(
    //   result => {
    //     const index = this.activePopup.indexOf(num);
    //     this.activePopup.splice(index, 1);
    //     this.selectPopup(this.activePopup[0]);
    //   }
    // );
    // }
  }

  private remakePaymentCapture(paymentcapture: PaymentCapture) {
    if (paymentcapture) {
      this.logger.set('compex.payment.component prams', `${JSON.stringify(paymentcapture, null, 2)}`).debug();
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
        this.paymentcapture.voucherPaymentInfo = paymentcapture.voucherPaymentInfo;
      }
    }
    this.logger.set('compex.payment.component convert', `${JSON.stringify(this.paymentcapture, null, 2)}`).debug();
  }

  getPaymentModesByMain(userId: string, cartId: string): void {
    this.spinner.show();
    this.paymentModesSubscription = this.paymentService.getPaymentModesByMain(userId, cartId).subscribe(
      result => {
        if (result) {
          this.paymentModeListByMain = result;
          // this.paymentModeListByMain.paymentModes.forEach(paymentmode => {
          //   this.paymentModes.set(paymentmode.code.substring(paymentmode.code.lastIndexOf('-') + 1), paymentmode.code);
          //   this.paymentModes.set(paymentmode.code.substring(paymentmode.code.lastIndexOf('-') + 1), paymentmode.code);
          // });
          // console.log(this.paymentModes.get('cash'));
          // this.paymentModes.forEach((data, key) => {
          //   console.log(key + ' > ' + data);
          // });
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
