import { Component, OnInit } from '@angular/core';

import { ModalComponent, ModalService, StorageService } from '../../../../core';
import { PaymentCapture, CashPaymentInfo, CashType, PaymentModes, PaymentModeData } from '../../../../data';
import { InfoBroker } from '../../../../broker';
import { CurrencyData } from '../../../../data/models/payment/payment-capture';
import { Order } from '../../../../data/models/order/order';

@Component({
  selector: 'pos-checks',
  templateUrl: './checks.component.html'
})
export class ChecksComponent extends ModalComponent implements OnInit {

  constructor(protected modalService: ModalService, private info: InfoBroker, private storage: StorageService) {
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
