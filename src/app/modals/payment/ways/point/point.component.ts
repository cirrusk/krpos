import { Component, OnInit, ViewChild, ElementRef, HostListener, OnDestroy } from '@angular/core';
import { Subscription } from 'rxjs/Subscription';

import { ModalComponent, ModalService, Logger, AlertService, SpinnerService, StorageService } from '../../../../core';
import { KeyCode, Accounts, Balance, PaymentCapture, PointPaymentInfo, PointType, PaymentModes, PaymentModeData, CurrencyData, StatusDisplay } from '../../../../data';
import { PaymentService } from '../../../../service';
import { Cart } from './../../../../data/models/order/cart';
import { Utils } from '../../../../core/utils';
import { Order } from '../../../../data/models/order/order';
import { InfoBroker } from '../../../../broker';

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
  checktype: string;
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
    private payments: PaymentService,
    private alert: AlertService,
    private spinner: SpinnerService,
    private storage: StorageService,
    private info: InfoBroker,
    private logger: Logger) {
    super(modalService);
    this.isAllPay = true;
    this.finishStatus = null;
    this.checktype = null;
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
      this.checktype = '2';
    } else {
      this.checktype = null;
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
      this.checktype = '0';
    } else if (paid > 0) { // 포인트가 부족
      this.checktype = '1';
    } else { // 포인트가 많음.
      this.checktype = '2';
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
      usepoint = this.usePoint.nativeElement.value;
      if (typeof usepoint !== 'number') {
        this.checktype = '3';
      }
    }

    const paid = this.paymentprice - usepoint;
    if (this.paymentType === 'n') {
      if (paid > 0) { // 포인트가 부족
        this.checktype = '1';
        // this.alert.show({ message: '사용 포인트가 부족합니다.' });
      } else if (paid < 0) { // 포인트가 많음.
        this.checktype = '2';
        // this.alert.show({ message: '사용 포인트가 결제금액보다 많습니다.' });
      } else {
        this.checktype = null;
        this.paymentCapture();
      }
    } else {
      this.checktype = null;
      console.log(paid);
      if (paid > 0) {
        const point = this.usePoint.nativeElement.value ? this.usePoint.nativeElement.value : 0;
        this.result = this.paymentcapture = this.makePaymentCaptureData(point);
        this.info.sendInfo('payinfo', [this.paymentcapture, null]);
        this.close();
      } else if (paid === 0) {
        this.paymentCapture();
      } else {
        this.checktype = '2';
      }
    }

  }

  private paymentCapture() {
    this.spinner.show();
    // payment capture and place order
    this.paymentcapture = this.makePaymentCaptureData(this.paymentprice);
    this.logger.set('point.component', 'point payment : ' + Utils.stringify(this.paymentcapture)).debug();
    this.paymentsubscription = this.payments.placeOrder(this.accountInfo.uid, this.accountInfo.parties[0].uid, this.cartInfo.code, this.paymentcapture).subscribe(
      result => {
        this.orderInfo = result;
        this.logger.set('point.component', `payment capture and place order status : ${result.status}, status display : ${result.statusDisplay}`).debug();
        this.finishStatus = result.statusDisplay;
        if (Utils.isNotEmpty(result.code)) { // 결제정보가 있을 경우
          if (this.finishStatus === StatusDisplay.CREATED || this.finishStatus === StatusDisplay.PAID) {
            // this.paidDate = result.created ? result.created : new Date();
            // setTimeout(() => { // 결제 성공, 변경못하도록 처리
            //   this.payment.nativeElement.blur(); // keydown.enter 처리 안되도록
            //   this.renderer.setAttribute(this.paid.nativeElement, 'readonly', 'readonly');
            //   this.renderer.setAttribute(this.payment.nativeElement, 'readonly', 'readonly');
            // }, 5);
            this.info.sendInfo('payinfo', [this.paymentcapture, this.orderInfo]);
          } else if (this.finishStatus === StatusDisplay.PAYMENTFAILED) { // CART 삭제되지 않은 상태, 다른 지불 수단으로 처리
          } else { // CART 삭제된 상태
            this.info.sendInfo('recart', this.orderInfo);
          }
        } else { // 결제정보 없는 경우, CART 삭제 --> 장바구니의 entry 정보로 CART 재생성
          // cart-list.component에 재생성 이벤트 보내서 처리
          this.info.sendInfo('recart', this.orderInfo);
        }
        this.storage.removePay();
      }, error => {
        this.finishStatus = 'fail';
        this.spinner.hide();
        const errdata = Utils.getError(error);
        if (errdata) {
          this.logger.set('point.component', `${errdata.message}`).error();
        }
      }, () => { this.spinner.hide(); });
  }

  private makePaymentCaptureData(paidamount: number): PaymentCapture {
    const pointtype = ''; // (this.pointType === 'a') ? PointType.BR030 : PointType.BR033;
    const point = new PointPaymentInfo(paidamount, pointtype);
    point.setPaymentModeData = new PaymentModeData(PaymentModes.POINT);
    point.setCurrencyData = new CurrencyData();
    if (this.paymentcapture) {
      if (this.paymentType === 'n') {
        const paymentcapture = new PaymentCapture();
        paymentcapture.setPointPaymentInfo = point;
        return paymentcapture;
      } else {
        this.paymentcapture.setPointPaymentInfo = point;
        return this.paymentcapture;
      }
    } else {
      const paymentcapture = new PaymentCapture();
      paymentcapture.setPointPaymentInfo = point;
      return paymentcapture;
    }
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
