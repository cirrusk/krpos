import { Component, OnInit, ViewChild, ElementRef, OnDestroy, Renderer2, HostListener } from '@angular/core';
import { Subscription } from 'rxjs/Subscription';

import { ModalComponent, ModalService, AlertService, SpinnerService, Logger, PrinterService, AlertState, StorageService } from '../../../../core';
import {
  PaymentCapture, DirectDebitPaymentInfo, PaymentModes, PaymentModeData,
  CurrencyData, Accounts, BankTypes, StatusDisplay, KeyCode, CapturePaymentInfo
} from '../../../../data';
import { Order } from '../../../../data/models/order/order';
import { Cart } from '../../../../data/models/order/cart';
import { BankAccount } from '../../../../data/models/order/bank-account';
import { Utils } from '../../../../core/utils';
import { ReceiptService, PaymentService } from '../../../../service';
import { InfoBroker } from '../../../../broker';
@Component({
  selector: 'pos-direct-debit',
  templateUrl: './direct-debit.component.html'
})
export class DirectDebitComponent extends ModalComponent implements OnInit, OnDestroy {
  private orderInfo: Order;
  private cartInfo: Cart;
  private accountInfo: Accounts;
  private paymentcapture: PaymentCapture;
  private paymentType: string;
  private paymentsubscription: Subscription;
  private alertsubscription: Subscription;
  paidamount: number;
  change: number;
  accountnumber: string;
  authnumber: string;
  bank: string;
  bankid: string;
  depositor: string;
  finishStatus: string;                                // 결제완료 상태
  paidDate: Date;
  checktype: number;
  @ViewChild('paid') private paid: ElementRef;
  @ViewChild('ddpassword') private ddpassword: ElementRef;
  constructor(protected modalService: ModalService, private receipt: ReceiptService,
    private storage: StorageService, private printer: PrinterService, private payments: PaymentService,
    private logger: Logger, private info: InfoBroker, private alert: AlertService, private spinner: SpinnerService, private renderer: Renderer2) {
    super(modalService);
    this.finishStatus = null;
    this.checktype = 0;
    this.change = 0;
  }

