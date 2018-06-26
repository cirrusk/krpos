import { Component, OnInit, ViewChild, ElementRef, Renderer2, HostListener, OnDestroy } from '@angular/core';
import { Subscription } from 'rxjs/Subscription';
import { Subject } from 'rxjs/Subject';

import {
  ModalComponent, ModalService, NicePaymentService,
  Logger, AlertService, SpinnerService, AlertState, Modal
} from '../../../../core';
import {
  PaymentCapture, CreditCardPaymentInfo, PaymentModes, PaymentModeData, CurrencyData,
  Accounts, KeyCode, StatusDisplay, CCMemberType, CCPaymentType
} from '../../../../data';
import { Order } from '../../../../data/models/order/order';
import { Cart } from '../../../../data/models/order/cart';
import { ReceiptService, PaymentService } from '../../../../service';
import { CardApprovalResult } from '../../../../core/peripheral/niceterminal/vo/card.approval.result';
import { Utils } from '../../../../core/utils';
import { CardCancelResult } from '../../../../core/peripheral/niceterminal/vo/card.cancel.result';
import { NiceConstants } from '../../../../core/peripheral/niceterminal/nice.constants';
import { InfoBroker } from '../../../../broker';
import { InstallmentPlanComponent } from './installment-plan/installment-plan.component';

@Component({
  selector: 'pos-credit-card',
  templateUrl: './credit-card.component.html'
})
export class CreditCardComponent extends ModalComponent implements OnInit, OnDestroy {

  private installment: string;
  private orderInfo: Order;
  private cartInfo: Cart;
  private accountInfo: Accounts;
  private paymentcapture: PaymentCapture;
  private paymentType: string;
  private cardresult: CardApprovalResult;
  private paymentsubscription: Subscription;
  private alertsubscription: Subscription;
  paidamount: number;
  change: number;
  finishStatus: string;                                // 결제완료 상태
  paidDate: Date;
  cardnumber: string; // 카드번호
  cardcompany: string; // 카드사명
  cardperiod: string; // 유효기간
  cardauthnumber: string; // 승인번호
  @ViewChild('paid') private paid: ElementRef;
  @ViewChild('installmentPeriod') private installmentPeriod: ElementRef;
  @ViewChild('cardpassword') private cardpassword: ElementRef;
  constructor(protected modalService: ModalService, private receipt: ReceiptService,
    private payments: PaymentService, private nicepay: NicePaymentService, private modal: Modal,
    private alert: AlertService, private spinner: SpinnerService, private info: InfoBroker, private logger: Logger, private renderer: Renderer2) {
    super(modalService);
    this.installment = '00';
    this.finishStatus = null;
  }

  ngOnInit() {
    setTimeout(() => { this.renderer.setAttribute(this.installmentPeriod.nativeElement, 'readonly', 'readonly'); }, 50);
    this.accountInfo = this.callerData.accountInfo;
    this.cartInfo = this.callerData.cartInfo;
    this.paidamount = this.cartInfo.totalPrice.value;
    if (this.paymentType === 'n') {
      this.paid.nativeElement.value = this.paidamount;
      this.change = 0;
    } else {
      setTimeout(() => { this.paid.nativeElement.focus(); }, 50);
    }
  }

  ngOnDestroy() {
    if (this.paymentsubscription) { this.paymentsubscription.unsubscribe(); }
    if (this.alertsubscription) { this.alertsubscription.unsubscribe(); }
  }

  /**
   * 실결제 금액 입력 시 잔액 계산
   * @param paid 실결제 금액
   */
  paidCal(paid: number) {
    this.change = this.paidamount - paid;
  }

  /**
   * 엔터입력시 blur 처리되도록
   */
  paidBlur() {
    setTimeout(() => { this.paid.nativeElement.blur(); }, 50);
  }

