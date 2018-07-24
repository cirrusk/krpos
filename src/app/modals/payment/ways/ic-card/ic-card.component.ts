import { Component, OnInit, ViewChild, ElementRef, HostListener, OnDestroy } from '@angular/core';
import { Subscription } from 'rxjs/Subscription';
import { Subject } from 'rxjs/Subject';

import { CompletePaymentComponent } from '../../complete-payment/complete-payment.component';
import { ReceiptService, PaymentService, MessageService } from '../../../../service';
import {
  ModalComponent, ModalService, NicePaymentService, Logger, SpinnerService,
  StorageService, Modal, ICCardApprovalResult, NiceConstants, ICCardCancelResult
} from '../../../../core';
import {
  KeyCode, ICCardPaymentInfo, PaymentCapture, PaymentModeData, CurrencyData, PaymentModes, Accounts,
  StatusDisplay, CapturePaymentInfo, CCMemberType, CCPaymentType, AmwayExtendedOrdering
} from '../../../../data';
import { Order } from '../../../../data/models/order/order';
import { Cart } from '../../../../data/models/order/cart';
import { InfoBroker } from '../../../../broker';
import { Utils } from '../../../../core/utils';

@Component({
  selector: 'pos-ic-card',
  templateUrl: './ic-card.component.html'
})
export class IcCardComponent extends ModalComponent implements OnInit, OnDestroy {
  paidamount: number;
  finishStatus: string;                                // 결제완료 상태
  paidDate: Date;
  cardnumber: string; // 카드번호
  cardcompany: string; // 카드사명
  cardauthnumber: string; // 승인번호
  checktype: number;
  apprmessage: string;
  private orderInfo: Order;
  private cartInfo: Cart;
  private accountInfo: Accounts;
  private amwayExtendedOrdering: AmwayExtendedOrdering;
  private paymentcapture: PaymentCapture;
  private paymentType: string;
  private cardresult: ICCardApprovalResult;
  private paymentsubscription: Subscription;
  private dupcheck = false;
  constructor(protected modalService: ModalService, private modal: Modal, private receipt: ReceiptService, private message: MessageService,
    private payments: PaymentService, private nicepay: NicePaymentService, private storage: StorageService,
    private spinner: SpinnerService, private info: InfoBroker, private logger: Logger) {
    super(modalService);
    this.finishStatus = null;
    this.checktype = 0;
  }

  ngOnInit() {
    this.storage.removePay(); // 단독결재만 하므로 초기화
    this.accountInfo = this.callerData.accountInfo;
    this.cartInfo = this.callerData.cartInfo;
    this.amwayExtendedOrdering = this.callerData.amwayExtendedOrdering;
    if (this.paymentType === 'n') {
      this.paidamount = this.cartInfo.totalPrice.value;
    } else {
      if (this.storage.getPay() === 0) {
        this.paidamount = this.cartInfo.totalPrice.value;
      } else {
        this.paidamount = this.storage.getPay();
      }
    }
  }

  ngOnDestroy() {
    if (this.paymentsubscription) { this.paymentsubscription.unsubscribe(); }
    this.receipt.dispose();
  }

  /**
   * 임시로 카드 매핑, 나중에 매핑되면 제거
   */
  private getCardCodes(): Map<string, string> {
    const map = new Map([
      ['01', 'C0G'], // AMEX
      ['02', 'C0B'], // 국민은행
      ['08', 'C04']  // 현대카드
    ]
    );
    return map;
  }

