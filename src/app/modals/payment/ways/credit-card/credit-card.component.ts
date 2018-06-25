import { Component, OnInit, ViewChild, ElementRef, Renderer2, HostListener, OnDestroy } from '@angular/core';
import { Subscription } from 'rxjs/Subscription';
import { Subject } from 'rxjs/Subject';

import { ModalComponent, ModalService, NicePaymentService, Logger, AlertService, SpinnerService, AlertState } from '../../../../core';
import { PaymentCapture, CreditCardPaymentInfo, PaymentModes, PaymentModeData, CurrencyData, Accounts, KeyCode, StatusDisplay } from '../../../../data';
import { Order } from '../../../../data/models/order/order';
import { Cart } from '../../../../data/models/order/cart';
import { ReceiptService, PaymentService } from '../../../../service';
import { CardApprovalResult } from '../../../../core/peripheral/niceterminal/vo/card.approval.result';
import { Utils } from '../../../../core/utils';
import { CardCancelResult } from '../../../../core/peripheral/niceterminal/vo/card.cancel.result';
import { NiceConstants } from '../../../../core/peripheral/niceterminal/nice.constants';


@Component({
  selector: 'pos-credit-card',
  templateUrl: './credit-card.component.html'
})
export class CreditCardComponent extends ModalComponent implements OnInit, OnDestroy {

  private installment: number;
  payprice: number;
  change: number;
  finishStatus: string;                                // 결제완료 상태
  paidDate: Date;
  private orderInfo: Order;
  private cartInfo: Cart;
  private account: Accounts;
  private paymentcapture: PaymentCapture;
  private paymentType: string;
  private cardresult: CardApprovalResult;
  private paymentsubscription: Subscription;
  private alertsubscription: Subscription;
  cardnumber: string; // 카드번호
  cardcompay: string; // 카드사명
  cardperiod: string; // 유효기간
  cardauthnumber: string; // 승인번호
  @ViewChild('paid') private paid: ElementRef;
  @ViewChild('installmentPeriod') private installmentPeriod: ElementRef;
  @ViewChild('cardpassword') private cardpassword: ElementRef;
  constructor(protected modalService: ModalService, private receipt: ReceiptService,
    private payments: PaymentService, private nicepay: NicePaymentService,
    private alert: AlertService, private spinner: SpinnerService, private logger: Logger, private renderer: Renderer2) {
    super(modalService);
    this.installment = 0;
    this.finishStatus = null;
  }

  ngOnInit() {
    setTimeout(() => {
      // this.paid.nativeElement.focus();
      this.renderer.setAttribute(this.installmentPeriod.nativeElement, 'readonly', 'readonly');
    }, 50);
    this.account = this.callerData.account;
    this.cartInfo = this.callerData.cartInfo;
    if (this.paymentType === 'n') {
      this.payprice = this.cartInfo.totalPrice.value;
      this.paid.nativeElement.value = this.payprice;
      this.change = this.payprice;
    }
  }

  ngOnDestroy() {
    if (this.paymentsubscription) { this.paymentsubscription.unsubscribe(); }
    if (this.alertsubscription) { this.alertsubscription.unsubscribe(); }
  }

  cal(paid: number) {
    this.change = this.payprice - paid;
  }

  check(paid: number) {
    setTimeout(() => {
      this.paid.nativeElement.blur();
    }, 5);
  }
  checkPay(type: number) {
    this.installmentPeriod.nativeElement.value = '';
    if (type === 0) {
      this.installment = 0;
      setTimeout(() => { this.renderer.setAttribute(this.installmentPeriod.nativeElement, 'readonly', 'readonly'); }, 5);
    } else {
      setTimeout(() => { this.renderer.removeAttribute(this.installmentPeriod.nativeElement, 'readonly'); }, 5);
      this.installment = this.installmentPeriod.nativeElement.value;
      this.installmentPeriod.nativeElement.focus();
    }
  }

  private makePaymentCaptureData(paidamount: number): PaymentCapture {
    const signdata = this.cardresult.signData; // 5만원 이상 결제할 경우 sign data 전송
    const ccard = new CreditCardPaymentInfo(paidamount);
    ccard.setCardAuthNumber = this.cardresult.approvalNumber;
    ccard.setCardCompayCode = this.cardresult.issuerCode;
    ccard.setCardPassword = this.cardpassword.nativeElement.value;
    ccard.setInstallmentPlan = this.cardresult.installmentMonth;
    ccard.setMemberType = '';
    ccard.setPaymentType = '';
    ccard.setValidToMonth = '';
    ccard.setValidToYear = '';
    ccard.setPaymentModeData = new PaymentModeData(PaymentModes.CREDITCARD);
    ccard.setCurrencyData = new CurrencyData();
    const paymentcapture = new PaymentCapture();
    paymentcapture.setCcPaymentInfo = ccard;
    return paymentcapture;
  }

