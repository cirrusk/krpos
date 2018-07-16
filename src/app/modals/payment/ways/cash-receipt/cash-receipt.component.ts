import { Component, OnInit, ViewChild, ElementRef, OnDestroy, HostListener } from '@angular/core';
import { Subscription } from 'rxjs/Subscription';

import { ModalComponent, ModalService, SpinnerService, Logger } from '../../../../core';
import { Utils } from '../../../../core/utils';
import { Accounts, StatusDisplay, KeyCode } from '../../../../data';
import { Cart } from '../../../../data/models/order/cart';
import { Order } from '../../../../data/models/order/order';
import { OrderService } from '../../../../service';

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
  private receiptsubscription: Subscription;
  constructor(protected modalService: ModalService, private order: OrderService,
    private spinner: SpinnerService, private logger: Logger) {
    super(modalService);
    this.divcheck = 'i';
    this.checktype = 0;
    this.finishStatus = null;
  }

  ngOnInit() {
    this.accountInfo = this.callerData.accountInfo;
    this.cartInfo = this.callerData.cartInfo;
    this.orderInfo = this.callerData.orderInfo;
    this.paymentamount = this.cartInfo.totalPrice ? this.cartInfo.totalPrice.value : 0;
    setTimeout(() => { this.clientnum.nativeElement.focus(); }, 50);
  }

  ngOnDestroy() {
    if (this.receiptsubscription) { this.receiptsubscription.unsubscribe(); }
  }

  requestReceipt(issunumber: string) {
    console.log('발행구분 : ' + this.divcheck);
    console.log(issunumber);
    console.log('userId : ' + this.accountInfo.parties[0].uid);
    console.log('orderCode : ' + this.orderInfo.code);
    if (Utils.isEmpty(issunumber)) {
      if (this.divcheck === 'i') {
        this.checktype = -1;
        this.apprmessage = '';
      } else if (this.divcheck === 'o') {
        this.checktype = -2;
        this.apprmessage = '';
      }
    } else {
      this.spinner.show();
      const userid = this.accountInfo.parties[0].uid;
      const ordercode = this.orderInfo.code;
      this.receiptsubscription = this.order.receipt(userid, ordercode, issunumber).subscribe(
        result => {
          this.finishStatus = StatusDisplay.PAID;
          this.checktype = 0;
          this.apprmessage = '';
          console.log('receipt result : ' + result);
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
