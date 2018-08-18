import { Component, OnInit, ViewChild, ElementRef, HostListener, OnDestroy } from '@angular/core';
import { Subscription } from 'rxjs/Subscription';

import { CompletePaymentComponent } from '../../complete-payment/complete-payment.component';
import { PaymentService, MessageService, ReceiptService } from '../../../../service';
import { ModalComponent, ModalService, Logger, StorageService, Modal } from '../../../../core';
import {
  KeyCode, Accounts, Balance, PaymentCapture, PointPaymentInfo, PointType,
  PaymentModes, PaymentModeData, CurrencyData, StatusDisplay, CapturePaymentInfo, AmwayExtendedOrdering
} from '../../../../data';
import { Cart } from './../../../../data/models/order/cart';
import { Order } from '../../../../data/models/order/order';
import { InfoBroker } from '../../../../broker';
import { Utils } from '../../../../core/utils';

@Component({
  selector: 'pos-point',
  templateUrl: './point.component.html'
})
export class PointComponent extends ModalComponent implements OnInit, OnDestroy {
  finishStatus: string;
  pointType: string; // modal component 호출 시 전달 받은 포인트 타입
  pointTypeText: string;
  isAllPay: boolean;
  point: number;
  paymentprice: number;
  change: number;
  checktype: number;
  apprmessage: string;
  private orderInfo: Order;
  private paymentcapture: PaymentCapture;
  private cartInfo: Cart;
  private accountInfo: Accounts;
  private amwayExtendedOrdering: AmwayExtendedOrdering;
  private paymentType: string;
  private balance: Balance;
  private dupcheck = false;
  private balancesubscription: Subscription;
  private paymentsubscription: Subscription;
  private alertsubscription: Subscription;
  @ViewChild('usePoint') usePoint: ElementRef;
  @ViewChild('pointPanel') pointPanel: ElementRef;
  constructor(protected modalService: ModalService,
    private modal: Modal,
    private payments: PaymentService,
    private receipt: ReceiptService,
    private message: MessageService,
    private storage: StorageService,
    private info: InfoBroker,
    private logger: Logger) {
    super(modalService);
    this.isAllPay = true;
    this.finishStatus = null;
    this.checktype = 0;
  }

  ngOnInit() {
    if (this.pointType === 'a') {
      this.pointTypeText = this.message.get('abo.point.label'); // 'A포인트';
    } else {
      this.pointTypeText = this.message.get('member.point.label'); // 'Member 포인트';
    }
    this.accountInfo = this.callerData.accountInfo;
    this.cartInfo = this.callerData.cartInfo;
    this.amwayExtendedOrdering = this.callerData.amwayExtendedOrdering;
    if (this.callerData.paymentCapture) { this.paymentcapture = this.callerData.paymentCapture; }

    if (this.storage.getPay() === 0) {
      this.paymentprice = this.cartInfo.totalPrice.value;
    } else {
      this.paymentprice = this.storage.getPay();
    }

    this.getBalance();
  }

  private getBalance() {
    this.balancesubscription = this.payments.getBalance(this.accountInfo.parties[0].uid).subscribe(
      result => {
        this.balance = result;
        this.point = this.balance.amount;
        const changeprice = this.point - this.paymentprice;
        this.change = (changeprice < 0) ? 0 : changeprice;
      },
      error => { this.logger.set('point.component', `${error}`).error(); });
  }

  ngOnDestroy() {
    if (this.balancesubscription) { this.balancesubscription.unsubscribe(); }
    if (this.paymentsubscription) { this.paymentsubscription.unsubscribe(); }
    if (this.alertsubscription) { this.alertsubscription.unsubscribe(); }
    this.receipt.dispose();
  }

  setChange(usepoint) {
    if (usepoint > 0) {
      this.change = this.point - usepoint;
      this.validationComplex();
    }
  }

  checkPay(type: number) {
    this.usePoint.nativeElement.value = '';
    if (type === 0) { // 전체금액
      this.change = 0;
      setTimeout(() => {
        this.pointPanel.nativeElement.focus(); // 전체금액일 경우 팝업에 포커스를 주어야 ENTER키 이벤트 동작
        this.isAllPay = true;
        this.validationComplex();
      }, 50);
    } else {
      this.isAllPay = false;
      this.usePoint.nativeElement.focus();
    }
  }

  /**
   * 일부금액일 경우 엔터키 입력시 바로 결제
   */
  pointEnter() {
    if (!this.isAllPay) { // 일부금액
      const point = this.usePoint.nativeElement.value;
      if (Utils.isNotEmpty(point)) {
        if (!this.dupcheck) {
          setTimeout(() => { this.payPoint(); }, 300);
          this.dupcheck = true;
        }
      } else {
        setTimeout(() => { this.usePoint.nativeElement.blur(); }, 50);
      }
    }
  }

  private validationComplex() {
    let usepoint = 0;
    if (this.isAllPay) {
      usepoint = this.paymentprice;
    } else {
      usepoint = this.usePoint.nativeElement.value ? this.usePoint.nativeElement.value : 0;
    }
    if (this.change < 0) {
      this.checktype = -4;
      this.apprmessage = this.message.get('point.use.over'); // 가용포인트 보다 사용포인트가 큽니다.
      this.dupcheck = false;
      return;
    }
    const paid = this.paymentprice - usepoint;
    if (paid < 0) { // 포인트가 많음.
      this.checktype = -2;
      this.apprmessage = this.message.get('point.overpaid'); // '사용 포인트가 결제금액보다 많습니다.';
      this.dupcheck = false;
    } else {
      this.checktype = 0;
    }
  }

