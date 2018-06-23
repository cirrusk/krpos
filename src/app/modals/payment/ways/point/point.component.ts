import { Cart } from './../../../../data/models/order/cart';
import { Component, OnInit, ViewChild, ElementRef, HostListener, OnDestroy } from '@angular/core';
import { Subscription } from 'rxjs/Subscription';

import { ModalComponent, ModalService } from '../../../../core';
import { KeyCode, Accounts, Balance } from '../../../../data';
import { PaymentService } from '../../../../service';

@Component({
  selector: 'pos-point',
  templateUrl: './point.component.html'
})
export class PointComponent extends ModalComponent implements OnInit, OnDestroy {

  pointType: string; // modal component 호출 시 전달 받은 포인트 타입
  pointTypeText: string;
  isAllPay: boolean;
  private accounts: Accounts;
  private cartInfo: Cart;
  private paymentType: string;
  private balance: Balance;
  balanceamount: number;
  paymentprice: number;
  change: number;
  @ViewChild('usePoint') usePoint: ElementRef;
  private paymentSubscription: Subscription;
  constructor(protected modalService: ModalService,
    private payment: PaymentService) {
    super(modalService);
    this.isAllPay = true;
  }

  ngOnInit() {
    console.log('----> ' + this.pointType);
    if (this.pointType === 'a') {
      this.pointTypeText = 'A포인트';
    } else {
      this.pointTypeText = 'Member 포인트';
    }
    this.accounts = this.callerData.account;
    this.cartInfo = this.callerData.cartInfo;
    this.paymentprice = this.cartInfo.totalPrice.value;
    this.paymentSubscription = this.payment.getBalance(this.accounts.parties[0].uid).subscribe(result => {
      this.balance = result;
      this.balanceamount = this.balance.amount;
      const changeprice = this.balanceamount - this.usePoint.nativeElement.value;
      this.change = (changeprice < 0) ? 0 : changeprice;
    });

  }

  ngOnDestroy() {
    if (this.paymentSubscription) { this.paymentSubscription.unsubscribe(); }
  }

  payPoint() {
    if (this.isAllPay) {
      console.log('*** use point : all point');
    } else {
      console.log('*** use point : ' + this.usePoint.nativeElement.value);
    }
    if (this.paymentType === 'n') {
      const usepoint = this.usePoint.nativeElement.value ? this.usePoint.nativeElement.value : 0;
      const paid = this.paymentprice - usepoint;
      if (paid > 0) { // 포인트가 부족

      } else if (paid < 0) { // 포인트가 많음.

      } else {
// payment capture and place order
      }
    }

  }

  setChange(usepoint) {
    if (usepoint > 0 && (this.balanceamount >= usepoint)) {
      this.change = this.balanceamount - usepoint;
    } else { // 가용포인트보다 사용포인트가 많으면
    }
  }

  checkPay(type: number) {
    if (type === 0) {
      this.isAllPay = true;
    } else {
      this.isAllPay = false;
      this.usePoint.nativeElement.value = '';
      this.usePoint.nativeElement.focus();
    }
  }

  close() {
    this.closeModal();
  }

  @HostListener('document:keydown', ['$event'])
  onAlertKeyDown(event: any) {
    event.stopPropagation();
    if (event.target.tagName === 'INPUT') { return; }
    if (event.keyCode === KeyCode.ENTER) {
      this.payPoint();
    }
  }

}
