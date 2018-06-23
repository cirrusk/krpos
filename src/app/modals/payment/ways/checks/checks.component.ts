import { CurrencyData } from './../../../../data/models/payment/payment-capture';
import { Component, OnInit } from '@angular/core';

import { ModalComponent, ModalService } from '../../../../core';
import { PaymentCapture, CashPaymentInfo, CashType, PaymentModes, PaymentModeData } from '../../../../data';

@Component({
  selector: 'pos-checks',
  templateUrl: './checks.component.html'
})
export class ChecksComponent extends ModalComponent implements OnInit {

  constructor(protected modalService: ModalService) {
    super(modalService);
  }

  ngOnInit() {
  }

  private makePaymentCaptureData(paidamount: number): PaymentCapture {
    const cash = new CashPaymentInfo(paidamount, CashType.CHECK);
    cash.setPaymentModeData = new PaymentModeData(PaymentModes.CHEQUE);
    cash.setCurrencyData = new CurrencyData();
    const paymentcapture = new PaymentCapture();
    paymentcapture.setCashPaymentInfo = cash;
    return paymentcapture;
  }

  close() {
    this.closeModal();
  }

}
