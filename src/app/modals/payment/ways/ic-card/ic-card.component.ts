import { Component, OnInit, ViewChild, ElementRef, HostListener, OnDestroy } from '@angular/core';
import { Subscription } from 'rxjs/Subscription';
import { Subject } from 'rxjs/Subject';

import { ModalComponent, ModalService, NicePaymentService, Logger, AlertService, SpinnerService, StorageService } from '../../../../core';
import { KeyCode, ICCardPaymentInfo, PaymentCapture, PaymentModeData, CurrencyData, PaymentModes, Accounts, StatusDisplay, CapturePaymentInfo } from '../../../../data';
import { Order } from '../../../../data/models/order/order';
import { Cart } from '../../../../data/models/order/cart';
import { ICCardApprovalResult } from '../../../../core/peripheral/niceterminal/vo/iccard.approval.result';
import { ReceiptService, PaymentService, MessageService } from '../../../../service';
import { NiceConstants } from '../../../../core/peripheral/niceterminal/nice.constants';
import { ICCardCancelResult } from './../../../../core/peripheral/niceterminal/vo/iccard.cancel.result';
import { Utils } from '../../../../core/utils';
import { InfoBroker } from '../../../../broker';
@Component({
  selector: 'pos-ic-card',
  templateUrl: './ic-card.component.html'
})
export class IcCardComponent extends ModalComponent implements OnInit, OnDestroy {
  private orderInfo: Order;
  private cartInfo: Cart;
  private accountInfo: Accounts;
  private paymentcapture: PaymentCapture;
  private paymentType: string;
  private cardresult: ICCardApprovalResult;
  private paymentsubscription: Subscription;
  private dupcheck = false;
  payprice: number;
  finishStatus: string;                                // 결제완료 상태
  paidDate: Date;
  cardnumber: string; // 카드번호
  cardcompany: string; // 카드사명
  cardperiod: string; // 유효기간
  cardauthnumber: string; // 승인번호
  checktype: number;
  apprmessage: string;
  @ViewChild('cardpassword') private cardpassword: ElementRef;
  constructor(protected modalService: ModalService, private receipt: ReceiptService, private message: MessageService,
    private payments: PaymentService, private nicepay: NicePaymentService, private storage: StorageService,
    private spinner: SpinnerService, private info: InfoBroker, private logger: Logger) {
    super(modalService);
    this.finishStatus = null;
    this.checktype = 0;
  }

  ngOnInit() {
    this.accountInfo = this.callerData.accountInfo;
    this.cartInfo = this.callerData.cartInfo;
    if (this.paymentType === 'n') {
      this.payprice = this.cartInfo.totalPrice.value;
    } else {
      if (this.storage.getPay() === 0) {
        this.payprice = this.cartInfo.totalPrice.value;
      } else {
        this.payprice = this.storage.getPay();
      }
    }
  }

  ngOnDestroy() {
    if (this.paymentsubscription) { this.paymentsubscription.unsubscribe(); }
  }

  private makePaymentCaptureData(paidamount: number): CapturePaymentInfo {
    const capturepaymentinfo = new CapturePaymentInfo();
    const iccard = new ICCardPaymentInfo(paidamount);
    iccard.setAccountNumber = this.cardresult.approvalNumber;
    iccard.setBank = this.cardresult.issuerOrgName;
    iccard.setBankIDNumber = this.cardresult.issuerOrgCode;
    iccard.setBaOwner = '';
    iccard.setCardPassword = this.cardpassword.nativeElement.value;
    iccard.setPaymentModeData = new PaymentModeData(PaymentModes.ICCARD);
    iccard.setCurrencyData = new CurrencyData();
    const paymentcapture = new PaymentCapture();
    paymentcapture.setIcCardPaymentInfo = iccard;
    capturepaymentinfo.paymentModeCode = PaymentModes.ICCARD;
    capturepaymentinfo.capturePaymentInfoData = paymentcapture;
    return capturepaymentinfo;
  }