  /**
   * 일시불/할부 여부 체크
   *
   * @param type 일시부(0)/할부(1) 여부
   */
  checkInstallment(type: number) {
    this.installmentPeriod.nativeElement.value = '';
    if (type === 0) {
      this.installment = '00';
      setTimeout(() => { this.renderer.setAttribute(this.installmentPeriod.nativeElement, 'readonly', 'readonly'); }, 5);
    } else {
      setTimeout(() => { this.renderer.removeAttribute(this.installmentPeriod.nativeElement, 'readonly'); }, 5);
      let insmnt: string = this.installmentPeriod.nativeElement.value;
      if (insmnt) {
        if (insmnt.length === 0) {
          insmnt = '00';
        } else if (insmnt.length === 1) {
          insmnt = '0' + insmnt;
        }
      } else {
        insmnt = '00';
      }
      this.installment = insmnt;
      this.installmentPeriod.nativeElement.focus();
    }
  }

  /**
   * 무이자할부 팝업
   */
  popupInstallmentPlan() {
    this.modal.openModalByComponent(InstallmentPlanComponent,
      {
        callerData: { accountInfo: this.accountInfo, cartInfo: this.cartInfo },
        closeByClickOutside: false,
        closeByEnter: false,
        closeByEscape: false,
        modalId: 'InstallmentPlanComponent'
      }
    );
  }

  /**
   * 임시로 카드 매핑, 나중에 매핑되면 제거
   */
  private getCardCodes(): Map<string, string> {
    const map = new Map([
      ['01', 'B'], // AMEX
      ['02', 'B'], // 국민은행
      ['08', 'B']  // 현대카드
    ]
    );
    return map;
  }


  /**
   * Credit Card Payment Capture 데이터 생성
   *
   * @param paidamount 결제금액
   */
  private makePaymentCaptureData(paidamount: number): PaymentCapture {
    const ccard = this.makePaymentInfo(paidamount);
    const paymentcapture = new PaymentCapture();
    paymentcapture.setCcPaymentInfo = ccard;
    return paymentcapture;
  }

