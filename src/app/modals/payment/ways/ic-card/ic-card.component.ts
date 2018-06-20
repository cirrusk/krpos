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

  private makeIcCardData(): ICCardPaymentInfo {
    const iccard = new ICCardPaymentInfo(0, 'accnum', 'baowner', 'bank');
    iccard.paymentMode = new PaymentModeData(PaymentModes.ICCARD);
    iccard.currency = new CurrencyData('KRW');
    const paymentcapture = new PaymentCapture();
    paymentcapture.icCardPayment = iccard;
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
