import { Component, OnInit, ViewChild, ElementRef, OnDestroy, Renderer2, HostListener } from '@angular/core';
import { Subscription } from 'rxjs/Subscription';

import { CompletePaymentComponent } from '../../complete-payment/complete-payment.component';
import { ModalComponent, ModalService, StorageService, Modal, Config, SpinnerService } from '../../../../core';
import {
  PaymentCapture, Accounts, BankTypes, StatusDisplay, KeyCode, AmwayExtendedOrdering, ModalIds
} from '../../../../data';
import { ReceiptService, MessageService, PaymentService, CartService } from '../../../../service';
import { Order } from '../../../../data/models/order/order';
import { Cart } from '../../../../data/models/order/cart';
import { BankAccount } from '../../../../data/models/order/bank-account';
import { Utils } from '../../../../core/utils';
import { InfoBroker } from '../../../../broker';

@Component({
  selector: 'pos-direct-debit',
  templateUrl: './direct-debit.component.html'
})
export class DirectDebitComponent extends ModalComponent implements OnInit, OnDestroy {
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
  apprmessage: string;
  private dupcheck = false;
  private regex: RegExp = /[^0-9]+/g;
  private orderInfo: Order;
  private cartInfo: Cart;
  private accountInfo: Accounts;
  private bankInfo: BankAccount;
  private amwayExtendedOrdering: AmwayExtendedOrdering;
  private paymentcapture: PaymentCapture;
  private paymentsubscription: Subscription;
  private alertsubscription: Subscription;
  private directdebitminPrice: number;
  @ViewChild('paid') private paid: ElementRef;
  @ViewChild('ddpassword') private ddpassword: ElementRef;

  // spinnerService 는 HostListener 사용중
  constructor(protected modalService: ModalService, private receipt: ReceiptService, private modal: Modal,
    private storage: StorageService, private message: MessageService, private payment: PaymentService,
    private info: InfoBroker, private renderer: Renderer2, private config: Config, private spinnerService: SpinnerService,
    private cartService: CartService) {
    super(modalService);
    this.finishStatus = null;
    this.checktype = 0;
    this.change = 0;
  }

  ngOnInit() {
    this.directdebitminPrice = this.config.getConfig('directdebitMinPrice', 1);
    this.accountInfo = this.callerData.accountInfo;
    this.cartInfo = this.callerData.cartInfo;
    this.amwayExtendedOrdering = this.callerData.amwayExtendedOrdering;
    if (this.callerData.paymentCapture) { this.paymentcapture = this.callerData.paymentCapture; }
    this.setDirectDebitInfo();
    if (!this.accountnumber) {
      // this.checktype = -1;
      this.finishStatus = 'not_processing';
      this.apprmessage = this.message.get('no.accountnumber'); // '계좌번호가 없으므로 자동이체를 진행할 수 없습니다.';
      this.dupcheck = false;
      setTimeout(() => {
        // this.paid.nativeElement.blur();
        this.renderer.setAttribute(this.paid.nativeElement, 'disabled', 'disabled');
        this.renderer.setAttribute(this.ddpassword.nativeElement, 'disabled', 'disabled');
      }, 50);
    } else {
      this.loadPayment();
    }
  }

  ngOnDestroy() {
    if (this.paymentsubscription) { this.paymentsubscription.unsubscribe(); }
    if (this.alertsubscription) { this.alertsubscription.unsubscribe(); }
    this.receipt.dispose();
  }

  private loadPayment() {
    this.paidamount = this.cartService.getTotalPriceWithTax(this.cartInfo); // this.cartInfo.totalPrice.value;
    const p: PaymentCapture = this.paymentcapture || this.storage.getPaymentCapture();
    if (p && p.directDebitPaymentInfo) {
      this.paid.nativeElement.value = p.directDebitPaymentInfo.amount;
      this.paidCal(this.paid.nativeElement.value);
    } else {
      if (this.storage.getPay() > 0) {
        this.paidamount = this.storage.getPay();
      } else {
        this.paidamount = this.cartService.getPaymentPriceByPaid(this.paymentcapture, this.cartInfo);
      }
    }
    setTimeout(() => { this.paid.nativeElement.focus(); this.paid.nativeElement.select(); }, 50);
  }

  /**
  * 실결제 금액 입력 시 잔액 계산
  * @param paid 실결제 금액
  */
  paidCal(paid: string) {
    const nPaid = Number(paid.replace(this.regex, ''));
    if (typeof nPaid === 'number' || nPaid !== '') {
      if (nPaid < this.directdebitminPrice) {
        this.checktype = -4;
        this.dupcheck = false;
        this.apprmessage = this.message.get('debit.min.price');
        return;
      }
      this.change = this.paidamount - nPaid;
      if (this.change < 0) {
        this.change = 0;
        this.checktype = -3;
        this.dupcheck = false;
        this.apprmessage = this.message.get('payment.valid.overpaid');
      } else {
        this.checktype = 0;
      }
    }
  }

