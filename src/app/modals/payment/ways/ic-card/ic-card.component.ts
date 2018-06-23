import { Component, OnInit, HostListener } from '@angular/core';

import { ModalComponent, ModalService } from '../../../../core';
import { KeyCode, ICCardPaymentInfo, PaymentCapture, PaymentModeData, CurrencyData, PaymentModes } from '../../../../data';

@Component({
  selector: 'pos-ic-card',
  templateUrl: './ic-card.component.html'
})
export class IcCardComponent extends ModalComponent implements OnInit {

  constructor(protected modalService: ModalService) {
    super(modalService);
  }

  ngOnInit() {
    this.makeIcCardData();
  }

  close() {
    this.closeModal();
  }

  private makePaymentCaptureData(paidamount: number): PaymentCapture {
    const iccard = new ICCardPaymentInfo(paidamount);
    iccard.setAccountNumber = '';
    iccard.setBank = '';
    iccard.setBankIDNumber = '';
    iccard.setBaOwner = '';
    iccard.setPaymentModeData = new PaymentModeData(PaymentModes.POINT);
    iccard.setCurrencyData = new CurrencyData();
    const paymentcapture = new PaymentCapture();
    paymentcapture.setIcCardPaymentInfo = iccard;
    return paymentcapture;
  }

  private makeIcCardData(): ICCardPaymentInfo {
    const iccard = new ICCardPaymentInfo(0, 'accnum', 'baowner', '71', 'bank');
    iccard.setPaymentModeData = new PaymentModeData(PaymentModes.ICCARD);
    iccard.setCurrencyData = new CurrencyData('KRW');
    const paymentcapture = new PaymentCapture();
    paymentcapture.setIcCardPaymentInfo = iccard;
    console.log('IC CARD : ' + JSON.stringify(iccard));
    console.log('PAYMENT CAPTURE : ' + JSON.stringify(paymentcapture));
    return iccard;
  }

  @HostListener('document: keydown', ['$event', '$event.target'])
  icCardAction(event: KeyboardEvent, targetElm: HTMLElement) {
    event.stopPropagation();
    if (event.keyCode === KeyCode.ENTER) {
      alert('enter event...');
    }
  }

}
