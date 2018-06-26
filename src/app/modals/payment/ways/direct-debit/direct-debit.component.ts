import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';

import { ModalComponent, ModalService } from '../../../../core';
import {
  PaymentCapture, DirectDebitPaymentInfo, PaymentModes, PaymentModeData,
  CurrencyData, Accounts, BankTypes
} from '../../../../data';
import { Order } from '../../../../data/models/order/order';
import { Cart } from '../../../../data/models/order/cart';
import { BankAccount } from '../../../../data/models/order/bank-account';
@Component({
  selector: 'pos-direct-debit',
  templateUrl: './direct-debit.component.html'
})
export class DirectDebitComponent extends ModalComponent implements OnInit {
  private orderInfo: Order;
  private cartInfo: Cart;
  private accountInfo: Accounts;
  private paymentcapture: PaymentCapture;
  private paymentType: string;
  accountnumber: string;
  bank: string;
  bankid: string;
  depositor: string;
  @ViewChild('ddpassword') private ddpassword: ElementRef;
  constructor(protected modalService: ModalService) {
    super(modalService);
  }

  ngOnInit() {
    this.accountInfo = this.callerData.accountInfo;
    this.cartInfo = this.callerData.cartInfo;
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

  close() {
    this.closeModal();
  }

}