  payPoint() {
    if (this.finishStatus !== null) {
      this.close();
      return;
    }
    let usepoint = 0;
    if (this.isAllPay) {
      usepoint = this.paymentprice;
    } else {
      usepoint = this.usePoint.nativeElement.value ? Number(this.usePoint.nativeElement.value) : 0;
      if (typeof usepoint !== 'number') {
        this.checktype = -3;
        this.apprmessage = this.message.get('point.empty'); // '사용 포인트가 공란입니다.';
        this.dupcheck = false;
      }
    }
    if (this.point < usepoint) {
      this.checktype = -4;
      this.apprmessage = this.message.get('point.use.over'); // 가용포인트 보다 사용포인트가 큽니다.
      this.dupcheck = false;
      return;
    }
    const paid = this.paymentprice - usepoint;
    this.checktype = 0;
    this.paymentcapture = this.makePaymentCaptureData(usepoint).capturePaymentInfoData;
    if (paid > 0) { // 결제할것이 남음.
      this.result = this.paymentcapture;
      this.finishStatus = StatusDisplay.PAID;
      this.apprmessage = this.message.get('payment.success.next');
      this.storage.setPay(this.paymentprice - usepoint); // 현재까지 결제할 남은 금액(전체결제금액 - 실결제금액)을 세션에 저장
      this.sendPaymentAndOrder(this.paymentcapture, null);
    } else if (paid === 0) {
      this.result = this.paymentcapture;
      this.completePayPopup(usepoint, this.paymentprice, 0);
    } else {
      this.finishStatus = 'fail';
      this.apprmessage = this.message.get('point.overpaid'); // '사용 포인트가 결제금액보다 많습니다.';
      this.dupcheck = false;
    }
  }

  private makePaymentCaptureData(paidamount: number): CapturePaymentInfo {
    const capturepaymentinfo = new CapturePaymentInfo();
    const pointtype = (this.pointType === 'a') ? PointType.BR030 : PointType.BR033; // 전환포인트 : 멤버포인트
    const point = new PointPaymentInfo(paidamount, pointtype);
    point.setPaymentModeData = new PaymentModeData(PaymentModes.POINT);
    point.setCurrencyData = new CurrencyData();
    if (this.paymentcapture) {

      this.paymentcapture.setVoucherPaymentInfo = null; // 쿠폰은 INTERNAL_PROCESS에서 처리하므로 Payment에 세팅안되도록 주의!
      this.paymentcapture.setPointPaymentInfo = point;
      capturepaymentinfo.paymentModeCode = this.storage.getPaymentModeCode();
      capturepaymentinfo.capturePaymentInfoData = this.paymentcapture;

    } else {
      const paymentcapture = new PaymentCapture();
      paymentcapture.setVoucherPaymentInfo = null; // 쿠폰은 INTERNAL_PROCESS에서 처리하므로 Payment에 세팅안되도록 주의!
      paymentcapture.setPointPaymentInfo = point;
      capturepaymentinfo.paymentModeCode = this.storage.getPaymentModeCode();
      capturepaymentinfo.capturePaymentInfoData = paymentcapture;
    }
    return capturepaymentinfo;
  }

  /**
   * 장바구니와 클라이언트에 정보 전달
   *
   * @param payment Payment Capture 정보
   * @param order Order 정보
   */
  private sendPaymentAndOrder(payment: PaymentCapture, order: Order) {
    this.info.sendInfo('payinfo', [payment, order]);
    this.storage.setLocalItem('payinfo', [payment, order]);
  }

  private completePayPopup(paidAmount: number, payAmount: number, change: number) {
    this.close();
    this.modal.openModalByComponent(CompletePaymentComponent, {
      callerData: {
        account: this.accountInfo, cartInfo: this.cartInfo, paymentInfo: this.paymentcapture,
        paidAmount: paidAmount, payAmount: payAmount, change: change, amwayExtendedOrdering: this.amwayExtendedOrdering
      },
      closeByClickOutside: false,
      closeByEscape: false,
      modalId: 'CompletePaymentComponent',
      paymentType: 'c'
    });
  }

  /**
   * 결제완료 후 Enter Key 치면 팝업 닫힘
   * 일반결제 : 카트 및 클라이언트 초기화
   * 복합결제 : 카트 및 클라이언트 갱신
   */
  private payFinishByEnter() {
    this.close();
  }

  close() {
    this.closeModal();
  }

  @HostListener('document:keydown', ['$event'])
  onPointKeyDown(event: any) {
    event.stopPropagation();
    if (event.target.tagName === 'INPUT') { return; }
    if (event.keyCode === KeyCode.ENTER) {
      const modalid = this.storage.getLatestModalId();
      if (modalid !== 'CompletePaymentComponent') { // 결제완료 창이 뜨지 않았을 경우만 처리
        if (this.finishStatus === StatusDisplay.CREATED || this.finishStatus === StatusDisplay.PAID) {
          this.payFinishByEnter();
        } else if (this.finishStatus === 'fail') {
          this.info.sendInfo('recart', this.orderInfo);
          this.info.sendInfo('orderClear', 'clear');
          this.close();
        } else {
          if (!this.dupcheck) {
            setTimeout(() => { this.payPoint(); }, 300);
            this.dupcheck = true;
          }
        }
      }
    }
  }

}
