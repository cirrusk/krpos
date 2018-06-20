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
  balance: Balance;
  @ViewChild('usePoint') usePoint: ElementRef;
  private paymentSubscription: Subscription;
  constructor(protected modalService: ModalService, private payment: PaymentService) {
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

    this.paymentSubscription = this.payment.getBalance(this.accounts.parties[0].uid).subscribe(result => {
      this.balance = result;
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
    // action pay....
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
