import { Component, OnInit, ViewChild, ElementRef, Renderer2, HostListener, OnDestroy } from '@angular/core';
import { Subscription } from 'rxjs/Subscription';
import { Subject } from 'rxjs/Subject';

import { InstallmentPlanComponent } from './installment-plan/installment-plan.component';
import { CompletePaymentComponent } from '../../complete-payment/complete-payment.component';
import { ReceiptService, PaymentService, MessageService } from '../../../../service';
import {
  ModalComponent, ModalService, NicePaymentService,
  Logger, AlertService, AlertState, Modal, StorageService,
  CardApprovalResult, CardCancelResult, NiceConstants, SpinnerService
} from '../../../../core';
import {
  PaymentCapture, CreditCardPaymentInfo, PaymentModes, PaymentModeData, CurrencyData,
  Accounts, KeyCode, StatusDisplay, CCMemberType, CCPaymentType, CapturePaymentInfo, AmwayExtendedOrdering
} from '../../../../data';
import { Order } from '../../../../data/models/order/order';
import { Cart } from '../../../../data/models/order/cart';
import { InfoBroker } from '../../../../broker';
import { Utils } from '../../../../core/utils';

@Component({
  selector: 'pos-credit-card',
  templateUrl: './credit-card.component.html'
})
export class CreditCardComponent extends ModalComponent implements OnInit, OnDestroy {

  apprmessage: string;
  checktype: number;
  paidamount: number;
  change: number;
  finishStatus: string;                                // 결제완료 상태
  paidDate: Date;
  cardnumber: string; // 카드번호
  cardcompany: string; // 카드사명
  cardauthnumber: string; // 승인번호
  private installment: string;
  private orderInfo: Order;
  private cartInfo: Cart;
  private accountInfo: Accounts;
  private amwayExtendedOrdering: AmwayExtendedOrdering;
  private paymentcapture: PaymentCapture;
  private paymentType: string;
  private cardresult: CardApprovalResult;
  private paymentsubscription: Subscription;
  private alertsubscription: Subscription;
  private dupcheck = false;
  @ViewChild('paid') private paid: ElementRef;
  @ViewChild('installmentPeriod') private installmentPeriod: ElementRef;
  constructor(protected modalService: ModalService, private receipt: ReceiptService, private spinner: SpinnerService,
    private payments: PaymentService, private nicepay: NicePaymentService, private modal: Modal, private storage: StorageService,
    private message: MessageService, private alert: AlertService, private info: InfoBroker,
    private logger: Logger, private renderer: Renderer2) {
    super(modalService);
    this.installment = '00';
    this.finishStatus = null;
    this.checktype = 0;
  }

  ngOnInit() {
    setTimeout(() => { this.renderer.setAttribute(this.installmentPeriod.nativeElement, 'readonly', 'readonly'); }, 50);
    this.accountInfo = this.callerData.accountInfo;
    this.cartInfo = this.callerData.cartInfo;
    this.amwayExtendedOrdering = this.callerData.amwayExtendedOrdering;
    if (this.callerData.paymentCapture) { this.paymentcapture = this.callerData.paymentCapture; }
    if (this.paymentType === 'n') {
      this.paidamount = this.cartInfo.totalPrice.value;
      this.paid.nativeElement.value = this.paidamount;
      setTimeout(() => { this.renderer.setAttribute(this.paid.nativeElement, 'readonly', 'readonly'); }, 50);
      this.change = 0;
    } else {
      if (this.storage.getPay() === 0) {
        this.paidamount = this.cartInfo.totalPrice.value;
      } else {
        this.paidamount = this.storage.getPay();
      }
      setTimeout(() => { this.paid.nativeElement.focus(); }, 50);
    }
  }

  ngOnDestroy() {
    if (this.paymentsubscription) { this.paymentsubscription.unsubscribe(); }
    if (this.alertsubscription) { this.alertsubscription.unsubscribe(); }
    this.receipt.dispose();
  }

