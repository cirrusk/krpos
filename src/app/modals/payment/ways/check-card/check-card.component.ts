import { Component, OnInit } from '@angular/core';

import { ModalComponent, ModalService, StorageService } from '../../../../core';
import { PaymentCapture, CreditCardPaymentInfo, PaymentModeData, PaymentModes, CurrencyData } from '../../../../data';
import { Order } from '../../../../data/models/order/order';
import { InfoBroker } from '../../../../broker';

@Component({
  selector: 'pos-check-card',
  templateUrl: './check-card.component.html'
})
export class CheckCardComponent extends ModalComponent implements OnInit {

  constructor(protected modalService: ModalService, private info: InfoBroker, private storage: StorageService) {
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

  /**
   * 장바구니와 클라이언트에 정보 전달
   *
   * @param payment Payment Capture 정보
   * @param order Order 정보
   */
  private sendPaymentAndOrder(payment: PaymentCapture, order: Order) {
    this.info.sendInfo('payinfo', [payment, order]);
    this.storage.setLocalItem('payinfo', [payment, order]);
  }

  close() {
    this.closeModal();
  }

}