  /**
   * IC Card Payment Capture 데이터 생성
   *
   * @param paidamount 결제금액
   */
  private makePaymentCaptureData(paidamount: number): CapturePaymentInfo {
    const capturepaymentinfo = new CapturePaymentInfo();
    const iccard = this.makePaymentInfo(paidamount);
    if (this.paymentcapture) {
      if (this.paymentType === 'n') {
        const paymentcapture = new PaymentCapture();
        paymentcapture.setVoucherPaymentInfo = null; // 쿠폰은 INTERNAL_PROCESS에서 처리하므로 Payment에 세팅안되도록 주의!
        paymentcapture.setIcCardPaymentInfo = iccard;
        capturepaymentinfo.paymentModeCode = PaymentModes.ICCARD;
        capturepaymentinfo.capturePaymentInfoData = paymentcapture;
      } else {
        this.paymentcapture.setVoucherPaymentInfo = null; // 쿠폰은 INTERNAL_PROCESS에서 처리하므로 Payment에 세팅안되도록 주의!
        this.paymentcapture.setIcCardPaymentInfo = iccard;
        capturepaymentinfo.paymentModeCode = this.storage.getPaymentModeCode();
        capturepaymentinfo.capturePaymentInfoData = this.paymentcapture;
      }
    } else {
      const paymentcapture = new PaymentCapture();
      paymentcapture.setVoucherPaymentInfo = null; // 쿠폰은 INTERNAL_PROCESS에서 처리하므로 Payment에 세팅안되도록 주의!
      paymentcapture.setIcCardPaymentInfo = iccard;
      capturepaymentinfo.paymentModeCode = this.storage.getPaymentModeCode() ? this.storage.getPaymentModeCode() : PaymentModes.ICCARD;
      capturepaymentinfo.capturePaymentInfoData = paymentcapture;
    }
    return capturepaymentinfo;
  }

  /**
   * IC Card Payment Info 생성
   * @param paidamount 결제금액
   */
  private makePaymentInfo(paidamount: number): ICCardPaymentInfo {
    const iccard = new ICCardPaymentInfo(paidamount);
    iccard.setCardNumber = this.cardresult.iccardSerialNumber;
    iccard.setCardAuthNumber = this.cardresult.approvalNumber; // 승인번호
    iccard.setCardMerchantNumber = this.cardresult.merchantNumber; // 가맹점 번호
    iccard.setCardCompanyCode = this.getCardCodes().get(this.cardresult.issuerCode); // this.cardresult.issuerCode;
    iccard.setCardAcquirerCode = this.cardresult.acquireCode; // 매입사 코드
    iccard.setInstallmentPlan = '00';
    iccard.setCardApprovalNumber = this.cardresult.approvalNumber;
    iccard.setCardRequestDate = Utils.convertDateStringForHybris(this.cardresult.approvalDateTime); // Utils.convertDate(this.cardresult.approvalDateTime);
    iccard.setNumber = this.cardresult.iccardSerialNumber;
    iccard.setMemberType = CCMemberType.PERSONAL;
    iccard.setPaymentType = CCPaymentType.GENERAL;
    iccard.setCardType = PaymentModes.ICCARD;
    iccard.setTransactionId = this.cardresult.trxNumber; // 트랜잭션 ID 아직 NICE IC 단말에서 정보 안나옴. 일단 빈 칸으로 저장 (7월에 나옴)
    // ccard.setValidToMonth = '';
    // ccard.setValidToYear = '';
    const signdata = this.cardresult.signData; // 5만원 이상 결제할 경우 sign data 전송
    if (Utils.isNotEmpty(signdata)) {
      iccard.setPaymentSignature = signdata;
    }
    iccard.setPaymentModeData = new PaymentModeData(PaymentModes.ICCARD);
    iccard.setCurrencyData = new CurrencyData();
    return iccard;
  }

  /**
   * 현금 IC카드는 단독결제임.
   */
  private nicePay() {
    this.cardPay();
  }

  /**
   * 카드결제만 진행
   */
  private cardPay() {
    this.spinner.show();
    const resultNotifier: Subject<ICCardApprovalResult> = this.nicepay.icCardApproval(String(this.paidamount));
    this.logger.set('ic.card.component', 'listening on reading ic card...').debug();
    resultNotifier.subscribe(
      (res: ICCardApprovalResult) => {
        this.cardresult = res;
        if (res.code !== NiceConstants.ERROR_CODE.NORMAL) {
          this.spinner.hide();
          this.finishStatus = 'retry';
          this.apprmessage = res.msg;
          this.dupcheck = false;
        } else {
          if (res.approved) {
            this.checktype = 0;
            this.finishStatus = StatusDisplay.PAID;
            this.cardnumber = res.maskedCardNumber;
            this.cardcompany = res.issuerName;
            this.cardauthnumber = res.approvalNumber;
            this.paidDate = Utils.convertDate(res.approvalDateTime);
            const capturepaymentinfo = this.makePaymentCaptureData(this.paidamount);
            this.paymentcapture = capturepaymentinfo.capturePaymentInfoData;
            this.result = this.paymentcapture;
            this.apprmessage = this.message.get('card.payment.success'); // '카드결제 승인이 완료되었습니다.';
            // this.completePayPopup(this.paidamount, this.paidamount, 0);
            this.logger.set('ic.card.component', 'ic card payment : ' + Utils.stringify(this.paymentcapture)).debug();
            this.spinner.hide();
          } else {
            this.finishStatus = 'fail';
            this.spinner.hide();
            this.apprmessage = res.resultMsg1 + ' ' + res.resultMsg2;
          }
        }
      },
      error => {
        this.logger.set('ic.card.component', `${error}`).error();
        this.spinner.hide();
        this.storage.removePaymentModeCode();
      },
      () => { this.spinner.hide(); });
  }

