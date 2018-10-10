import { Component, OnInit, ViewChild, ElementRef, OnDestroy, HostListener, Renderer2 } from '@angular/core';
import { Subscription } from 'rxjs/Subscription';

import { OrderService, MessageService } from '../../../../service';
import { ModalComponent, ModalService, SpinnerService } from '../../../../core';
import { Accounts, StatusDisplay, KeyCode, AmwayExtendedOrdering, PaymentCapture } from '../../../../data';
import { Cart } from '../../../../data/models/order/cart';
import { Order } from '../../../../data/models/order/order';
import { Utils } from '../../../../core/utils';

@Component({
  selector: 'pos-cash-receipt',
  templateUrl: './cash-receipt.component.html'
})
export class CashReceiptComponent extends ModalComponent implements OnInit, OnDestroy {

  checktype: number;
  apprmessage: string;
  finishStatus: string;
  receiptdate: Date;
  paymentamount: number;
  paymentcapture: PaymentCapture;
  private regex: RegExp = /[^0-9]+/g;
  private divcheck: string;
  private accountInfo: Accounts;
  private cartInfo: Cart;
  private orderInfo: Order;
  private amwayExtendedOrdering: AmwayExtendedOrdering;
  private receiptsubscription: Subscription;
  @ViewChild('clientnum') private clientnum: ElementRef;       // 고객번호
  @ViewChild('income') private income: ElementRef;
  @ViewChild('outcome') private outcome: ElementRef;

  // spinnerService 는 HostListener 사용중
  constructor(protected modalService: ModalService, private order: OrderService,
    private message: MessageService, private renderer: Renderer2, private spinnerService: SpinnerService) {
    super(modalService);
    this.divcheck = 'i';
    this.checktype = 0;
    this.finishStatus = null;
  }

  ngOnInit() {
    this.spinnerService.init();
    this.accountInfo = this.callerData.accountInfo;
    this.cartInfo = this.callerData.cartInfo;
    this.orderInfo = this.callerData.orderInfo;
    this.amwayExtendedOrdering = this.callerData.amwayExtendedOrdering;
    this.paymentcapture = this.callerData.paymentCapture;
    // 발행금액
    this.paymentamount = this.getPayAmount(); // this.cartInfo.totalPrice ? this.cartInfo.totalPrice.value : 0;
    setTimeout(() => { this.clientnum.nativeElement.focus(); }, 50);
  }

  ngOnDestroy() {
    if (this.receiptsubscription) { this.receiptsubscription.unsubscribe(); }
  }

  /**
   * 발행금액은 현금성만 대상
   */
  private getPayAmount() {
    let amount = 0;
    if (this.paymentcapture.cashPaymentInfo) { // 현금
      amount += this.paymentcapture.cashPaymentInfo.amount;
    }
    if (this.paymentcapture.monetaryPaymentInfo) { // AP
      amount += this.paymentcapture.monetaryPaymentInfo.amount;
    }
    if (this.paymentcapture.directDebitPaymentInfo) { // 자동이체
      amount += this.paymentcapture.directDebitPaymentInfo.amount;
    }
    return amount;
  }

