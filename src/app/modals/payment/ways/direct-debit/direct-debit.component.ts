import { CurrencyData } from './../../../../data/models/payment/payment-capture';
import { Component, OnInit } from '@angular/core';

import { ModalComponent, ModalService } from '../../../../core';
import { PaymentCapture, DirectDebitPaymentInfo, PaymentModes, PaymentModeData } from '../../../../data';

@Component({
  selector: 'pos-direct-debit',
  templateUrl: './direct-debit.component.html'
})
export class DirectDebitComponent extends ModalComponent implements OnInit {

  constructor(protected modalService: ModalService) {
    super(modalService);
  }

  ngOnInit() {
  }

  private makePaymentCaptureData(paidamount: number): PaymentCapture {
    const directdebit = new DirectDebitPaymentInfo(paidamount);
    directdebit.setAccountNumber = '';
    directdebit.setBank = '';
    directdebit.setBankIDNumber = '';
    directdebit.setBaOwner = '';
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