  /**
   * 현금 IC카드는 단독결제임.
   */
  private nicePay() {
    this.approvalAndPayment();
  }

  /**
   * 결제만 수행 : 복합결제 시
   */
  private approval() {
    this.spinner.show();
    const resultNotifier: Subject<ICCardApprovalResult> = this.nicepay.icCardApproval(String(this.payprice));
    this.logger.set('ic.card.component', 'listening on reading ic card...').debug();
    resultNotifier.subscribe(
      (res: ICCardApprovalResult) => {
        this.cardresult = res;
        if (res.code !== NiceConstants.ERROR_CODE.NORMAL) {
          this.finishStatus = 'fail';
          this.storage.removePaymentModeCode();
          // this.alert.error({ message: res.msg });
          this.apprmessage = res.msg;
        } else {
          if (res.approved) {
            this.checktype = 0;
            this.finishStatus = StatusDisplay.PAID;
            this.apprmessage = this.message.get('card.payment.success'); // '카드가 승인되었습니다.';
            this.cardnumber = res.maskedCardNumber;
            this.cardcompany = res.issuerName;
            this.cardauthnumber = res.approvalNumber;
            this.paidDate = Utils.convertDate(res.approvalDateTime);
            // payment caputure
            this.paymentcapture = this.makePaymentCaptureData(this.payprice).capturePaymentInfoData;
            this.logger.set('ic.card.component', 'ic card payment : ' + Utils.stringify(this.paymentcapture)).debug();
          } else {
            this.finishStatus = 'fail';
            this.storage.removePaymentModeCode();
            // this.alert.error({ message: `${res.resultMsg1} ${res.resultMsg2}` });
            this.apprmessage = res.resultMsg1 + ' ' + res.resultMsg2;
          }
        }

      },
      error => { this.spinner.hide(); },
      () => { this.spinner.hide(); });
  }

  /**
   * 결제, Paymetn capture
   */
  private approvalAndPayment() {
    this.spinner.show();
    const resultNotifier: Subject<ICCardApprovalResult> = this.nicepay.icCardApproval(String(this.payprice));
    this.logger.set('ic.card.component', 'listening on reading ic card...').debug();
    resultNotifier.subscribe((res: ICCardApprovalResult) => {
      this.cardresult = res;
      if (res.code !== NiceConstants.ERROR_CODE.NORMAL) {
        // this.alert.error({ message: res.msg });
        this.spinner.hide();
        this.finishStatus = 'fail';
        this.apprmessage = res.msg;
      } else {
        if (res.approved) {
          this.checktype = 0;
          this.cardnumber = res.maskedCardNumber;
          this.cardcompany = res.issuerName;
          this.cardauthnumber = res.approvalNumber;
          this.paidDate = Utils.convertDate(res.approvalDateTime);
          // payment caputure
          const capturepaymentinfo = this.makePaymentCaptureData(this.payprice);
          this.paymentcapture = capturepaymentinfo.capturePaymentInfoData;
          this.logger.set('ic.card.component', 'ic card payment : ' + Utils.stringify(this.paymentcapture)).debug();
          this.paymentsubscription = this.payments.placeOrder(this.accountInfo.parties[0].uid, this.cartInfo.code, capturepaymentinfo).subscribe(
            result => {
              this.orderInfo = result;
              this.logger.set('ic.card.component', `payment capture and place order status : ${result.status}, status display : ${result.statusDisplay}`).debug();
              this.finishStatus = result.statusDisplay;
              if (Utils.isNotEmpty(result.code)) { // 결제정보가 있을 경우
                if (this.finishStatus === StatusDisplay.CREATED || this.finishStatus === StatusDisplay.PAID) {
                  this.apprmessage = this.message.get('payment.success'); // '결제가 완료되었습니다.';
                  this.paidDate = result.created ? result.created : new Date();
                  // this.info.sendInfo('payinfo', [this.paymentcapture, this.orderInfo]);
                  this.sendPaymentAndOrder(this.paymentcapture, this.orderInfo);
                } else if (this.finishStatus === StatusDisplay.PAYMENTFAILED) {  // CART 삭제 --> 장바구니의 entry 정보로 CART 재생성
                  this.apprmessage = this.message.get('payment.fail'); // '결제에 실패했습니다.';
                  this.finishStatus = 'recart';
                } else { // CART 삭제된 상태
                  this.apprmessage = this.message.get('payment.fail'); // '결제에 실패했습니다.';
                  this.finishStatus = 'recart';
                }
              } else { // 결제정보 없는 경우,  CART 삭제되지 않은 상태, 다른 지불 수단으로 처리
                // cart-list.component에 재생성 이벤트 보내서 처리
                this.finishStatus = 'fail';
                this.apprmessage = this.message.get('payment.fail'); // '결제에 실패했습니다.';
              }
              this.storage.removePay();
            }, error => {
              this.finishStatus = 'fail';
              this.spinner.hide();
              const errdata = Utils.getError(error);
              if (errdata) {
                this.apprmessage = errdata.message;
                // this.logger.set('iccard.component', `${errdata.message}`).error();
              }
            }, () => { this.spinner.hide(); });
        } else {
          this.finishStatus = 'fail';
          this.spinner.hide();
          // this.alert.error({ message: `${res.resultMsg1} ${res.resultMsg2}` });
          this.apprmessage = res.resultMsg1 + ' ' + res.resultMsg2;
        }
      }
    });
  }

