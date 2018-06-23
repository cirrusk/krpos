import { Component, OnInit } from '@angular/core';

import { ModalComponent, ModalService } from '../../../../core';
import { PaymentCapture, CreditCardPaymentInfo, PaymentModeData, PaymentModes, CurrencyData } from '../../../../data';

@Component({
  selector: 'pos-check-card',
  templateUrl: './check-card.component.html'
})
export class CheckCardComponent extends ModalComponent implements OnInit {

  constructor(protected modalService: ModalService) {
    super(modalService);
  }

  ngOnInit() {
  }

  private makePaymentCaptureData(paidamount: number): PaymentCapture {
    const ccard = new CreditCardPaymentInfo(paidamount);
    ccard.setCardAuthNumber = '';
    ccard.setCardCompayCode = '';
    ccard.setCardAuthNumber = '';
    ccard.setCardPassword = '';
    ccard.setInstallmentPlan = '';
    ccard.setMemberType = '';
    ccard.setPaymentType = '';
    ccard.setValidToMonth = '';
    ccard.setValidToYear = '';
    ccard.setPaymentModeData = new PaymentModeData(PaymentModes.CREDITCARD);
    ccard.setCurrencyData = new CurrencyData();
    const paymentcapture = new PaymentCapture();
    paymentcapture.setCcPaymentInfo = ccard;
    return paymentcapture;
  }

  close() {
    this.closeModal();
  }

}
