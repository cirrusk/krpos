import { Component, OnInit, ViewChild, ElementRef, HostListener, OnDestroy } from '@angular/core';
import { Subscription } from 'rxjs/Subscription';

import { ModalComponent, ModalService, Logger, AlertService, SpinnerService } from '../../../../core';
import { KeyCode, Accounts, Balance, PaymentCapture, PointPaymentInfo, PointType, PaymentModes, PaymentModeData, CurrencyData, StatusDisplay } from '../../../../data';
import { PaymentService } from '../../../../service';
import { Cart } from './../../../../data/models/order/cart';
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
  private cartInfo: Cart;
  private accountInfo: Accounts;
  private paymentType: string;
  private balance: Balance;
  balanceamount: number;
  paymentprice: number;
  change: number;
  @ViewChild('usePoint') usePoint: ElementRef;
  private balancesubscription: Subscription;
  private paymentsubscription: Subscription;
  private alertsubscription: Subscription;
  constructor(protected modalService: ModalService,
    private payments: PaymentService,
    private alert: AlertService,
    private spinner: SpinnerService,
    private logger: Logger) {
    super(modalService);
    this.isAllPay = true;
    this.finishStatus = null;
  }

  ngOnInit() {
    console.log('----> ' + this.pointType);
    if (this.pointType === 'a') {
      this.pointTypeText = 'A포인트';
    } else {
      this.pointTypeText = 'Member 포인트';
    }
    this.accountInfo = this.callerData.accountInfo;
    this.cartInfo = this.callerData.cartInfo;
    this.paymentprice = this.cartInfo.totalPrice.value;
    this.balancesubscription = this.payments.getBalance(this.accountInfo.parties[0].uid).subscribe(result => {
      this.balance = result;
      this.balanceamount = this.balance.amount;
      const changeprice = this.balanceamount - this.usePoint.nativeElement.value;
      this.change = (changeprice < 0) ? 0 : changeprice;
    });

  }

  ngOnDestroy() {
    if (this.balancesubscription) { this.balancesubscription.unsubscribe(); }
    if (this.paymentsubscription) { this.paymentsubscription.unsubscribe(); }
    if (this.alertsubscription) { this.alertsubscription.unsubscribe(); }
  }

  payPoint() {
    if (this.isAllPay) {
      console.log('*** use point : all point');
    } else {
      console.log('*** use point : ' + this.usePoint.nativeElement.value);
    }
    if (this.paymentType === 'n') {
      const usepoint = this.usePoint.nativeElement.value ? this.usePoint.nativeElement.value : 0;
      const paid = this.paymentprice - usepoint;
      if (paid > 0) { // 포인트가 부족

      } else if (paid < 0) { // 포인트가 많음.

      } else {
        this.spinner.show();
        // payment capture and place order
        const paymentcapture = this.makePaymentCaptureData(this.paymentprice);
        this.logger.set('point.component', 'point payment : ' + Utils.stringify(paymentcapture)).debug();
        this.paymentsubscription = this.payments.placeOrder(this.accountInfo.uid, this.accountInfo.parties[0].uid, this.cartInfo.code, paymentcapture).subscribe(
          result => {
            this.logger.set('point.component', `payment capture and place order status : ${result.status}, status display : ${result.statusDisplay}`).debug();
            this.finishStatus = result.statusDisplay;
            if (Utils.isNotEmpty(result.code)) { // 결제정보가 있을 경우
              if (this.finishStatus === StatusDisplay.CREATED) {
                // this.paidDate = result.created ? result.created : new Date();

                // setTimeout(() => { // 결제 성공, 변경못하도록 처리
                //   this.payment.nativeElement.blur(); // keydown.enter 처리 안되도록
                //   this.renderer.setAttribute(this.paid.nativeElement, 'readonly', 'readonly');
                //   this.renderer.setAttribute(this.payment.nativeElement, 'readonly', 'readonly');
                // }, 5);

              } else if (this.finishStatus === StatusDisplay.PAYMENTFAILED) { // CART 삭제되지 않은 상태, 다른 지불 수단으로 처리

              } else { // CART 삭제된 상태

              }
            } else { // 결제정보 없는 경우, CART 삭제 --> 장바구니의 entry 정보로 CART 재생성
              // cart-list.component에 재생성 이벤트 보내서 처리
            }
          },
          error => {
            this.finishStatus = 'fail';
            this.spinner.hide();
            const errdata = Utils.getError(error);
            if (errdata) {
              this.logger.set('point.component', `${errdata.message}`).error();
            }
          },
          () => { this.spinner.hide(); });
      }
    }

  }

  setChange(usepoint) {
    if (usepoint > 0 && (this.balanceamount >= usepoint)) {
      this.change = this.balanceamount - usepoint;
    } else { // 가용포인트보다 사용포인트가 많으면
    }
  }

  checkPay(type: number) {
    if (type === 0) {
      this.isAllPay = true;
    } else {
      this.isAllPay = false;
      this.usePoint.nativeElement.value = '';
      this.usePoint.nativeElement.focus();
    }
  }

  private makePaymentCaptureData(paidamount: number): PaymentCapture {
    const pointtype = (this.pointType === 'a') ? PointType.BR030 : PointType.BR033;
    const point = new PointPaymentInfo(paidamount, pointtype);
    point.setPaymentModeData = new PaymentModeData(PaymentModes.POINT);
    point.setCurrencyData = new CurrencyData();
    const paymentcapture = new PaymentCapture();
    paymentcapture.setPointPaymentInfo = point;
    return paymentcapture;
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
