import { Component, OnInit, ViewChild, ElementRef, HostListener, OnDestroy } from '@angular/core';
import { Subscription } from 'rxjs/Subscription';

import { ModalComponent, ModalService, Logger, AlertService, SpinnerService, StorageService, Modal } from '../../../../core';
import {
  KeyCode, Accounts, Balance, PaymentCapture, PointPaymentInfo, PointType,
  PaymentModes, PaymentModeData, CurrencyData, StatusDisplay, CapturePaymentInfo
} from '../../../../data';
import { PaymentService } from '../../../../service';
import { Cart } from './../../../../data/models/order/cart';
import { Utils } from '../../../../core/utils';
import { Order } from '../../../../data/models/order/order';
import { InfoBroker } from '../../../../broker';
import { CompletePaymentComponent } from '../../complete-payment/complete-payment.component';

@Component({
  selector: 'pos-point',
  templateUrl: './point.component.html'
})
export class PointComponent extends ModalComponent implements OnInit, OnDestroy {
  finishStatus: string;
  pointType: string; // modal component 호출 시 전달 받은 포인트 타입
  pointTypeText: string;
  isAllPay: boolean;
  balanceamount: number;
  paymentprice: number;
  change: number;
  checktype: number;
  apprmessage: string;
  private orderInfo: Order;
  private paymentcapture: PaymentCapture;
  private cartInfo: Cart;
  private accountInfo: Accounts;
  private paymentType: string;
  private balance: Balance;
  @ViewChild('usePoint') usePoint: ElementRef;
  private balancesubscription: Subscription;
  private paymentsubscription: Subscription;
  private alertsubscription: Subscription;
  constructor(protected modalService: ModalService,
    private modal: Modal,
    private payments: PaymentService,
    private alert: AlertService,
    private spinner: SpinnerService,
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
      this.pointTypeText = 'A포인트';
    } else {
      this.pointTypeText = 'Member 포인트';
    }
    this.accountInfo = this.callerData.accountInfo;
    this.cartInfo = this.callerData.cartInfo;
    if (this.callerData.paymentCapture) { this.paymentcapture = this.callerData.paymentCapture; }
    if (this.paymentType === 'n') {
      this.paymentprice = this.cartInfo.totalPrice.value;
    } else {
      if (this.storage.getPay() === 0) {
        this.paymentprice = this.cartInfo.totalPrice.value;
      } else {
        this.paymentprice = this.storage.getPay();
      }
    }
    this.getBalance();
  }

  private getBalance() {
    this.spinner.show();
    this.balancesubscription = this.payments.getBalance(this.accountInfo.parties[0].uid).subscribe(
      result => {
        this.balance = result;
        this.balanceamount = this.balance.amount;
        const changeprice = this.balanceamount - this.paymentprice;
        this.change = (changeprice < 0) ? 0 : changeprice;
      },
      error => { this.spinner.hide(); this.logger.set('point.component', `${error}`).error(); },
      () => { this.spinner.hide(); });
  }

  ngOnDestroy() {
    if (this.balancesubscription) { this.balancesubscription.unsubscribe(); }
    if (this.paymentsubscription) { this.paymentsubscription.unsubscribe(); }
    if (this.alertsubscription) { this.alertsubscription.unsubscribe(); }
  }

  setChange(usepoint) {
    if (usepoint > 0) {
      this.change = this.balanceamount - usepoint;
      if (this.paymentType === 'n') {
        this.validationNormal();
      } else {
        this.validationComplex();
      }
    }
  }

  checkPay(type: number) {
    this.usePoint.nativeElement.value = '';
    if (type === 0) { // 전체금액
      this.isAllPay = true;
      this.validationComplex();
    } else {
      this.isAllPay = false;
      this.usePoint.nativeElement.focus();
    }
  }

  private validationComplex() {
    let usepoint = 0;
    if (this.isAllPay) {
      usepoint = this.paymentprice;
    } else {
      usepoint = this.usePoint.nativeElement.value ? this.usePoint.nativeElement.value : 0;
    }
    const paid = this.paymentprice - usepoint;
    if (paid < 0) { // 포인트가 많음.
      this.checktype = -2;
      this.apprmessage = '사용 포인트가 결제금액보다 많습니다.';
    } else {
      this.checktype = 0;
    }
  }

  private validationNormal() {
    let usepoint = 0;
    if (this.isAllPay) {
      usepoint = this.paymentprice;
    } else {
      usepoint = this.usePoint.nativeElement.value ? this.usePoint.nativeElement.value : 0;
    }
    const paid = this.paymentprice - usepoint;
    if (paid === 0) {
      this.checktype = 0;
    } else if (paid > 0) { // 포인트가 부족
      this.checktype = -1;
      this.apprmessage = '사용 포인트가 결제금액보다 작습니다.';
    } else { // 포인트가 많음.
      this.checktype = -2;
      this.apprmessage = '사용 포인트가 결제금액보다 많습니다.';
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
      usepoint = this.usePoint.nativeElement.value ? this.usePoint.nativeElement.value : 0;
      if (typeof usepoint !== 'number') {
        this.checktype = -3;
        this.apprmessage = '사용 포인트가 공란입니다.';
      }
    }
    if (this.balanceamount < usepoint) {
      this.alert.show({ message: '가용포인트 보다 사용포인트가 클 수 없습니다.' });
      return;
    }
    const paid = this.paymentprice - usepoint;
    if (this.paymentType === 'n') {
      if (paid > 0) { // 포인트가 부족
        // this.checktype = '1';
        // this.alert.show({ message: '사용 포인트가 부족합니다.' });
        // return;
      } else if (paid < 0) { // 포인트가 많음.
        // this.checktype = '2';
        // this.alert.show({ message: '사용 포인트가 결제금액보다 많습니다.' });
        // return;
      } else {
        this.checktype = 0;
        this.paymentCapture();
      }
    } else {
      this.checktype = 0;
      const p = usepoint;
      this.paymentcapture = this.makePaymentCaptureData(p).capturePaymentInfoData;
      if (paid > 0) { // 결제할것이 남음.
        this.result = this.paymentcapture;
        // this.info.sendInfo('payinfo', [this.paymentcapture, null]);
        this.sendPaymentAndOrder(this.paymentcapture, null);
        this.close();
      } else if (paid === 0) {
        this.result = this.paymentcapture;
        this.completePayPopup(usepoint, this.paymentprice, 0);
        // this.paymentCapture();
      } else {
        this.checktype = -2;
        this.apprmessage = '사용 포인트가 결제금액보다 많습니다.';
      }
    }

  }

  private paymentCapture() {
    this.spinner.show();
    // payment capture and place order
    const capturepaymentinfo = this.makePaymentCaptureData(this.paymentprice);
    this.paymentcapture = capturepaymentinfo.capturePaymentInfoData;
    this.logger.set('point.component', 'point payment : ' + Utils.stringify(this.paymentcapture)).debug();
    this.paymentsubscription = this.payments.placeOrder(this.accountInfo.parties[0].uid, this.cartInfo.code, capturepaymentinfo).subscribe(
      result => {
        this.orderInfo = result;
        this.logger.set('point.component', `payment capture and place order status : ${result.status}, status display : ${result.statusDisplay}`).debug();
        this.finishStatus = result.statusDisplay;
        if (Utils.isNotEmpty(result.code)) { // 결제정보가 있을 경우
          if (this.finishStatus === StatusDisplay.CREATED || this.finishStatus === StatusDisplay.PAID) {
            this.apprmessage = '결제가 완료되었습니다.';
            // this.paidDate = result.created ? result.created : new Date();
            // setTimeout(() => { // 결제 성공, 변경못하도록 처리
            //   this.payment.nativeElement.blur(); // keydown.enter 처리 안되도록
            //   this.renderer.setAttribute(this.paid.nativeElement, 'readonly', 'readonly');
            //   this.renderer.setAttribute(this.payment.nativeElement, 'readonly', 'readonly');
            // }, 5);
            // this.info.sendInfo('payinfo', [this.paymentcapture, this.orderInfo]);
            this.sendPaymentAndOrder(this.paymentcapture, this.orderInfo);
          } else if (this.finishStatus === StatusDisplay.PAYMENTFAILED) {  // CART 삭제 --> 장바구니의 entry 정보로 CART 재생성
            this.apprmessage = '결제에 실패했습니다.';
            this.finishStatus = 'recart';
          } else { // CART 삭제된 상태
            this.apprmessage = '결제에 실패했습니다.';
            this.finishStatus = 'recart';
          }
        } else { // 결제정보 없는 경우,  CART 삭제되지 않은 상태, 다른 지불 수단으로 처리
          // cart-list.component에 재생성 이벤트 보내서 처리
          this.finishStatus = 'fail';
          this.apprmessage = '결제에 실패했습니다.';
        }
        this.storage.removePay();
      }, error => {
        this.finishStatus = 'fail';
        this.spinner.hide();
        const errdata = Utils.getError(error);
        if (errdata) {
          this.apprmessage = errdata.message;
        }
      }, () => { this.spinner.hide(); });
  }

  private makePaymentCaptureData(paidamount: number): CapturePaymentInfo {
    const capturepaymentinfo = new CapturePaymentInfo();
    const pointtype = (this.pointType === 'a') ? PointType.BR030 : PointType.BR033; // 전환포인트 : 멤버포인트
    const point = new PointPaymentInfo(paidamount, pointtype);
    point.setPaymentModeData = new PaymentModeData(PaymentModes.POINT);
    point.setCurrencyData = new CurrencyData();
    if (this.paymentcapture) {
      if (this.paymentType === 'n') {
        const paymentcapture = new PaymentCapture();
        paymentcapture.setPointPaymentInfo = point;
        capturepaymentinfo.paymentModeCode = PaymentModes.POINT;
        capturepaymentinfo.capturePaymentInfoData = paymentcapture;
      } else {
        this.paymentcapture.setPointPaymentInfo = point;
        capturepaymentinfo.paymentModeCode = this.storage.getPaymentModeCode();
        capturepaymentinfo.capturePaymentInfoData = this.paymentcapture;
      }
    } else {
      const paymentcapture = new PaymentCapture();
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
    this.modal.openModalByComponent(CompletePaymentComponent,
      {
        callerData: {
          account: this.accountInfo, cartInfo: this.cartInfo, paymentInfo: this.paymentcapture,
          paidAmount: paidAmount, payAmount: payAmount, change: change
        },
        closeByClickOutside: false,
        closeByEscape: false,
        modalId: 'CompletePaymentComponent',
        paymentType: 'c'
      }
    );
  }

  close() {
    this.closeModal();
  }

  @HostListener('document:keydown', ['$event'])
  onAlertKeyDown(event: any) {
    event.stopPropagation();
    if (event.target.tagName === 'INPUT') { return; }
    if (event.keyCode === KeyCode.ENTER) {
      this.payPoint();
    }
  }

}
