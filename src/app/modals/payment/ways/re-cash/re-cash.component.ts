import { Component, OnInit, OnDestroy, ViewChild, HostListener, ElementRef } from '@angular/core';
import { Subscription } from 'rxjs/Subscription';

import { ModalComponent, ModalService } from '../../../../core';
import { KeyCode, Balance, Accounts } from '../../../../data';
import { PaymentService } from '../../../../service';

@Component({
  selector: 'pos-re-cash',
  templateUrl: './re-cash.component.html'
})
export class ReCashComponent extends ModalComponent implements OnInit, OnDestroy {
  isAllPay: boolean;
  private accountInfo: Accounts;
  @ViewChild('usePoint') usePoint: ElementRef;
  balance: Balance;
  private paymentSubscription: Subscription;
  constructor(protected modalService: ModalService, private payment: PaymentService) {
    super(modalService);
    this.isAllPay = false;
  }

  ngOnInit() {
    setTimeout(() => { this.usePoint.nativeElement.focus(); }, 50);
    this.accountInfo = this.callerData.accountInfo;
    this.paymentSubscription = this.payment.getRecash(this.accountInfo.uid).subscribe(result => {
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
      this.usePoint.nativeElement.value = '';
      this.isAllPay = true;
    } else {
      this.isAllPay = false;
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