  /**
   * 실결제 금액 입력 시 잔액 계산
   * @param paid 실결제 금액
   */
  paidCal(paid: number) {
    const nPaid = paid ? Number(paid) : 0;
    this.change = this.paidamount - nPaid;
    if (this.paymentType === 'c') {
      if (this.change < 0) {
        this.checktype = -2;
        this.apprmessage = this.message.get('credit.valid.overpaid'); // '실결제금액이 총 매출보다 큽니다.';
      } else {
        this.checktype = 0;
        this.apprmessage = '';
      }
    } else {
      if (this.change > 0) {
        this.checktype = -1;
        this.apprmessage = this.message.get('credit.valid.smallpaid'); // '실결제금액이 총 매출보다 작습니다.';
      } else if (this.change < 0) {
        this.checktype = -2;
        this.apprmessage = this.message.get('credit.valid.overpaid'); // '실결제금액이 총 매출보다 큽니다.';
      } else {
        this.checktype = 0;
        this.apprmessage = '';
      }
    }
  }

  /**
   * 결제금액 엔터입력시 blur 처리
   * 결제창으로 이동 --> 엔터 입력에 대한 이벤트 처리
   */
  paidBlur() {
    const paid = this.paid.nativeElement.value;
    if (Utils.isEmpty(paid)) {
      setTimeout(() => { this.paid.nativeElement.focus(); }, 50);
    } else {
      setTimeout(() => { this.paid.nativeElement.blur(); }, 50);
    }
  }

  /**
   * 할부개월 엔터 입력시 blur 처리
   * 결제창으로 이동 --> 엔터 입력에 대한 이벤트 처리
   */
  installmentBlur() {
    const inst = this.installmentPeriod.nativeElement.value;
    if (Utils.isEmpty(inst)) {
      setTimeout(() => { this.installmentPeriod.nativeElement.focus(); }, 50);
    } else {
      setTimeout(() => { this.installmentPeriod.nativeElement.blur(); }, 50);
    }
  }

  /**
   * 일시불/할부 여부 체크
   *
   * @param type 일시부(0)/할부(1) 여부
   */
  checkInstallment(type: number) {
    this.installmentPeriod.nativeElement.value = '';
    if (type === 0) { // 일시불
      this.installment = '00';
      setTimeout(() => { this.renderer.setAttribute(this.installmentPeriod.nativeElement, 'readonly', 'readonly'); }, 50);
    } else { // 할부
      setTimeout(() => {
        this.renderer.removeAttribute(this.installmentPeriod.nativeElement, 'readonly');
        this.installmentPeriod.nativeElement.focus();
      }, 50);
    }
  }

