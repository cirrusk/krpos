import { Component, OnInit, ViewChild, ElementRef, OnDestroy, HostListener } from '@angular/core';
import { Subscription } from 'rxjs/Subscription';

import { ModalComponent, ModalService, SpinnerService, Logger } from '../../../../core';
import { Utils } from '../../../../core/utils';
import { Accounts, StatusDisplay, KeyCode, PaymentCapture } from '../../../../data';
import { Cart } from '../../../../data/models/order/cart';
import { Order } from '../../../../data/models/order/order';
import { OrderService, MessageService } from '../../../../service';
import { throwIfAlreadyLoaded } from '../../../../core/module-import-guard';

@Component({
  selector: 'pos-cash-receipt',
  templateUrl: './cash-receipt.component.html'
})
export class CashReceiptComponent extends ModalComponent implements OnInit, OnDestroy {

  @ViewChild('clientnum') private clientnum: ElementRef;       // 고객번호
  checktype: number;
  apprmessage: string;
  finishStatus: string;
  receiptdate: Date;
  paymentamount: number;
  private divcheck: string;
  private accountInfo: Accounts;
  private cartInfo: Cart;
  private orderInfo: Order;
  private paymentcapture: PaymentCapture;
  private receiptsubscription: Subscription;
  constructor(protected modalService: ModalService, private order: OrderService,
    private spinner: SpinnerService, private message: MessageService, private logger: Logger) {
    super(modalService);
    this.divcheck = 'i';
    this.checktype = 0;
    this.finishStatus = null;
  }

  ngOnInit() {
    this.accountInfo = this.callerData.accountInfo;
    this.cartInfo = this.callerData.cartInfo;
    this.orderInfo = this.callerData.orderInfo;
    this.paymentcapture = this.callerData.paymentcapture;
    this.paymentamount = this.cartInfo.totalPrice ? this.cartInfo.totalPrice.value : 0;
    setTimeout(() => { this.clientnum.nativeElement.focus(); }, 50);
  }

  ngOnDestroy() {
    if (this.receiptsubscription) { this.receiptsubscription.unsubscribe(); }
  }

  /**
   *
   * @param issuancenumber
   */
  requestReceipt(issuancenumber: string) {
    console.log('발행구분 : ' + this.divcheck);
    console.log(issuancenumber);
    console.log('userId : ' + this.accountInfo.parties[0].uid);
    console.log('orderCode : ' + this.orderInfo.code);
    if (Utils.isEmpty(issuancenumber)) {
      if (this.divcheck === 'i') {
        this.checktype = -1;
        this.apprmessage = this.message.get('receipt.reg.number.emp'); // 휴대폰 번호, 현금영수증 카드번호
      } else if (this.divcheck === 'o') {
        this.checktype = -2;
        this.apprmessage = this.message.get('receipt.reg.number.biz'); // 사업자 등록번호, 현금영수증 카드번호
      }
    } else {
      this.spinner.show();
      let receipttype, issuancetype, numbertype;
      if (this.paymentcapture) {
        if (this.paymentcapture.cashPaymentInfo) {
          receipttype = 'CASH';
        }
        if (this.paymentcapture.monetaryPaymentInfo) {
          receipttype = 'CASH';
        }
        if (this.paymentcapture.directDebitPaymentInfo) {
          receipttype = 'CASH';
        }
      }
      if (this.divcheck === 'i') {
        issuancetype = 'INCOME_DEDUCTION';
        numbertype = 'CDN';
      } else if (this.divcheck === 'o') {
        issuancetype = 'OUTCOME_DEDUCTION';
        numbertype = 'CDN';
      }
      const params = { receiptType: receipttype, issuanceType: issuancetype, numberType: numbertype, issuanceNumber: issuancenumber };
      const userid = this.accountInfo.parties[0].uid;
      const ordercode = this.orderInfo.code;
      this.receiptsubscription = this.order.receipt(userid, ordercode, params).subscribe(
        result => {
          if (result.code === '200') {
            this.finishStatus = StatusDisplay.PAID;
            this.checktype = 0;
            this.receiptdate = new Date();
            this.apprmessage = this.message.get('receipt.reg.number.success');
          } else {
            this.finishStatus = 'fail';
            this.apprmessage = result.returnMessage;
          }
        },
        error => {
          this.finishStatus = 'fail';
          this.spinner.hide();
          const errdata = Utils.getError(error);
          if (errdata) {
            this.apprmessage = errdata.message;
          }
        },
        () => { this.spinner.hide(); });

    }
  }

  selectDiv(div: string) {
    this.divcheck = div;
  }

  close() {
    this.closeModal();
  }

  @HostListener('document:keydown', ['$event'])
  onReceiptKeyBoardDown(event: any) {
    event.stopPropagation();
    if (event.target.tagName === 'INPUT') { return; }
    if (event.keyCode === KeyCode.ENTER) {
      if (this.finishStatus === StatusDisplay.CREATED || this.finishStatus === StatusDisplay.PAID) {
        this.close();
      }
    }
  }
}
