import { Injectable } from '@angular/core';
import { Observable } from 'rxjs/Observable';

import { ApiService, StorageService } from '../../core';
import { PaymentModeList, HttpData, PaymentModeListByMainPayment, PaymentDetails, PaymentCapture } from '../../data';

@Injectable()
export class PaymentService {

  constructor(private api: ApiService, private storage: StorageService) { }

  /**
   * AP 별 결제 수단 조회하기
   *
   * @param storeid AP Name
   */
  getPaymentModes(storeid?: string): Observable<PaymentModeList> {
    const params = { feilds: 'DEFAULT' };
    const pathvariables = { storeId: storeid ? storeid : this.storage.getTerminalInfo().pointOfService.name };
    const data = new HttpData('paymentModes', pathvariables, null, params);
    return this.api.get(data);
  }

  /**
   * 주결제 수단에 대한 사용가능한 결제 수단 조회하기
   *
   * @param userid 사용자아이디
   * @param cartid 카트아이디
   */
  getPaymentModesByMainPayment(userid: string, cartid: string): Observable<PaymentModeListByMainPayment> {
    const macAddress = this.storage.getMacAddress();
    const params = { macAddress: macAddress, feilds: 'DEFAULT' };
    const pathvariables = { userId: userid, cartId: cartid };
    const data = new HttpData('paymentModesByMainPayment', pathvariables, null, params);
    return this.api.post(data);
  }

  /**
   * Payment Capture 실행하기
   *
   * @param userid 사용자아이디
   * @param cartid 카트아이디
   * @param paymentcapture Payment Mode 별 PaymentCapture 정보
   */
  paymentCapture(userid: string, cartid: string, paymentcapture: PaymentCapture): Observable<PaymentDetails> {
    const pathvariables = { userId: userid, cartId: cartid };
    const params = { feilds: 'DEFAULT' };
    const data = new HttpData('paymentCapture', pathvariables, paymentcapture, params);
    return this.api.post(data);
  }
}