  /**
   * Credit Card Payment Info 생성
   * @param paidamount 결제금액
   */
  private makePaymentInfo(paidamount: number): CreditCardPaymentInfo {
    const signdata = this.cardresult.signData; // 5만원 이상 결제할 경우 sign data 전송
    const ccard = new CreditCardPaymentInfo(paidamount);
    ccard.setCardNumber = this.cardresult.maskedCardNumber;
    ccard.setCardAuthNumber = this.cardresult.approvalNumber; // 승인번호
    ccard.setCardMerchantNumber = this.cardresult.merchantNumber; // 가맹점 번호
    ccard.setCardCompayCode = this.getCardCodes().get(this.cardresult.issuerCode); // this.cardresult.issuerCode;
    ccard.setCardAcquireCode = this.cardresult.acquireCode; // 매입사 코드
    ccard.setCardPassword = this.cardpassword.nativeElement.value;
    ccard.setInstallmentPlan = Number(this.cardresult.installmentMonth) + '';
    ccard.setMemberType = CCMemberType.PERSONAL;
    ccard.setPaymentType = CCPaymentType.GENERAL;
    ccard.setCardType = PaymentModes.CREDITCARD;
    ccard.setTransactionId = ''; // 트랜잭션 ID 아직 NICE IC 단말에서 정보 안나옴. 일단 빈 칸으로 저장 (7월에 나옴)
    const cn = this.cardresult.maskedCardNumber;
    if (cn && cn.length > 4) {
      ccard.setNumber = cn.substring(cn.length - 4); // 카드 번호 뒷 4자리
    }
    ccard.setValidToMonth = '';
    ccard.setValidToYear = '';
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
        this.approvalAndPayment();
      }
    } else {
      if (this.change >= 0) {
        this.approvalAndPayment();
      } else {
        this.alert.show({ message: '실결제금액이 큽니다.' });
      }
    }
  }

  /**
   * 카드 결제 VAN사에 전송하고 Payment처리
   */
  private approvalAndPayment() {
    const paidprice = this.paid.nativeElement.value;
    this.spinner.show();
    const resultNotifier: Subject<CardApprovalResult> = this.nicepay.cardApproval(String(paidprice), this.installment);
    this.logger.set('credit.card.component', 'listening on reading credit card...').debug();
    resultNotifier.subscribe((res: CardApprovalResult) => {
      this.cardresult = res;
      if (res.code !== NiceConstants.ERROR_CODE.NORMAL) {
        this.alert.error({ message: res.msg });
        this.spinner.hide();
      } else {
        if (res.approved) {
          this.cardnumber = res.maskedCardNumber;
          this.cardcompany = res.issuerName;
          this.cardauthnumber = res.approvalNumber;
          this.paidDate = Utils.convertDate(res.approvalDateTime);
          // payment caputure
          this.paymentcapture = this.makePaymentCaptureData(paidprice);
          this.logger.set('credit.card.component', 'credit card payment : ' + Utils.stringify(this.paymentcapture)).debug();
          this.paymentsubscription = this.payments.placeOrder(this.accountInfo.uid, this.accountInfo.parties[0].uid, this.cartInfo.code, this.paymentcapture).subscribe(result => {
            this.orderInfo = result;
            this.logger.set('credit.card.component', `payment capture and place order status : ${result.status}, status display : ${result.statusDisplay}`).debug();
            this.finishStatus = result.statusDisplay;
            if (Utils.isNotEmpty(result.code)) { // 결제정보가 있을 경우
              if (this.finishStatus === StatusDisplay.CREATED || this.finishStatus === StatusDisplay.PAID) {
                this.paidDate = result.created ? result.created : new Date();
                // 장바구니에 정보를 보내야함.
                // capture 정보, order 정보
                this.info.sendInfo('payinfo', [this.paymentcapture, this.orderInfo]);
                setTimeout(() => {
                  this.paid.nativeElement.blur(); // keydown.enter 처리 안되도록
                  this.renderer.setAttribute(this.paid.nativeElement, 'readonly', 'readonly');
                }, 5);
              } else if (this.finishStatus === StatusDisplay.PAYMENTFAILED) { // CART 삭제되지 않은 상태, 다른 지불 수단으로 처리
              } else { // CART 삭제된 상태
              }
            } else { // 결제정보 없는 경우, CART 삭제 --> 장바구니의 entry 정보로 CART 재생성
              // cart-list.component에 재생성 이벤트 보내서 처리
            }
          }, error => {
            this.finishStatus = 'fail';
            this.spinner.hide();
            const errdata = Utils.getError(error);
            if (errdata) {
              this.logger.set('credit.card.component', `${errdata.message}`).error();
            }
          }, () => { this.spinner.hide(); });
        } else {
          this.finishStatus = 'fail';
          this.spinner.hide();
          this.alert.error({ message: `${res.resultMsg1} ${res.resultMsg2}` });
        }
      }
    });
  }

  close() {
    this.closeModal();
  }

  payCancel() {
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
        () => { /*this.close();*/ }
      );
    } else {
      /*this.close();*/
    }
  }

  /**
   * 일반 결제완료 후 Enter Key 치면 팝업 닫힘
   * 일반결제 : 카트 및 클라이언트 초기화
   * 복합결제 : 카트 및 클라이언트 갱신
   */
  cartInitAndClose() {
    if (this.finishStatus === StatusDisplay.CREATED || this.finishStatus === StatusDisplay.PAID) {
      if (this.paymentType === 'n') { // 일반결제
        const rtn = this.receipt.print(this.accountInfo, this.cartInfo, this.orderInfo, this.paymentcapture);
        if (rtn) {
          this.logger.set('cash.component', '일반결제 장바구니 초기화...').debug();
          this.info.sendInfo('orderClear', 'clear');
        } else {
          this.alert.show({ message: '실패' });
        }
        this.close();
      } else { // 복합결제

      }
    }
  }

  @HostListener('document:keydown', ['$event'])
  onKeyBoardDown(event: any) {
    event.stopPropagation();
    if (event.target.tagName === 'INPUT') { return; }
    if (event.keyCode === KeyCode.ENTER) {
      if (this.paymentType === 'n') {
        if (this.cardresult && this.cardresult.approved) {
          this.cartInitAndClose();
        } else {
          this.nicePay();
        }
      } else {
        if (this.cardresult && this.cardresult.approved) {
          this.close();
        } else {
          this.nicePay();
        }
      }
    } else if (event.keyCode === KeyCode.ESCAPE) {
      this.close();
    }
  }
}
