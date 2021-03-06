import { Component, OnInit, ViewChild, ElementRef, Renderer2, HostListener, OnDestroy } from '@angular/core';
import { Subscription } from 'rxjs/Subscription';
import { Subject } from 'rxjs/Subject';

import { InstallmentPlanComponent } from './installment-plan/installment-plan.component';
import { CompletePaymentComponent } from '../../complete-payment/complete-payment.component';
import { ReceiptService, MessageService, PaymentService, CartService } from '../../../../service';
import {
  ModalComponent, ModalService, NicePaymentService,
  Logger, AlertService, AlertState, Modal, StorageService,
  CardApprovalResult, NiceConstants, SpinnerService, Config, KeyCommand, KeyboardService
} from '../../../../core';
import {
  PaymentCapture, Accounts, KeyCode, StatusDisplay, AmwayExtendedOrdering, ModalIds
} from '../../../../data';
import { Order } from '../../../../data/models/order/order';
import { Cart } from '../../../../data/models/order/cart';
import { InfoBroker } from '../../../../broker';
import { Utils } from '../../../../core/utils';

/**
 * 신용카드 결제 컴포넌트
 *
 */
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
  installmentDisabled: boolean;
  isAllPay = false;
  private regex: RegExp = /[^0-9]+/g;
  private installment: string;
  private orderInfo: Order;
  private cartInfo: Cart;
  private accountInfo: Accounts;
  private amwayExtendedOrdering: AmwayExtendedOrdering;
  private paymentcapture: PaymentCapture;
  private cardresult: CardApprovalResult;
  private paymentsubscription: Subscription;
  private alertsubscription: Subscription;
  private keyboardsubscription: Subscription;
  private dupcheck = false;
  private checkinstallment: number;
  private installcheckPrice: number;
  private creditcardMinPrice: number;
  @ViewChild('paid') private paid: ElementRef;
  @ViewChild('installmentPeriod') private installmentPeriod: ElementRef;
  @ViewChild('allCheck') private allCheck: ElementRef;
  @ViewChild('partCheck') private partCheck: ElementRef;

  // spinnerService 는 HostListener 사용중
  constructor(protected modalService: ModalService, private receipt: ReceiptService, private spinner: SpinnerService, private keyboard: KeyboardService,
    private nicepay: NicePaymentService, private payment: PaymentService, private modal: Modal, private storage: StorageService,
    private message: MessageService, private alert: AlertService, private info: InfoBroker, private config: Config,
    private logger: Logger, private renderer: Renderer2, private cartService: CartService) {
    super(modalService);
    this.installment = '00';
    this.finishStatus = null;
    this.checktype = 0;
    this.checkinstallment = 0;
    this.installmentDisabled = true;
  }

  ngOnInit() {
    this.keyboardsubscription = this.keyboard.commands.subscribe(c => {
      this.handleKeyboardCommand(c);
    });
    this.installmentCheck();
    this.installcheckPrice = this.config.getConfig('installcheckPrice', 50000);
    this.creditcardMinPrice = this.config.getConfig('creditcardMinPrice', 200);
    this.accountInfo = this.callerData.accountInfo;
    this.cartInfo = this.callerData.cartInfo;
    this.amwayExtendedOrdering = this.callerData.amwayExtendedOrdering;
    if (this.callerData.paymentCapture) { this.paymentcapture = this.callerData.paymentCapture; }
    this.loadPayment();
  }

  ngOnDestroy() {
    if (this.paymentsubscription) { this.paymentsubscription.unsubscribe(); }
    if (this.alertsubscription) { this.alertsubscription.unsubscribe(); }
    if (this.keyboardsubscription) { this.keyboardsubscription.unsubscribe(); }
    this.receipt.dispose();
  }

  private loadPayment() {
    this.paidamount = this.cartService.getTotalPriceWithTax(this.cartInfo); // this.cartInfo.totalPrice.value; // 원 결제 금액
    const p: PaymentCapture = this.paymentcapture || this.storage.getPaymentCapture();
    if (p && p.ccPaymentInfo) {
      this.paid.nativeElement.value = p.ccPaymentInfo.amount;
      const i = p.ccPaymentInfo.installmentPlan;
      if (i === '0' || i === '00') {
        this.checkInstallment(0);
      } else {
        this.checkInstallment(1);
        this.installmentPeriod.nativeElement.value = p.ccPaymentInfo.installmentPlan;
        this.cardnumber = p.ccPaymentInfo.cardNumber;
        this.cardcompany = p.ccPaymentInfo.paymentInfoLine1 ? p.ccPaymentInfo.paymentInfoLine1 : '';
        this.cardauthnumber = p.ccPaymentInfo.cardAuthNumber;
        this.paidDate = Utils.convertDate(p.ccPaymentInfo.cardRequestDate);
      }
    } else {
      if (this.storage.getPay() > 0) {
        this.paidamount = this.storage.getPay();
      } else {
        this.paidamount = this.cartService.getPaymentPriceByPaid(this.paymentcapture, this.cartInfo);
      }
      this.checkInstallment(0); // 초기 일시불 설정
      this.renderer.setAttribute(this.allCheck.nativeElement, 'disabled', 'disabled');
      this.renderer.setAttribute(this.partCheck.nativeElement, 'disabled', 'disabled');
    }
    this.paidCal(this.paid.nativeElement.value);
    setTimeout(() => { this.paid.nativeElement.focus(); this.paid.nativeElement.select(); }, 50);
  }

  /**
   * 실결제 금액 입력 시 잔액 계산
   * 결제 금액이 5만원 이상인 경우만 할부를 할 수 있음.
   * 결제 금액은 최소 금액 200원 이상 결제해야함.
   *
   * @param paid 실결제 금액
   */
  paidCal(paid: string) {
    const nPaid = paid ? Number(paid.replace(this.regex, '')) : 0;
    if (nPaid < this.creditcardMinPrice) {
      this.checktype = -4;
      this.apprmessage = this.message.get('card.min.price');
      return;
    }
    this.change = this.paidamount - nPaid;
    if (this.change < 0) {
      this.checktype = -2;
      this.apprmessage = this.message.get('payment.valid.overpaid'); // '실결제금액이 총 매출보다 큽니다.';
    } else {
      this.checktype = 0;
      this.apprmessage = '';
    }
    if (this.checktype === 0 && nPaid >= this.installcheckPrice) {
      this.renderer.removeAttribute(this.allCheck.nativeElement, 'disabled');
      this.renderer.removeAttribute(this.partCheck.nativeElement, 'disabled');
    } else {
      this.allCheck.nativeElement.checked = true;
      this.renderer.setAttribute(this.installmentPeriod.nativeElement, 'disabled', 'disabled');
      this.renderer.setAttribute(this.allCheck.nativeElement, 'disabled', 'disabled');
      this.renderer.setAttribute(this.partCheck.nativeElement, 'disabled', 'disabled');
    }
  }

  /**
   * 실결제금액에서 엔터키 입력시 결제 진행
   *
   * 조건
   * 일시불인 경우 결제 바로 결제 진행
   * 할부인 경우 할부가 입력되었을 경우 바로 결제 진행
   *
   * @param evt 키보드 이벤트
   * @param paid 실결제금액
   */
  paidEnter(paid: string) {
    const nPaid = Number(paid.replace(this.regex, ''));
    if (nPaid > 0) {
      const checked = this.checkinstallment === 1 ? true : false;
      if (checked) { // 할부
        const val = this.installmentPeriod.nativeElement.value;
        if (Utils.isEmpty(val)) {
          setTimeout(() => { this.installmentPeriod.nativeElement.focus(); }, 50);
        } else {
          this.doPay();
        }
      } else { // 일시불
        this.doPay();
      }
    }
  }

  /**
   * 할부개월 validation 체크
   */
  installmentCheck(installment?: string) {
    let val;
    if (installment) {
      val = installment.replace(this.regex, '');
    } else {
      val = this.installmentPeriod.nativeElement.value;
    }
    if (Utils.isEmpty(val) || val === '1') {
      this.checktype = -5;
      this.apprmessage = '할부개월을 입력해주세요.';
    } else {
      const valnum: number = Number(val);
      if (valnum > 24) {
        this.checktype = -5;
        this.apprmessage = '할부개월은 24개월을 넘을 수 없습니다.';
      } else {
        this.installmentPeriod.nativeElement.value = val.replace(this.regex, '');
        this.checktype = 0;
      }
    }
  }

  /**
   * 할부일 경우 엔터 입력시 바로 결제
   * 일시불일 경우는 처리안함.
   */
  installmentEnter(paid: string, installment: string) {
    const nPaid = paid ? Number(paid.replace(this.regex, '')) : 0;
    if (nPaid > 0) {
      const checked = this.checkinstallment === 1 ? true : false;
      if (checked) { // 할부
        let val = installment;
        if (val) {
          val = val.replace(this.regex, '');
        }
        if (Utils.isEmpty(val) || val === '1') {
          this.checktype = -5;
          this.apprmessage = '할부개월을 입력해주세요.';
          setTimeout(() => { this.installmentPeriod.nativeElement.focus(); }, 50);
        } else {
          const valnum: number = Number(val);
          if (valnum > 24) {
            this.checktype = -5;
            this.apprmessage = '할부개월은 24개월을 넘을 수 없습니다.';
          } else {
            this.checktype = 0;
            this.doPay();
          }
        }
      }
    }
  }

  /**
   * 일시불/할부 여부 체크
   *
   * @param type 일시부(0)/할부(1) 여부
   */
  checkInstallment(type: number) {
    this.installmentPeriod.nativeElement.value = '';
    this.checkinstallment = type;
    if (type === 0) { // 일시불
      this.installment = '00';
      this.isAllPay = true;
      setTimeout(() => {
        this.renderer.setAttribute(this.installmentPeriod.nativeElement, 'disabled', 'disabled');
      }, 50);
    } else { // 할부
      this.isAllPay = false;
      this.renderer.removeAttribute(this.installmentPeriod.nativeElement, 'disabled');
      setTimeout(() => {
        this.installmentPeriod.nativeElement.focus(); this.installmentPeriod.nativeElement.select();
      }, 150);
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
      modalId: ModalIds.INSTALLMENT
    });
  }

  /**
   * 할부 개월 수 패딩처리
   */
  private getInstallment(): string {
    const insmnt: string = this.installmentPeriod.nativeElement.value;
    const strinst = Utils.padLeft(insmnt, '0', 2);
    this.installment = strinst;
    return strinst;
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
    this.cardPay();
  }

  /**
   * 카드결제만 진행
   * 결제금액과 할부개월 수와의 처리 로직이 있을 경우 추가
   * ex) 1,000원 결제하는데 3개월 할부를 할 경우 Van 사에서 오류처리됨.
   */
  private cardPay() {
    const paid = Number(this.paid.nativeElement.value.replace(this.regex, ''));
    if (paid < this.creditcardMinPrice) {
      this.checktype = -4;
      this.apprmessage = this.message.get('card.min.price');
      return;
    }
    this.change = this.paidamount - paid;
    if (this.change >= 0) {
      // this.alert.info({ title: '확인', message: '카드를 단말기에 읽혀주세요.', timer: true, interval: 5000 });
      const paidprice = this.paid.nativeElement.value ? paid : 0;
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
            this.spinner.hide();
          } else {
            if (res.approved) {
              this.finishStatus = StatusDisplay.PAID;
              this.cardnumber = res.maskedCardNumber;
              this.cardcompany = res.issuerName;
              this.cardauthnumber = res.approvalNumber;
              this.paidDate = Utils.convertDate(res.approvalDateTime);
              this.paymentcapture = this.payment.makeCCPaymentCaptureData(this.paymentcapture, this.cardresult, paidprice).capturePaymentInfoData;
              this.result = this.paymentcapture;
              this.logger.set('credit.card.component', 'credit card payment : ' + Utils.stringify(this.paymentcapture)).debug();
              if (this.change === 0) { // 더이상 결제할 금액이 없으므로 완료처리함.
                this.apprmessage = this.message.get('card.payment.success'); // '카드결제 승인이 완료되었습니다.';
              } else {
                this.apprmessage = this.message.get('card.payment.success.next'); // '카드결제 승인이 완료되었습니다.';
              }
              this.payment.sendPaymentAndOrderInfo(this.paymentcapture, null);
            } else {
              this.finishStatus = 'fail';
              this.apprmessage = res.resultMsg1 + ' ' + res.resultMsg2;
            }
            this.spinner.hide();
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
      this.apprmessage = this.message.get('payment.valid.overpaid'); // '실결제금액이 총 매출보다 큽니다.';
      setTimeout(() => { this.paid.nativeElement.focus(); this.paid.nativeElement.select(); }, 50);
    }
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
      modalId: ModalIds.COMPLETE,
      paymentType: 'c'
    });
  }

  close() {
    this.spinner.hide();
    this.closeModal();
  }

  /**
   * 일반 결제완료 후 Enter Key 치면 팝업 닫힘
   * 일반결제 : 카트 및 클라이언트 초기화, 영수증 출력
   * 복합결제 : 카트 및 클라이언트 갱신
   */
  private payFinishByEnter() {
    if (Utils.isPaymentSuccess(this.finishStatus)) {
      const paid = this.paid.nativeElement.value ? Number(this.paid.nativeElement.value.replace(this.regex, '')) : 0;
      const change = this.paidamount - paid;
      if (change === 0) {
        this.completePayPopup(paid, this.paidamount, this.change);
      } else {
        this.result = this.paymentcapture;
        this.close();
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

  @HostListener('document:keydown', ['$event', 'this.spinner.status()'])
  onCreditCardPay(event: any, isSpinnerStatus: boolean) {
    event.stopPropagation();
    if (event.target.tagName === 'INPUT') { return; }
    if (event.keyCode === KeyCode.ENTER && !isSpinnerStatus) {
      const modalid = this.storage.getLatestModalId();
      if (modalid !== ModalIds.COMPLETE) {
        this.doPay();
      }
    } else if (event.keyCode === KeyCode.ESCAPE && isSpinnerStatus) {
      this.spinner.hide();
    }
  }

  doPay() {
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

  protected doPageUp(evt: any) {
    this.checkInstallment(0);
  }

  protected doPageDown(evt: any) {
    this.checkInstallment(1);
  }

  private handleKeyboardCommand(command: KeyCommand) {
    try {
      this[command.name](command.ev);
    } catch (e) {
      this.logger.set('keyboard.component', `[${command.combo}] key event, [${command.name}] undefined function!`).info();
    }
  }
}