  /**
   * 신용카드 정보 입력 및 결제 단말기 인식 후,
   * 실물 키보드에서 Enter 키 터치 시 결제 정보가 PG사로 넘어감
   */
  private nicePay() {
    const payprice = this.paid.nativeElement.value;
    this.alertsubscription = this.alert.alertState.subscribe(
      (state: AlertState) => {
        if (state.show) {
          setTimeout(() => {
            this.paid.nativeElement.value = this.payprice;
            this.change = 0;
            this.paid.nativeElement.blur();
          }, 5);
        }
      }
    );

    if (this.paymentType === 'n') {
      if (this.change > 0) {
        this.alert.show({ message: '실결제금액이 부족합니다.' });
      } else if (this.change < 0) {
        this.alert.show({ message: '실결제금액이 큽니다.' });
      } else {
        const resultNotifier: Subject<CardApprovalResult> = this.nicepay.cardApproval(String(payprice), String(this.installment));
        this.logger.set('credit.card.component', 'listening on reading credit card...').debug();
        resultNotifier.subscribe(
          (res: CardApprovalResult) => {
            this.cardresult = res;
            if (res.code !== NiceConstants.ERROR_CODE.NORMAL) {
              this.alert.error({ message: res.msg });
            } else {
              if (res.approved) {
                this.spinner.show();
                this.cardnumber = res.maskedCardNumber;
                this.cardcompay = res.issuerName;
                // this.cardperiod;
                this.cardauthnumber = res.approvalNumber;
                this.paidDate = Utils.convertDate(res.approvalDateTime);

                // payment caputure
                this.paymentcapture = this.makePaymentCaptureData(payprice);
                this.logger.set('credit.card.component', 'credit card payment : ' + Utils.stringify(this.paymentcapture)).debug();
                this.paymentsubscription = this.payments.placeOrder(this.account.uid, this.account.parties[0].uid, this.cartInfo.code, this.paymentcapture).subscribe(
                  result => {
                    this.orderInfo = result;
                    this.logger.set('credit.card.component', `payment capture and place order status : ${result.status}, status display : ${result.statusDisplay}`).debug();
                    this.finishStatus = result.statusDisplay;
                    if (Utils.isNotEmpty(result.code)) { // 결제정보가 있을 경우
                      if (this.finishStatus === StatusDisplay.PAID) {
                        this.paidDate = result.created ? result.created : new Date();

                        setTimeout(() => { // 결제 성공, 변경못하도록 처리
                          this.paid.nativeElement.blur(); // keydown.enter 처리 안되도록
                          this.renderer.setAttribute(this.paid.nativeElement, 'readonly', 'readonly');
                        }, 5);

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
                      this.logger.set('cash.component', `${errdata.message}`).error();
                    }
                  },
                  () => { this.spinner.hide(); });
              } else {
                this.finishStatus = 'fail';
                this.alert.error({ message: `${res.resultMsg1} ${res.resultMsg2}` });
              }
            }
          }
        );
      }
    }
  }

  close() {
    if (this.cardresult && this.cardresult.approved) {
      const payprice = this.paid.nativeElement.value;
      const apprnum = this.cardresult.approvalNumber;
      const apprdate = this.cardresult.approvalDateTime ? this.cardresult.approvalDateTime.substring(0, 6) : '';
      const resultNotifier: Subject<CardCancelResult> = this.nicepay.cardCancel(String(payprice), apprnum, apprdate, String(this.installment));
      resultNotifier.subscribe(
        (res: CardCancelResult) => {
          if (res.approved) {
            this.logger.set('credit.card.component', 'card cancel success').debug();
          } else {
            this.logger.set('credit.card.component', `card cancel error : ${res.resultMsg1}, ${res.resultMsg2}`).error();
          }
        },
        error => { this.logger.set('credit.card.component', `${error}`).error(); },
        () => { this.closeModal(); }
      );
    } else {
      this.closeModal();
    }
  }

  @HostListener('document:keydown', ['$event'])
  onKeyBoardDown(event: any) {
    event.stopPropagation();
    if (event.target.tagName === 'INPUT') { return; }
    if (event.keyCode === KeyCode.ENTER) {
      this.nicePay();
    } else if (event.keyCode === KeyCode.ESCAPE) {
      this.close();
    }
  }
}