  /**
   * 결제, Payment capture
   */
  private cardPayAndPlaceOrder() {
    this.spinner.show();
    const resultNotifier: Subject<ICCardApprovalResult> = this.nicepay.icCardApproval(String(this.paidamount));
    this.logger.set('ic.card.component', 'listening on reading ic card...').debug();
    resultNotifier.subscribe((res: ICCardApprovalResult) => {
      this.cardresult = res;
      if (res.code !== NiceConstants.ERROR_CODE.NORMAL) {
        this.spinner.hide();
        this.finishStatus = 'retry';
        this.apprmessage = res.msg;
        this.dupcheck = false;
      } else {
        if (res.approved) {
          this.checktype = 0;
          this.cardnumber = res.maskedCardNumber;
          this.cardcompany = res.issuerName;
          this.cardauthnumber = res.approvalNumber;
          this.paidDate = Utils.convertDate(res.approvalDateTime);
          const capturepaymentinfo = this.makePaymentCaptureData(this.paidamount);
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
              }
            }, () => { this.spinner.hide(); });
        } else {
          this.finishStatus = 'fail';
          this.spinner.hide();
          this.apprmessage = res.resultMsg1 + ' ' + res.resultMsg2;
        }
      }
    });
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
      const resultNotifier: Subject<ICCardCancelResult> = this.nicepay.icCardCancel(String(this.paidamount), apprnum, apprdate);
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

  private completePayPopup(paidAmount: number, payAmount: number, change: number) {
    this.close();
    this.modal.openModalByComponent(CompletePaymentComponent, {
      callerData: {
        account: this.accountInfo, cartInfo: this.cartInfo, paymentInfo: this.paymentcapture,
        paidAmount: paidAmount, payAmount: payAmount, change: change, amwayExtendedOrdering : this.amwayExtendedOrdering
      },
      closeByClickOutside: false,
      closeByEscape: false,
      modalId: 'CompletePaymentComponent',
      paymentType: 'c'
    });
  }

  private payFinishByEnter() {
    if (this.finishStatus === StatusDisplay.CREATED || this.finishStatus === StatusDisplay.PAID) {
      if (this.paymentType === 'n') { // 일반결제
        this.receipt.print(this.accountInfo, this.cartInfo, this.orderInfo, this.paymentcapture);
        this.logger.set('cash.component', '일반결제 장바구니 초기화...').debug();
        this.info.sendInfo('orderClear', 'clear');
        this.close();
      } else {
        this.completePayPopup(this.paidamount, this.paidamount, 0);
      }
    } else if (this.finishStatus === 'recart') {
      this.info.sendInfo('recart', this.orderInfo);
      this.info.sendInfo('orderClear', 'clear');
      this.close();
    }
  }

  @HostListener('document:keydown', ['$event'])
  onIcCardDown(event: any) {
    event.stopPropagation();
    if (event.target.tagName === 'INPUT') { return; }
    if (event.keyCode === KeyCode.ENTER) {
      const modalid = this.storage.getLatestModalId();
      if (modalid !== 'CompletePaymentComponent') {
        if (this.cardresult && this.cardresult.code !== NiceConstants.ERROR_CODE.NORMAL) { // 카드 결제 시 오류로 재결제 필요
          if (!this.dupcheck) {
            setTimeout(() => { this.nicePay(); }, 300);
            this.dupcheck = true;
          }
        } else {
          if (this.cardresult && this.cardresult.approved) { // 카드 승인 결과 있고 성공
            this.payFinishByEnter();
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
  }

}
