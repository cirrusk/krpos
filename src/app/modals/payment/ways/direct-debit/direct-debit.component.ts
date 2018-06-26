import { Component, OnInit, ViewChild, ElementRef, OnDestroy, Renderer2, HostListener } from '@angular/core';
import { Subscription } from 'rxjs/Subscription';

import { ModalComponent, ModalService, AlertService, SpinnerService, Logger, PrinterService } from '../../../../core';
import {
  PaymentCapture, DirectDebitPaymentInfo, PaymentModes, PaymentModeData,
  CurrencyData, Accounts, BankTypes, StatusDisplay, KeyCode
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
  paidamount: number;
  accountnumber: string;
  bank: string;
  bankid: string;
  depositor: string;
  finishStatus: string;                                // 결제완료 상태
  paidDate: Date;
  @ViewChild('ddpassword') private ddpassword: ElementRef;
  constructor(protected modalService: ModalService, private receipt: ReceiptService, private printer: PrinterService, private payments: PaymentService,
    private logger: Logger, private info: InfoBroker, private alert: AlertService, private spinner: SpinnerService, private renderer: Renderer2) {
    super(modalService);
    this.finishStatus = null;
  }

  ngOnInit() {
    this.accountInfo = this.callerData.accountInfo;
    this.cartInfo = this.callerData.cartInfo;
    this.paidamount = this.cartInfo.totalPrice.value;
    this.setDirectDebitInfo();
  }

  ngOnDestroy() {
    if (this.paymentsubscription) { this.paymentsubscription.unsubscribe(); }
  }

  private setDirectDebitInfo() {
    const banks: Array<BankAccount> = this.accountInfo.parties[0].bankAccounts;
    banks.forEach(bankaccount => {
      if (bankaccount.typeCode === BankTypes.DIRECT_DEBIT) {
        this.accountnumber = bankaccount.accountNumber;
        this.bank = bankaccount.bankInfo ? bankaccount.bankInfo.name : '';
        this.bankid = bankaccount.bankInfo ? bankaccount.bankInfo.code : '';
        this.depositor = bankaccount.depositor ? bankaccount.depositor : '';
      }
    });
  }

  private makePaymentCaptureData(paidamount: number): PaymentCapture {
    const directdebit = new DirectDebitPaymentInfo(paidamount);
    directdebit.setAccountNumber = this.accountnumber;
    directdebit.setBank = this.bank;
    directdebit.setBankIDNumber = this.bankid;
    directdebit.setBaOwner = this.depositor;
    directdebit.setPaymentModeData = new PaymentModeData(PaymentModes.DIRECTDEBIT);
    directdebit.setCurrencyData = new CurrencyData();
    const paymentcapture = new PaymentCapture();
    paymentcapture.setDirectDebitPaymentInfo = directdebit;
    return paymentcapture;
  }

  pay(evt: KeyboardEvent) {
    evt.preventDefault();
    const pwd = this.ddpassword.nativeElement.value;
    if (pwd) {
      if (this.paymentType === 'n') {
        this.spinner.show();
        this.paymentcapture = this.makePaymentCaptureData(this.paidamount);
        this.logger.set('direct.debit.component', 'direct.debit payment : ' + Utils.stringify(this.paymentcapture)).debug();
        this.paymentsubscription = this.payments.placeOrderWithTimeout(this.accountInfo.uid, this.accountInfo.parties[0].uid, this.cartInfo.code, this.paymentcapture).subscribe(
          result => {
            this.orderInfo = result;
            this.logger.set('direct.debit.component', `payment capture and place order status : ${result.status}, status display : ${result.statusDisplay}`).debug();
            this.finishStatus = result.statusDisplay;
            if (Utils.isNotEmpty(result.code)) { // 결제정보가 있을 경우
              if (this.finishStatus === StatusDisplay.CREATED) {
                this.paidDate = result.created ? result.created : new Date();

                setTimeout(() => { // 결제 성공, 변경못하도록 처리
                  this.ddpassword.nativeElement.blur(); // keydown.enter 처리 안되도록
                  this.renderer.setAttribute(this.ddpassword.nativeElement, 'readonly', 'readonly');
                }, 5);

              } else if (this.finishStatus === StatusDisplay.PAYMENTFAILED) { // CART 삭제되지 않은 상태, 다른 지불 수단으로 처리
                this.alert.warn({ title: '경고', message: `즉시 출금이 불가합니다.<br>다른 결제 수단을 이용해주세요.` });
              } else { // CART 삭제된 상태
                this.alert.warn({ title: '경고', message: `즉시 출금이 불가합니다.<br>다른 결제 수단을 이용해주세요.` });
              }
            } else { // 결제정보 없는 경우, CART 삭제 --> 장바구니의 entry 정보로 CART 재생성
              this.alert.warn({ title: '경고', message: `즉시 출금이 불가합니다.<br>다른 결제 수단을 이용해주세요.` });
              // cart-list.component에 재생성 이벤트 보내서 처리
            }
          },
          error => {
            this.finishStatus = 'fail';
            this.spinner.hide();
            const errdata = Utils.getError(error);
            if (errdata) {
              this.logger.set('direct.debit.component', `${errdata.message}`).error();
            }
          },
          () => { this.spinner.hide(); });
      }
    } else {
      this.alert.show({ message: '비밀번호가 공란입니다.' });
    }

  }

  close() {
    this.closeModal();
  }

  cartInitAndClose() {
    if (this.paymentType === 'n') { // 일반결제
      if (this.finishStatus === StatusDisplay.CREATED) {
        const rtn = this.receipt.print(this.accountInfo, this.cartInfo, this.orderInfo, this.paymentcapture);
        if (rtn) {
          this.logger.set('cash.component', '일반결제 장바구니 초기화...').debug();
          this.info.sendInfo('orderClear', 'clear');
        } else {
          this.alert.show({ message: '실패' });
        }
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
      if (this.finishStatus === StatusDisplay.CREATED) {
        this.cartInitAndClose();
      }
    }
  }

}
