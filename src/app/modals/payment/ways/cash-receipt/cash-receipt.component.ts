import { Component, OnInit, ViewChild, ElementRef, OnDestroy, HostListener, Renderer2 } from '@angular/core';
import { Subscription } from 'rxjs/Subscription';

import { OrderService, MessageService } from '../../../../service';
import { ModalComponent, ModalService } from '../../../../core';
import { Accounts, StatusDisplay, KeyCode, AmwayExtendedOrdering } from '../../../../data';
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
  constructor(protected modalService: ModalService, private order: OrderService,
    private message: MessageService, private renderer: Renderer2) {
    super(modalService);
    this.divcheck = 'i';
    this.checktype = 0;
    this.finishStatus = null;
  }

  ngOnInit() {
    this.accountInfo = this.callerData.accountInfo;
    this.cartInfo = this.callerData.cartInfo;
    this.orderInfo = this.callerData.orderInfo;
    this.amwayExtendedOrdering = this.callerData.amwayExtendedOrdering;
    this.paymentamount = this.cartInfo.totalPrice ? this.cartInfo.totalPrice.value : 0;
    setTimeout(() => { this.clientnum.nativeElement.focus(); }, 50);
  }

  ngOnDestroy() {
    if (this.receiptsubscription) { this.receiptsubscription.unsubscribe(); }
  }

  /**
   * 현금 영수증 발급
   * 고객번호 유형
   *     CDN = 현금영수증 카드번호 : 13 ~ 19
   *     CPN = 휴대폰번호 : 9 ~ 11
   *     BRN = 사업자등록번호 : 10(주민번호 앞에서부터 10자리)
   *
   * @param issuancenumber 고객번호(휴대폰 번호, 현금영수증 카드번호, 사업자 등록번호)
   */
  requestReceipt(issuancenumber: string) {
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
      let issuancetype, numbertype;
      const receipttype = 'CASH'; // CASH(현금영수증), TAX(세금계산서)
      if (this.divcheck === 'i') {
        issuancetype = 'INCOME_DEDUCTION'; // 소득공제
        if (isnumber.length > 12) {
          numbertype = 'CDN'; // 현금영수증카드번호
        } else {
          numbertype = 'CPN'; // 휴대폰
        }
      } else if (this.divcheck === 'o') {
        issuancetype = 'EXPENDITURE_PROOF'; // 지출증빙
        numbertype = 'BRN'; // 사업자등록번호
      }
      const params = { receiptType: receipttype, issuanceType: issuancetype, numberType: numbertype, issuanceNumber: isnumber };
      const userid = this.accountInfo.parties[0].uid;
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
            this.apprmessage = result.returnMessage;
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

  selectDiv(div: string) {
    this.divcheck = div;
    setTimeout(() => { this.clientnum.nativeElement.focus(); this.clientnum.nativeElement.select(); }, 50);
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
