import { Component, OnInit, HostListener } from '@angular/core';

import { ModalComponent, ModalService } from '../../../../core';
import { KeyCode, ICCardPaymentInfo, PaymentCapture, PaymentModeData, CurrencyData, PaymentModes, Accounts } from '../../../../data';
import { Order } from '../../../../data/models/order/order';
import { Cart } from '../../../../data/models/order/cart';
@Component({
  selector: 'pos-ic-card',
  templateUrl: './ic-card.component.html'
})
export class IcCardComponent extends ModalComponent implements OnInit {
  private orderInfo: Order;
  private cartInfo: Cart;
  private accountInfo: Accounts;
  private paymentType: string;
  payprice: number;
  finishStatus: string;                                // 결제완료 상태
  paidDate: Date;
  cardnumber: string; // 카드번호
  cardcompay: string; // 카드사명
  cardperiod: string; // 유효기간
  cardauthnumber: string; // 승인번호
  constructor(protected modalService: ModalService) {
    super(modalService);
    this.finishStatus = null;
  }

  ngOnInit() {
    this.accountInfo = this.callerData.accountInfo;
    this.cartInfo = this.callerData.cartInfo;
    if (this.paymentType === 'n') {
      this.payprice = this.cartInfo.totalPrice.value;
    }
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