  ngOnInit() {
    this.accountInfo = this.callerData.accountInfo;
    this.cartInfo = this.callerData.cartInfo;
    if (this.callerData.paymentCapture) { this.paymentcapture = this.callerData.paymentCapture; }
    this.setDirectDebitInfo();
    if (!this.accountnumber) {
      this.finishStatus = 'fail';
      this.checktype = -1;
      // this.alert.error({ message: '계좌번호가 없으므로 자동이체를 진행할 수 없습니다.' });
      setTimeout(() => {
        this.paid.nativeElement.blur();
        this.renderer.setAttribute(this.paid.nativeElement, 'disabled', 'disabled');
        this.renderer.setAttribute(this.ddpassword.nativeElement, 'disabled', 'disabled');
      }, 50);
    } else {
      this.paidamount = this.cartInfo.totalPrice.value;
      if (this.paymentType === 'n') {
        this.paid.nativeElement.value = this.paidamount;
        setTimeout(() => { this.renderer.setAttribute(this.paid.nativeElement, 'readonly', 'readonly'); }, 50);
      } else {
        if (this.storage.getPay() > 0) {
          this.paidamount = this.storage.getPay();
        }
        setTimeout(() => { this.paid.nativeElement.focus(); }, 50);
      }
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
    if (typeof paid === 'number') {
      this.change = this.paidamount - paid;
    }
  }

  /**
   * 엔터입력시 blur 처리되도록
   */
  paidBlur() {
    setTimeout(() => { this.paid.nativeElement.blur(); }, 50);
  }

  nextStep() {
    const paid = this.paid.nativeElement.value;
    if (paid) {
      setTimeout(() => { this.ddpassword.nativeElement.focus(); }, 50);
    }
  }

  private setDirectDebitInfo() {
    const banks: Array<BankAccount> = this.accountInfo.parties[0].bankAccounts;
    if (banks) {
      banks.forEach(bankaccount => {
        if (bankaccount.typeCode === BankTypes.DIRECT_DEBIT) {
          this.accountnumber = bankaccount.accountNumber;
          this.bank = bankaccount.bankInfo ? bankaccount.bankInfo.name : '';
          this.bankid = bankaccount.bankInfo ? bankaccount.bankInfo.code : '';
          this.depositor = bankaccount.depositor ? bankaccount.depositor : '';
        }
      });
    }
  }

  private makePaymentCaptureData(paidamount: number): CapturePaymentInfo {
    const capturepaymentinfo = new CapturePaymentInfo();
    const directdebit = new DirectDebitPaymentInfo(paidamount);
    directdebit.accountNumber = this.accountnumber;
    directdebit.bank = this.bank;
    directdebit.bankIDNumber = this.bankid;
    directdebit.baOwner = this.depositor;
    directdebit.paymentMode = new PaymentModeData(PaymentModes.DIRECTDEBIT);
    directdebit.currency = new CurrencyData();
    if (this.paymentcapture) {
      if (this.paymentType === 'n') {
        const paymentcapture = new PaymentCapture();
        paymentcapture.directDebitPaymentInfo = directdebit;
        capturepaymentinfo.paymentModeCode = PaymentModes.DIRECTDEBIT;
        capturepaymentinfo.capturePaymentInfoData = paymentcapture;
      } else {
        this.paymentcapture.directDebitPaymentInfo = directdebit;
        capturepaymentinfo.paymentModeCode = this.storage.getPaymentModeCode();
        capturepaymentinfo.capturePaymentInfoData = this.paymentcapture;
      }
    } else {
      const paymentcapture = new PaymentCapture();
      paymentcapture.directDebitPaymentInfo = directdebit;
      capturepaymentinfo.paymentModeCode = this.storage.getPaymentModeCode() ? this.storage.getPaymentModeCode() : PaymentModes.DIRECTDEBIT;
      capturepaymentinfo.capturePaymentInfoData = paymentcapture;
    }
    return capturepaymentinfo;
  }

  pay(evt: KeyboardEvent) {
    evt.preventDefault();
    const pwd = this.ddpassword.nativeElement.value;
    if (pwd) {
      if (this.paymentType === 'n') {
        this.approvalAndPayment();
      } else {
        const paid = this.paid.nativeElement.value; // 결제금액
        if (this.paidamount > paid) { // 다음결제수단
          this.storage.setPay(this.paidamount - paid); // 현재까지 결제할 남은 금액(전체결제금액 - 실결제금액)을 세션에 저장
          this.makePaymentCaptureData(paid);
          this.result = this.paymentcapture;
          this.finishStatus = StatusDisplay.PAID;
        } else if (this.paidamount === paid) {
          this.approvalAndPayment();
        }
      }
    } else {
      this.alert.show({ message: '비밀번호가 공란입니다.' });
      this.alertsubscription = this.alert.alertState.subscribe(
        (state: AlertState) => {
          if (!state.show) {
            setTimeout(() => {
              this.ddpassword.nativeElement.focus();
            }, 50);
          }
        }
      );
    }

  }

  private approvalAndPayment() {
    this.spinner.show();
    const capturepaymentinfo = this.makePaymentCaptureData(this.paidamount);
    this.paymentcapture = capturepaymentinfo.capturePaymentInfoData;
    this.logger.set('direct.debit.component', 'direct.debit payment : ' + Utils.stringify(this.paymentcapture)).debug();
    this.paymentsubscription = this.payments.placeOrderWithTimeout(this.accountInfo.parties[0].uid, this.cartInfo.code, capturepaymentinfo).subscribe(
      result => {
        setTimeout(() => { this.renderer.setAttribute(this.ddpassword.nativeElement, 'readonly', 'readonly'); }, 50);
        this.orderInfo = result;
        this.logger.set('direct.debit.component', `payment capture and place order status : ${result.status}, status display : ${result.statusDisplay}`).debug();
        this.finishStatus = result.statusDisplay;
        if (Utils.isNotEmpty(result.code)) { // 결제정보가 있을 경우
          if (this.finishStatus === StatusDisplay.CREATED || this.finishStatus === StatusDisplay.PAID) {
            this.paidDate = result.created ? result.created : new Date();
            setTimeout(() => { this.renderer.setAttribute(this.ddpassword.nativeElement, 'readonly', 'readonly'); }, 5);
            // this.info.sendInfo('payinfo', [this.paymentcapture, this.orderInfo]);
            this.sendPaymentAndOrder(this.paymentcapture, this.orderInfo);
          } else if (this.finishStatus === StatusDisplay.PAYMENTFAILED) { // CART 삭제되지 않은 상태, 다른 지불 수단으로 처리
            this.alert.warn({ title: '경고', message: `즉시 출금이 불가합니다.<br>다른 결제 수단을 이용해주세요.` });
          } else { // CART 삭제된 상태
            this.alert.warn({ title: '경고', message: `즉시 출금이 불가합니다.<br>다른 결제 수단을 이용해주세요.` });
          }
        } else { // 결제정보 없는 경우, CART 삭제 --> 장바구니의 entry 정보로 CART 재생성
          this.alert.warn({ title: '경고', message: `즉시 출금이 불가합니다.<br>다른 결제 수단을 이용해주세요.` });
          // cart-list.component에 재생성 이벤트 보내서 처리
          this.info.sendInfo('recart', this.orderInfo);
        }
        this.storage.removePay();
      }, error => {
        this.finishStatus = 'fail';
        this.spinner.hide();
        const errdata = Utils.getError(error);
        if (errdata) {
          this.logger.set('direct.debit.component', `${errdata.message}`).error();
        }
      }, () => { this.spinner.hide(); });
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

  cartInitAndClose() {

    if (this.paymentType === 'n') { // 일반결제
      if (this.finishStatus === StatusDisplay.CREATED || this.finishStatus === StatusDisplay.PAID) {
        this.receipt.print(this.accountInfo, this.cartInfo, this.orderInfo, this.paymentcapture);
        this.logger.set('cash.component', '일반결제 장바구니 초기화...').debug();
        this.info.sendInfo('orderClear', 'clear');
      }
      this.close();
    } else {
      console.log('복합결제일 경우...');
    }
  }

  @HostListener('document:keydown', ['$event'])
  onKeyBoardDown(event: any) {
    event.stopPropagation();
    if (event.target.tagName === 'INPUT') { return; }
    if (event.keyCode === KeyCode.ENTER) {
      if (this.finishStatus === StatusDisplay.CREATED || this.finishStatus === StatusDisplay.PAID) {
        this.cartInitAndClose();
      } else if (this.finishStatus === 'fail') {
        this.close();
      }
    }
  }

}