  private passwordBlur() {
    const pwd = this.cardpassword.nativeElement.value;
    if (Utils.isEmpty(pwd)) {
      setTimeout(() => { this.cardpassword.nativeElement.focus(); }, 50);
    } else {
      setTimeout(() => { this.cardpassword.nativeElement.blur(); }, 50);
    }
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

  close() {
    this.closeModal();
  }

  /**
   * ESC를 눌렀을 경우 카드 결제했으면 취소
   * 안했으면 팝업 닫기
   */
  payCancel() {
    if (this.cardresult && this.cardresult.approved) {
      const apprnum = this.cardresult.approvalNumber;
      const apprdate = this.cardresult.approvalDateTime ? this.cardresult.approvalDateTime.substring(0, 6) : '';
      const resultNotifier: Subject<ICCardCancelResult> = this.nicepay.icCardCancel(String(this.payprice), apprnum, apprdate);
      resultNotifier.subscribe(
        (res: ICCardCancelResult) => {
          if (res.approved) {
            this.logger.set('ic.card.component', 'card cancel success').debug();
          } else {
            this.logger.set('ic.card.component', `card cancel error : ${res.resultMsg1}, ${res.resultMsg2}`).error();
          }
        },
        error => { this.logger.set('ic.card.component', `${error}`).error(); },
        () => { /*this.close();*/ }
      );
    } else {
      /*this.close();*/
    }
  }

  cartInitAndClose() {
    if (this.finishStatus === StatusDisplay.CREATED || this.finishStatus === StatusDisplay.PAID) {
      this.receipt.print(this.accountInfo, this.cartInfo, this.orderInfo, this.paymentcapture);
      this.logger.set('cash.component', '일반결제 장바구니 초기화...').debug();
      this.info.sendInfo('orderClear', 'clear');
    } else if (this.finishStatus === 'recart') {
      this.info.sendInfo('recart', this.orderInfo);
      this.info.sendInfo('orderClear', 'clear');
    }
    this.close();
  }

  @HostListener('document:keydown', ['$event'])
  onKeyBoardDown(event: any) {
    event.stopPropagation();
    if (event.target.tagName === 'INPUT') { return; }
    if (event.keyCode === KeyCode.ENTER) {
      if (this.cardresult && this.cardresult.approved) { // 카드 승인 결과 있고 성공
        this.cartInitAndClose();
      } else if (this.cardresult && !this.cardresult.approved) { // 카드 승인 결과 있고 실패
        this.close();
      } else {
        if (!this.dupcheck) {
          setTimeout(() => { this.nicePay(); }, 300);
          this.dupcheck = true;
        }
      }
    }
  }

}