  /**
   * 무이자할부 팝업
   */
  popupInstallmentPlan() {
    this.modal.openModalByComponent(InstallmentPlanComponent, {
      callerData: { accountInfo: this.accountInfo, cartInfo: this.cartInfo },
      closeByClickOutside: false,
      closeByEnter: false,
      closeByEscape: true,
      modalId: 'InstallmentPlanComponent'
    });
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
   * 할부 개월 수 패딩처리
   */
  private getInstallment(): string {
    const insmnt: number = this.installmentPeriod.nativeElement.value;
    const strinst = Utils.padLeft(String(insmnt), '0', 2);
    this.installment = strinst;
    return strinst;
  }

  /**
   * Credit Card Payment Capture 데이터 생성
   *
   * @param paidamount 결제금액
   */
  private makePaymentCaptureData(paidamount: number): CapturePaymentInfo {
    const capturepaymentinfo = new CapturePaymentInfo();
    const ccard = this.makePaymentInfo(paidamount);
    if (this.paymentcapture) {
      if (this.paymentType === 'n') {
        const paymentcapture = new PaymentCapture();
        paymentcapture.setVoucherPaymentInfo = null; // 쿠폰은 INTERNAL_PROCESS에서 처리하므로 Payment에 세팅안되도록 주의!
        paymentcapture.setCcPaymentInfo = ccard;
        capturepaymentinfo.paymentModeCode = PaymentModes.CREDITCARD;
        capturepaymentinfo.capturePaymentInfoData = paymentcapture;
      } else {
        this.paymentcapture.setVoucherPaymentInfo = null; // 쿠폰은 INTERNAL_PROCESS에서 처리하므로 Payment에 세팅안되도록 주의!
        this.paymentcapture.setCcPaymentInfo = ccard;
        capturepaymentinfo.paymentModeCode = this.storage.getPaymentModeCode();
        capturepaymentinfo.capturePaymentInfoData = this.paymentcapture;
      }
    } else {
      const paymentcapture = new PaymentCapture();
      paymentcapture.setVoucherPaymentInfo = null; // 쿠폰은 INTERNAL_PROCESS에서 처리하므로 Payment에 세팅안되도록 주의!
      paymentcapture.setCcPaymentInfo = ccard;
      capturepaymentinfo.paymentModeCode = this.storage.getPaymentModeCode() ? this.storage.getPaymentModeCode() : PaymentModes.CREDITCARD;
      capturepaymentinfo.capturePaymentInfoData = paymentcapture;
    }
    return capturepaymentinfo;
  }

  /**
   * Credit Card Payment Info 생성
   * @param paidamount 결제금액
   */
  private makePaymentInfo(paidamount: number): CreditCardPaymentInfo {
    const ccard = new CreditCardPaymentInfo(paidamount);
    ccard.setCardNumber = this.cardresult.maskedCardNumber;
    ccard.setCardAuthNumber = this.cardresult.approvalNumber; // 승인번호
    ccard.setCardMerchantNumber = this.cardresult.merchantNumber; // 가맹점 번호
    ccard.setCardCompanyCode = this.getCardCodes().get(this.cardresult.issuerCode); // this.cardresult.issuerCode;
    ccard.setCardAcquirerCode = this.cardresult.acquireCode; // 매입사 코드
    ccard.setInstallmentPlan = Number(this.cardresult.installmentMonth) + '';
    ccard.setCardApprovalNumber = this.cardresult.approvalNumber;
    ccard.setCardRequestDate = Utils.convertDateStringForHybris(this.cardresult.approvalDateTime); // Utils.convertDate(this.cardresult.approvalDateTime);
    ccard.setNumber = this.cardresult.maskedCardNumber;
    ccard.setMemberType = CCMemberType.PERSONAL;
    ccard.setPaymentType = CCPaymentType.GENERAL;
    ccard.setCardType = PaymentModes.CREDITCARD;
    ccard.setTransactionId = this.cardresult.processingNumber; // 트랜잭션 ID 아직 NICE IC 단말에서 정보 안나옴. 일단 빈 칸으로 저장 (7월에 나옴)
    // ccard.setValidToMonth = '';
    // ccard.setValidToYear = '';
    const signdata = this.cardresult.signData; // 5만원 이상 결제할 경우 sign data 전송
    if (Utils.isNotEmpty(signdata)) {
      ccard.setPaymentSignature = signdata;
    }
    ccard.setPaymentModeData = new PaymentModeData(PaymentModes.CREDITCARD);
    ccard.setCurrencyData = new CurrencyData();
    return ccard;
  }

  /**
   * 신용카드 정보 입력 및 결제 단말기 인식 후,
   * 실물 키보드에서 Enter 키 터치 시 결제 정보가 PG사로 넘어감
   */
  private nicePay() {
    this.alertsubscription = this.alert.alertState.subscribe(
      (state: AlertState) => {
        if (state.show) {
          setTimeout(() => {
            this.paid.nativeElement.value = this.paidamount;
            this.change = 0;
            this.paid.nativeElement.blur();
          }, 50);
        }
      }
    );
    if (this.paymentType === 'n') {
      if (this.change === 0) {
        this.cardPayAndPlaceOrder();
      }
    } else {
      this.cardPay();
    }
  }

  /**
   * 카드결제만 진행
   */
  private cardPay() {
    if (this.change >= 0) {
      this.spinner.show();
      const paidprice = this.paid.nativeElement.value ? Number(this.paid.nativeElement.value) : 0;
      this.storage.setPay(this.paidamount - paidprice); // 현재까지 결제할 남은 금액(전체결제금액 - 실결제금액)을 세션에 저장
      const resultNotifier: Subject<CardApprovalResult> = this.nicepay.cardApproval(String(paidprice), this.getInstallment());
      this.logger.set('credit.card.component', 'listening on reading credit card...').debug();
      resultNotifier.subscribe(
        (res: CardApprovalResult) => {
          this.cardresult = res;
          if (res.code !== NiceConstants.ERROR_CODE.NORMAL) {
            this.finishStatus = 'retry';
            this.apprmessage = res.msg;
            this.dupcheck = false;
          } else {
            if (res.approved) {
              this.finishStatus = StatusDisplay.PAID;
              this.cardnumber = res.maskedCardNumber;
              this.cardcompany = res.issuerName;
              this.cardauthnumber = res.approvalNumber;
              this.paidDate = Utils.convertDate(res.approvalDateTime);
              this.paymentcapture = this.makePaymentCaptureData(paidprice).capturePaymentInfoData;
              this.result = this.paymentcapture;
              this.logger.set('credit.card.component', 'credit card payment : ' + Utils.stringify(this.paymentcapture)).debug();
              if (this.change === 0) { // 더이상 결제할 금액이 없으므로 완료처리함.
                this.apprmessage = this.message.get('card.payment.success'); // '카드결제 승인이 완료되었습니다.';
                // this.completePayPopup(paidprice, this.paidamount, this.change);
              } else {
                this.apprmessage = this.message.get('card.payment.success.next'); // '카드결제 승인이 완료되었습니다.';
              }
            } else {
              this.finishStatus = 'fail';
              this.apprmessage = res.resultMsg1 + ' ' + res.resultMsg2;
            }
          }
        },
        error => {
          this.spinner.hide();
          this.logger.set('credit.card.component', `${error}`).error();
          this.storage.removePaymentModeCode();
        },
        () => { this.spinner.hide(); });
    } else {
      this.checktype = -2;
      this.apprmessage = this.message.get('credit.valid.overpaid'); // '실결제금액이 총 매출보다 큽니다.';
    }
  }

  /**
   * 카드 결제 VAN사에 전송하고 Payment처리
   */
  private cardPayAndPlaceOrder() {
    this.spinner.show();
    const paidprice = this.paid.nativeElement.value ? Number(this.paid.nativeElement.value) : 0;
    const resultNotifier: Subject<CardApprovalResult> = this.nicepay.cardApproval(String(paidprice), this.getInstallment());
    this.logger.set('credit.card.component', 'listening on reading credit card...').debug();
    resultNotifier.subscribe((res: CardApprovalResult) => {
      this.cardresult = res;
      if (res.code !== NiceConstants.ERROR_CODE.NORMAL) {
        this.finishStatus = 'retry';
        this.apprmessage = res.msg;
        this.dupcheck = false;
      } else {
        if (res.approved) {
          this.cardnumber = res.maskedCardNumber;
          this.cardcompany = res.issuerName;
          this.cardauthnumber = res.approvalNumber;
          this.paidDate = Utils.convertDate(res.approvalDateTime);
          const capturepaymentinfo = this.makePaymentCaptureData(paidprice);
          this.paymentcapture = capturepaymentinfo.capturePaymentInfoData;
          this.logger.set('credit.card.component', 'credit card payment : ' + Utils.stringify(this.paymentcapture)).debug();
          this.paymentsubscription = this.payments.placeOrder(this.accountInfo.parties[0].uid, this.cartInfo.code, capturepaymentinfo).subscribe(
            result => {
              this.orderInfo = result;
              this.logger.set('credit.card.component', `payment capture and place order status : ${result.status}, status display : ${result.statusDisplay}`).debug();
              this.finishStatus = result.statusDisplay;
              if (Utils.isNotEmpty(result.code)) { // 결제정보가 있을 경우
                if (this.finishStatus === StatusDisplay.CREATED || this.finishStatus === StatusDisplay.PAID) {
                  this.apprmessage = this.message.get('payment.success'); // '결제가 완료되었습니다.';
                  this.paidDate = result.created ? result.created : new Date();
                  // 장바구니에 정보를 보내야함. capture 정보, order 정보
                  // this.info.sendInfo('payinfo', [this.paymentcapture, this.orderInfo]);
                  this.sendPaymentAndOrder(this.paymentcapture, this.orderInfo);
                  setTimeout(() => {
                    this.paid.nativeElement.blur(); // keydown.enter 처리 안되도록
                    this.renderer.setAttribute(this.paid.nativeElement, 'readonly', 'readonly');
                  }, 5);
                } else if (this.finishStatus === StatusDisplay.PAYMENTFAILED) { // CART 삭제 --> 장바구니의 entry 정보로 CART 재생성
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
            }, error => {
              this.spinner.hide();
              this.finishStatus = 'fail';
              this.storage.removePaymentModeCode();
              const errdata = Utils.getError(error);
              if (errdata) {
                this.apprmessage = errdata.message;
              }
            },
            () => { this.spinner.hide(); });
        } else {
          this.finishStatus = 'fail';
          this.alert.error({ message: `${res.resultMsg1} ${res.resultMsg2}` });
          this.apprmessage = res.resultMsg1 + ' ' + res.resultMsg2;
        }
      }
      this.storage.removePay();
    });
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

  payCancel() {
    if (this.cardresult && this.cardresult.approved) {
      this.spinner.show();
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
        error => {
          this.spinner.hide();
          this.logger.set('credit.card.component', `${error}`).error();
        },
        () => { this.spinner.hide(); /*this.close();*/ }
      );
    } else {
      /*this.close();*/
    }
  }

  /**
   * 일반 결제완료 후 Enter Key 치면 팝업 닫힘
   * 일반결제 : 카트 및 클라이언트 초기화, 영수증 출력
   * 복합결제 : 카트 및 클라이언트 갱신
   */
  private payFinishByEnter() {
    if (this.finishStatus === StatusDisplay.CREATED || this.finishStatus === StatusDisplay.PAID) {
      if (this.paymentType === 'n') { // 일반결제
        this.receipt.print(this.accountInfo, this.cartInfo, this.orderInfo, this.paymentcapture, {});
        this.logger.set('credit.card.component', '일반결제 장바구니 초기화...').debug();
        this.info.sendInfo('orderClear', 'clear');
        this.close();
      } else { // 복합결제
        const change = this.paidamount - this.paid.nativeElement.value;
        if (change === 0) {
          const paidprice = this.paid.nativeElement.value ? Number(this.paid.nativeElement.value) : 0;
          this.completePayPopup(paidprice, this.paidamount, this.change);
          // this.receipt.print(this.accountInfo, this.cartInfo, this.orderInfo, this.paymentcapture);
          // this.logger.set('credit.card.component', '복합 결제 장바구니 초기화...').debug();
          // this.info.sendInfo('orderClear', 'clear');
        } else {
          this.result = this.paymentcapture;
          this.close();
        }
      }
    } else if (this.finishStatus === 'recart') {
      this.info.sendInfo('recart', this.orderInfo);
      this.info.sendInfo('orderClear', 'clear');
      this.close();
    } else {
      this.info.sendInfo('orderClear', 'clear');
      this.close();
    }
  }

  @HostListener('document:keydown', ['$event'])
  onCreditCardPay(event: any) {
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
