import { Component, OnInit, ViewChild, ElementRef, Renderer2 } from '@angular/core';

import { ModalComponent, ModalService } from '../../../../core';
import { PaymentCapture, CreditCardPaymentInfo, PaymentModes, PaymentModeData, CurrencyData } from '../../../../data';

@Component({
  selector: 'pos-credit-card',
  templateUrl: './credit-card.component.html'
})
export class CreditCardComponent extends ModalComponent implements OnInit {

  private installment: number;
  @ViewChild('installmentPeriod') private installmentPeriod: ElementRef;
  constructor(protected modalService: ModalService, private renderer: Renderer2) {
    super(modalService);
  }

  ngOnInit() {
    setTimeout(() => { this.renderer.setAttribute(this.installmentPeriod.nativeElement, 'readonly', 'readonly'); }, 5);

  }

  checkPay(type: number) {
    this.installmentPeriod.nativeElement.value = '';
    if (type === 0) {
      this.installment = 0;
      setTimeout(() => { this.renderer.setAttribute(this.installmentPeriod.nativeElement, 'readonly', 'readonly'); }, 5);
    } else {
      setTimeout(() => { this.renderer.removeAttribute(this.installmentPeriod.nativeElement, 'readonly'); }, 5);
      // this.installment = this.installmentPeriod.nativeElement.value;
      this.installmentPeriod.nativeElement.focus();
    }
  }

  private makePaymentCaptureData(paidamount: number): PaymentCapture {
    const ccard = new CreditCardPaymentInfo(paidamount);
    ccard.paymentMode = new PaymentModeData(PaymentModes.CREDITCARD);
    ccard.currency = new CurrencyData();
    const paymentcapture = new PaymentCapture();
    paymentcapture.ccPaymentInfo = ccard;
    return paymentcapture;
  }

  close() {
    this.closeModal();
  }

}