  /**
   * 현금 영수증 발급
   * 고객번호 유형
   *     CDN = 현금영수증 카드번호 : 15 ~ 18
   *     CPN = 휴대폰번호 : 10 ~ 11
   *     BRN = 사업자등록번호 : 10(주민번호 앞에서부터 10자리)
   *
   * @param issuancenumber 고객번호(휴대폰 번호, 현금영수증 카드번호, 사업자 등록번호)
   */
  requestReceipt(issuancenumber: string) {
    this.checktype = 0;
    this.finishStatus = null;
    const isnumber = issuancenumber.replace(this.regex, '');
    if (Utils.isEmpty(isnumber)) {
      if (this.divcheck === 'i') {
        this.checktype = -1;
        this.apprmessage = this.message.get('receipt.reg.number.emp'); // 휴대폰 번호, 현금영수증 카드번호
      } else if (this.divcheck === 'o') {
        this.checktype = -2;
        this.apprmessage = this.message.get('receipt.reg.number.biz'); // 사업자 등록번호, 현금영수증 카드번호
      }
    } else {
      const iv = this.checkValidation(isnumber);
      if (iv < 0) {
        setTimeout(() => { this.clientnum.nativeElement.focus(); this.clientnum.nativeElement.select(); }, 50);
        this.checktype = iv;
        if (iv === -997) { // 현금영수증카드번호 맞지 않으면 
          this.apprmessage = '현금영수증카드 번호 또는 휴대폰 번호가 올바르지 않습니다.';
        } else if (iv === -998) { // 휴대폰 맞지 않으면
          this.apprmessage = '현금영수증카드 번호 또는 휴대폰 번호가 올바르지 않습니다.';
        } else if (iv === -999) { // 사업자등록번호 맞지 않으면
          this.apprmessage = '사업자 등록번호가 올바르지 않습니다.';
        }
        return;
      } 
      let issuancetype, numbertype;
      const receipttype = 'CASH'; // CASH(현금영수증), TAX(세금계산서)
      if (this.divcheck === 'i') {
        issuancetype = 'INCOME_DEDUCTION'; // 소득공제
        if (iv === 1) {
          numbertype = 'CDN'; // 현금영수증카드번호
        } else {
          numbertype = 'CPN'; // 휴대폰
        }
      } else if (this.divcheck === 'o') {
        issuancetype = 'EXPENDITURE_PROOF'; // 지출증빙
        numbertype = 'BRN'; // 사업자등록번호
      }
      const params = { receiptType: receipttype, issuanceType: issuancetype, numberType: numbertype, issuanceNumber: isnumber };
      const userid = this.accountInfo.parties ? this.accountInfo.parties[0].uid : this.accountInfo.uid;
      const ordercode = this.orderInfo.code;
      this.receiptsubscription = this.order.receipt(userid, ordercode, params).subscribe(
        result => {
          if (result.code === '200') {
            this.result = result.code;
            this.finishStatus = StatusDisplay.PAID;
            this.clientnum.nativeElement.blur();
            setTimeout(() => {
              this.renderer.setAttribute(this.income.nativeElement, 'disabled', 'disabled');
              this.renderer.setAttribute(this.outcome.nativeElement, 'disabled', 'disabled');
              this.renderer.setAttribute(this.clientnum.nativeElement, 'disabled', 'disabled');
            }, 50);
            this.checktype = 0;
            this.receiptdate = new Date();
            this.apprmessage = this.message.get('receipt.reg.number.success');
          } else {
            this.finishStatus = 'fail';
            this.apprmessage = this.message.get('receipt.reg.number.fail'); // result.returnMessage;
          }
        },
        error => {
          this.finishStatus = 'fail';
          const errdata = Utils.getError(error);
          if (errdata) {
            this.apprmessage = errdata.message;
          }
        });
    }
  }

  /**
   * 입력한 고객번호 유효성 체크하기
   * 고객번호 유형
   *     CDN = 현금영수증 카드번호 : 15 ~ 18
   *     CPN = 휴대폰번호 : 10 ~ 11
   *     BRN = 사업자등록번호 : 10(주민번호 앞에서부터 10자리)
   * @param issuancenumber 고객번호(휴대폰 번호, 현금영수증 카드번호, 사업자 등록번호) 
   */
  checkValidation(issuancenumber: string): number {
    const issnumber = issuancenumber.replace(this.regex, '');
    const isslen = issnumber.length;
    if (this.divcheck === 'i') { // 소득공제
      if (isslen >= 15 && isslen <= 18) { // 현금영수증 카드번호
        this.checktype = 0;
        this.apprmessage = '';
        return 1;
      } else if (isslen >= 10 && isslen <= 11) { // 휴대폰번호
        this.checktype = 0;
        this.apprmessage = '';
        return 2;
      } else {
        return -997;// 현금영수증카드번호 맞지 않으면 -997, 휴대폰 맞지 않으면 -998
      }
    } else if (this.divcheck === 'o') { // 지출증빙
      if (isslen === 10) {
        this.checktype = 0;
        this.apprmessage = '';
        return 3;
      } else {
        return -999;  // 사업자등록번호 맞지 않으면 -999
      }
    }
    return 0;
  }

  selectDiv(div: string) {
    this.divcheck = div;
    setTimeout(() => { this.clientnum.nativeElement.focus(); this.clientnum.nativeElement.select(); }, 50);
  }

  close() {
    this.closeModal();
  }

  @HostListener('document:keydown', ['$event', 'this.spinnerService.status()'])
  onReceiptKeyBoardDown(event: any, isSpinnerStatus: boolean) {
    event.stopPropagation();
    if (event.target.tagName === 'INPUT') { return; }
    if (event.keyCode === KeyCode.ENTER && !isSpinnerStatus) {
      if (this.finishStatus === StatusDisplay.CREATED || this.finishStatus === StatusDisplay.PAID) {
        this.close();
      }
    }
  }
}
