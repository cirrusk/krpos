import { Injectable } from '@angular/core';
import { Observable } from 'rxjs/Observable';

import { ApiService, StorageService } from '../../core';
import { PaymentModeList, HttpData, PaymentModeListByMainPayment } from '../../data';

@Injectable()
export class PaymentService {

  constructor(private api: ApiService, private storage: StorageService) { }

  /**
   * AP 별 결제 방법
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
   * 결제방법 조회하기
   * 주결제 수단에 대한 사용가능한 결제 수단 조회
   *
   * @param userid 사용자아이디
   * @param cartid 카트아이디
   */
  getPaymentModesByCart(userid: string, cartid: string): Observable<PaymentModeListByMainPayment> {
    const macAddress = this.storage.getMacAddress();
    const params = { macAddress: macAddress, feilds: 'DEFAULT' };
    const pathvariables = { userId: userid, cartId: cartid };
    const data = new HttpData('paymentModesByMainPayment', pathvariables, null, params);
    return this.api.get(data);
  }
}
