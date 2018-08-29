import { Component, OnInit, ViewChildren, ElementRef, QueryList, Renderer2, OnDestroy, HostListener } from '@angular/core';
import { ModalComponent, ModalService, Modal, AlertService, Logger, StorageService } from '../../../core';
import { Accounts, PaymentModeListByMain, MemberType, PaymentCapture, AmwayExtendedOrdering, KeyCode, ModalIds } from '../../../data';
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

  accountInfo: Accounts;
  enableMenu: Array<string>;
  memberType = MemberType;
  private point: number;
  private recash: number;
  private paymentModesSubscription: Subscription;
  private paymentSubscription: Subscription;
  private cmplsubscription: Subscription;
  private cartInfo: Cart;
  private amwayExtendedOrdering: AmwayExtendedOrdering;
  private popupList: Array<number>;
  private paymentComponent: any;
  private paymentModeListByMain: PaymentModeListByMain;
  private paymentcapture: PaymentCapture;
  private paymentModes: Map<string, string>;
  private custname: string;
  private addPopupType: string;
  @ViewChildren('paytypes') paytypes: QueryList<ElementRef>;
  constructor(protected modalService: ModalService,
    private paymentService: PaymentService,
    private modal: Modal,
    private alert: AlertService,
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
    this.amwayExtendedOrdering = this.callerData.amwayExtendedOrdering;
    if (this.callerData.paymentCapture) {
      this.paymentcapture = this.callerData.paymentCapture;
    }
    this.addPopupType = this.callerData.addPopupType;
    if (this.accountInfo && this.accountInfo.balance) {
      this.point = this.accountInfo.balance[0].amount;
      this.recash = this.accountInfo.balance[1].amount;
    }
    this.logger.set('complex.payment.component', Utils.stringify(this.paymentcapture)).debug();
    this.cmplsubscription = this.info.getInfo().subscribe(
      result => {
        if (result != null) {
          if (result.type === 'orderClear' && result.data === 'clear') { // 복합결제 완료되면 복합결제 팝업 닫기
            this.close();
          } else if (result.type === 'popup') {
            const ptype = result.data;
            this.popupPayment(ptype);
          }
        }
      }
    );

    this.popupList.push(0);
    this.custname = this.accountInfo.accountTypeCode.toUpperCase() === MemberType.ABO ? this.accountInfo.name : this.accountInfo.parties[0].name;
    this.getPaymentModesByMain(this.cartInfo.user.uid, this.cartInfo.code);
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

  reset() {
    this.paymentcapture = null;
    this.storage.removePaymentModeCode();
    this.storage.removePaymentCapture();
    this.storage.removePay();
    this.resetSelected();
  }

  creditCard(evt: any) { // creditcard
    if (this.addPopupType === 'card') {
      this.setSelectedById(this.addPopupType, 0, 'creditcard');
    } else {
      this.setSelected(evt, 0, 'creditcard');
    }
    if (this.enableMenu.indexOf('creditcard') > -1) {
      this.selectPopup(ModalIds.CREDIT, CreditCardComponent, null, 'creditcard');
    }
  }

  icCard(evt: any) { // cashiccard
    if (this.addPopupType === 'ic') {
      this.setSelectedById(this.addPopupType, 1, 'cashiccard');
    } else {
      this.setSelected(evt, 1, 'cashiccard');
    }
    if (this.enableMenu.indexOf('cashiccard') > -1) {
      this.selectPopup(ModalIds.IC, IcCardComponent, null, 'cashiccard');
    }
  }

  /**
   * 포인트 결제 : 주결제 수단 아님
   * @param evt 이벤트
   */
  amwayPoint(evt: any) { // point
    if (this.accountInfo.accountTypeCode === MemberType.ABO) {
      if (this.addPopupType === 'apoint') {
        this.setSelectedById(this.addPopupType, 2, 'point');
      } else {
        this.setSelected(evt, 2, 'point');
      }
      if (this.point <= 0) {
        this.alert.show({ message: this.message.get('no.point', this.custname) });
        return;
      }
      if (this.enableMenu.indexOf('point') > -1) {
        // sprint 6차로 주석처리
        this.selectPopup(ModalIds.POINT, PointComponent, 'a', 'point');
      }
    }
  }

  /**
   * 포인트 결제 : 주결제 수단 아님
   * @param evt 이벤트
   */
  memberPoint(evt: any) { // point
    if (this.accountInfo.accountTypeCode === MemberType.MEMBER) {
      if (this.addPopupType === 'mpoint') {
        this.setSelectedById(this.addPopupType, 3, 'point');
      } else {
        this.setSelected(evt, 3, 'point');
      }
      if (this.point <= 0) {
        this.alert.show({ message: this.message.get('no.point', this.custname) });
        return;
      }
      if (this.enableMenu.indexOf('point') > -1) {
        // sprint 6차로 주석처리
        this.selectPopup(ModalIds.POINT, PointComponent, 'm', 'point');
      }
    }
  }

  /**
   * 현금 결제
   *
   * 키이벤트로 접근시 addPopupType이 넘어옴.
   *
   * @param evt 이벤트
   */
  cashPayment(evt: any) { // cash
    if (this.addPopupType === 'cash') {
      this.setSelectedById(this.addPopupType, 4, 'cash');
    } else {
      this.setSelected(evt, 4, 'cash');
    }
    if (this.enableMenu.indexOf('cash') > -1) {
      this.selectPopup(ModalIds.CASH, CashComponent, null, 'cash');
    }
  }

  /**
   * 수표 결제(cash 에 CashType 만 CHECK)
   * @param evt 이벤트
   */
  checkPayment(evt: any) { // cheque
    const cashmodal = this.storage.getLatestModalId();
    if (cashmodal && cashmodal === ModalIds.CASH) {
      if (this.addPopupType === 'cheque') {
        this.setSelectedById(this.addPopupType, 5, 'cheque');
      } else {
        this.setSelected(evt, 5, 'cheque');
      }
      if (this.enableMenu.indexOf('cheque') > -1) {
        this.selectPopup(ModalIds.CHEQUE, CashComponent, null, 'cheque');
      }
    }
  }

  directDebitPayment(evt: any) { // directdebit
    if (this.addPopupType === 'debit') {
      this.setSelectedById(this.addPopupType, 6, 'directdebit');
    } else {
      this.setSelected(evt, 6, 'directdebit');
    }
    if (this.enableMenu.indexOf('directdebit') > -1) {
      this.selectPopup(ModalIds.DEBIT, DirectDebitComponent, null, 'directdebit');
    }
  }

  reCashPayment(evt: any) { // arCredit
    if (this.recash <= 0) {
      this.alert.show({ message: this.message.get('no.recash', this.custname) });
      return;
    }
    if (this.addPopupType === 'recash') {
      this.setSelectedById(this.addPopupType, 7, 'arCredit');
    } else {
      this.setSelected(evt, 7, 'arCredit');
    }

    if (this.enableMenu.indexOf('arCredit') > -1) {
      this.selectPopup(ModalIds.RECASH, ReCashComponent, null, 'arCredit');
    }
  }

  openPopup() {
    this.popupList.sort();
    this.modal.openModalByComponent(CompletePaymentComponent, {
      callerData: { accountInfo: this.accountInfo, cartInfo: this.cartInfo, amwayExtendedOrdering: this.amwayExtendedOrdering },
      closeByClickOutside: false,
      modalId: ModalIds.COMPLETE,
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
    // if (payment) {
    //   this.enableMenu = this.enableMenu.filter(item => item !== payment);
    // }

    this.modal.openModalByComponent(this.paymentComponent, {
      callerData: { accountInfo: this.accountInfo, cartInfo: this.cartInfo, paymentCapture: this.paymentcapture, amwayExtendedOrdering: this.amwayExtendedOrdering },
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

  /**
   * 각각의 결제 Payment 를 모아서 하나의 Payment Capture 정보를 구성
   *
   * @param paymentcapture 각각의 결제창에서 전달된 Payment Capture 정보
   */
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
      // this.storage.setPaymentCapture(this.paymentcapture);
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
    this.paymentModesSubscription = this.paymentService.getPaymentModesByMain(userId, cartId).subscribe(
      result => {
        if (result) {
          this.paymentModeListByMain = result;
          if (result.paymentModes && result.paymentModes.length > 0) {
            this.setCouponEnabler(); // 쿠폰결제 하고 들어오면 활성화할 메뉴 체크.

            this.paymentModeListByMain.paymentModes.forEach(paymentmode => {
              this.paymentModes.set(paymentmode.code.substring(paymentmode.code.lastIndexOf('-') + 1), paymentmode.code.substring(paymentmode.code.lastIndexOf('-') + 1));
            });
            // this.logger.set('complex.payment.component', `cash : ${this.paymentModes.get('cash')}`).debug();
            // this.paymentModes.forEach((data, key) => {
            //   this.logger.set('complex.payment.component', `>>> 주결제 수단 : ${key} --> ${data}`).debug();
            // });

            // 추가 팝업이 있을경우 처리
            this.popupPayment(this.addPopupType);

          } else {
            this.alert.warn({ message: '결제 수단이 설정되어 있지 않습니다.' });
          }
        }
      },
      error => {
        const errdata = Utils.getError(error);
        if (errdata) {
          this.logger.set('complex.payment.component', `${errdata.message}`).error();
          this.alert.error({ message: this.message.get('server.error', errdata.message) });
        }
      });
  }

  private popupPayment(popupType: string) {
    // 실결제 팝업까지 떠있을 경우는 진행하지 못하도록 함.
    const modalids = this.storage.getAllModalIds();
    if (modalids && modalids.length === 2) {
      return;
    }
    if (popupType) {
      if (popupType === 'card') {
        this.creditCard(event);
      } else if (popupType === 'ic') {
        this.icCard(event);
      } else if (popupType === 'debit') {
        this.directDebitPayment(event);
      } else if (popupType === 'recash') {
        this.reCashPayment(event);
      } else if (popupType === 'cash') {
        this.cashPayment(event);
      } else if (popupType === 'cheque') {
        this.checkPayment(event);
      } else {
        if (popupType.endsWith('point')) {
          if (this.accountInfo.accountTypeCode === MemberType.ABO) {
            this.amwayPoint(event);
          }
          if (this.accountInfo.accountTypeCode === MemberType.MEMBER) {
            this.memberPoint(event);
          }
        }
      }
    }
  }

  close() {
    const p: PaymentCapture = this.storage.getPaymentCapture();
    if (p) {
      if (p.ccPaymentInfo || p.icCardPaymentInfo) {
        if (p.ccPaymentInfo) {
          this.alert.warn({ message: '신용카드 결제가 완료되었습니다.<br>잔여 금액을 결제해주세요.', timer: true, interval: 1800 });
        } else if (p.icCardPaymentInfo) {
          this.alert.warn({ message: '현금IC카드 결제가 완료되었습니다.<br>잔여 금액을 결제해주세요.', timer: true, interval: 1800 });
        }
        return;
      } else if (p.cashPaymentInfo
        || p.directDebitPaymentInfo
        || p.monetaryPaymentInfo
        || p.pointPaymentInfo) {
          this.alert.warn({ message: '결제 등록 내역이 초기화됩니다.', timer: true, interval: 1600 });
          setTimeout(() => { this.closeModal(); }, 1610);
          return;
      }
    }
    this.closeModal();
  }

  /**
   * Add On
   * @param evt
   * @param num
   */
  private setSelected(evt: any, num: number, type: string) {
    evt.stopPropagation();
    if (this.paymentModeListByMain.paymentModes && this.paymentModeListByMain.paymentModes.length > 0) {
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
    } else {
      this.alert.warn({ message: '결제 수단이 설정되어 있지 않습니다.' });
    }
  }

  private setSelectedById(id: string, num: number, type: string) {
    const $this = this.paytypes.find(menu => menu.nativeElement.getAttribute('id') === id).nativeElement;
    if (this.paymentModeListByMain.paymentModes && this.paymentModeListByMain.paymentModes.length > 0) {
      if (this.enableMenu.length === 0) {
        const chk = $this.classList.contains('on');
        const parent = this.renderer.parentNode($this);
        if (chk) {
          const index = this.popupList.indexOf(num);
          this.popupList.splice(index, 1);
          this.renderer.removeClass(parent, 'on');
          this.renderer.removeClass($this, 'on');
        } else {
          this.popupList.push(num);

          if (this.enableMenu.length < 1) {
            this.setEnableMenu(type);
          }

          this.renderer.addClass(parent, 'on');
          this.renderer.addClass($this, 'on');
        }
      }
    } else {
      this.alert.warn({ message: '결제 수단이 설정되어 있지 않습니다.' });
    }
  }

  private resetSelected() {
    this.paytypes.forEach(paytype => {
      parent = this.renderer.parentNode(paytype.nativeElement);
      this.renderer.removeClass(parent, 'on');
      this.renderer.removeClass(paytype.nativeElement, 'on');
    });
    this.popupList = [];
    this.enableMenu = [];
  }

  setEnableMenu(type: string) {
    if (this.paymentModeListByMain.paymentModes) {
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

  // 이벤트 리스닝이므로 모달 이벤트와 쫑난다.
  // 반드시 컴포넌트의 모달 아이디 체크를 해야함.
  // 가급적 모달 컴포넌트의 모달 아이디는 변경하지 않아야함.
  @HostListener('document:keydown', ['$event'])
  onKeyBoardDown(event: any) {
    event.stopPropagation();
    if (event.target.tagName === 'INPUT') { return; }
    const latestmodalid = this.storage.getLatestModalId();
    if (latestmodalid === ModalIds.COMPLEX) {
      if (event.keyCode === KeyCode.ESCAPE) {
        this.close();
      }
    }
  }

}