  nextStep() {
    const paid = Number(this.paid.nativeElement.value.replace(this.regex, ''));
    const change = this.paidamount - paid;
    if (paid && change >= 0) {
      setTimeout(() => { this.ddpassword.nativeElement.focus(); }, 50);
    } else {
      setTimeout(() => { this.paid.nativeElement.focus(); this.paid.nativeElement.select(); }, 50);
    }
  }

  /**
   * 자동이체 정보 설정
   */
  private setDirectDebitInfo() {
    const banks: Array<BankAccount> = this.accountInfo.parties[0].bankAccounts;
    if (banks) {
      banks.forEach(bankaccount => {
        if (bankaccount.typeCode === BankTypes.DIRECT_DEBIT) {
          this.accountnumber = bankaccount.accountNumber;
          this.bank = bankaccount.bankInfo ? bankaccount.bankInfo.name : '';
          this.bankid = bankaccount.bankInfo ? bankaccount.bankInfo.code : '';
          this.depositor = bankaccount.depositor ? bankaccount.depositor : '';
          this.bankInfo = bankaccount;
        }
      });
    }
  }

  checkpwd(pwd: string) {
    if (Utils.isNotEmpty(pwd)) {
      this.checktype = 0;
    } else {
      this.checktype = -2;
      this.dupcheck = false;
      this.apprmessage = this.message.get('empty.password'); // '비밀번호가 공란입니다.';
    }
  }

  pay(evt: KeyboardEvent) {
    evt.preventDefault();
    const pwd = this.ddpassword.nativeElement.value;
    if (Utils.isNotEmpty(pwd)) {
      this.checktype = 0;
      setTimeout(() => { this.ddpassword.nativeElement.blur(); }, 50);
      const nPaidAmount = Number(this.paidamount);
      const paid = this.paid.nativeElement.value ? Number(this.paid.nativeElement.value.replace(this.regex, '')) : 0; // 결제금액
      if (nPaidAmount < paid) {
        this.checktype = -3;
        this.dupcheck = false;
        this.apprmessage = this.message.get('payment.valid.overpaid'); // '실결제금액이 큽니다.';
      } else if (nPaidAmount > paid) { // 다음결제수단
        this.checktype = 0;
        this.storage.setPay(nPaidAmount - paid); // 현재까지 결제할 남은 금액(전체결제금액 - 실결제금액)을 세션에 저장
        this.paymentcapture = this.payment.makeDirectDebitPaymentCaptureData(this.paymentcapture, this.bankInfo, paid).capturePaymentInfoData;
        this.result = this.paymentcapture;
        this.finishStatus = StatusDisplay.PAID;
        this.payment.sendPaymentAndOrderInfo(this.paymentcapture, null);
        this.apprmessage = this.message.get('payment.success.next'); // '결제가 완료되었습니다.';
        this.close();
      } else {
        this.checktype = 0;
        this.paymentcapture = this.payment.makeDirectDebitPaymentCaptureData(this.paymentcapture, this.bankInfo, paid).capturePaymentInfoData;
        this.result = this.paymentcapture;
        this.payment.sendPaymentAndOrderInfo(this.paymentcapture, null);
        this.apprmessage = this.message.get('payment.success'); // '결제가 완료되었습니다.';
        this.completePayPopup(nPaidAmount, paid, 0);
      }
    } else {
      this.checktype = -2;
      this.dupcheck = false;
      this.apprmessage = this.message.get('empty.password'); // '비밀번호가 공란입니다.';
    }
  }

  close() {
    this.closeModal();
  }

  private payFinishByEnter() {
    if (this.change === 0) {
      const paid = Number(this.paid.nativeElement.value.replace(this.regex, '')); // 결제금액
      if (Number(this.paidamount) === Number(paid)) { // 결제완료
        this.completePayPopup(paid, this.paidamount, this.change);
      }
    }
    this.close();
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

  @HostListener('document:keydown', ['$event', 'this.spinnerService.status()'])
  onKeyBoardDown(event: any, isSpinnerStatus: boolean) {
    event.stopPropagation();
    if (event.target.tagName === 'INPUT') { return; }
    if (event.keyCode === KeyCode.ENTER && !isSpinnerStatus) {
      const modalid = this.storage.getLatestModalId();
      if (modalid !== ModalIds.COMPLETE) { // 결제완료 창이 뜨지 않았을 경우만 처리
        this.doPay(event);
      }
    }
  }

  private doPay(evt: any) {
    if (Utils.isPaymentSuccess(this.finishStatus)) {
      this.payFinishByEnter();
    } else if (this.finishStatus === 'recart') {
      this.info.sendInfo('recart', this.orderInfo);
      this.info.sendInfo('orderClear', 'clear');
      this.close();
    } else if (this.finishStatus === 'fail') {
      this.close();
    } else {
      if (!this.dupcheck) {
        setTimeout(() => { this.pay(evt); }, 300);
        this.dupcheck = true;
      }
    }
  }



}
