import { Injectable } from '@angular/core';
import { Observable } from 'rxjs/Observable';
import 'rxjs/add/observable/forkJoin';

import { ApiService, StorageService } from '../../core';
import {
  BankInfo, Balance, CouponList, HttpData,
  PaymentModeList, PaymentModeListByMain, PaymentDetails, PaymentCapture, VoucherList
} from '../../data';

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
  getPaymentModesByMain(userid: string, cartid: string): Observable<PaymentModeListByMain> {
    const macAddress = this.storage.getMacAddress();
    const params = { macAddress: macAddress, feilds: 'DEFAULT' };
    const pathvariables = { userId: userid, cartId: cartid };
    const data = new HttpData('paymentModesByMain', pathvariables, null, params);
    return this.api.get(data);
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

  /**
   * 신용카드 무이자 할부 정보 조회
   *
   * @param code 카드사코드
   */
  getInstallmentPlan(cardcode: string, userid: string): Observable<BankInfo> {
    const pathvariables = { userId: userid };
    const params = { code: cardcode, feilds: 'DEFAULT' };
    const data = new HttpData('intallmentPlan', pathvariables, null, params);
    return this.api.get(data);
  }

  /**
   * 회원의 포인트 정보와 Recash 정보 조회
   * 장바구니에 회원 검색 시 사용
   *
   * @param userid 회원아이디
   */
  getBalanceAndRecash(userid: string): Observable<Balance[]> {
    return Observable.forkJoin(this.getBalance(userid), this.getRecash(userid));
  }

  /**
   * 회원의 가용 포인트 조회
   *
   * @param userid 회원아이디
   */
  getBalance(userid: string): Observable<Balance> {
    const pathvariables = { userId: userid };
    const params = { feilds: 'DEFAULT' };
    const data = new HttpData('balance', pathvariables, null, params);
    return this.api.get(data);
  }

  /**
   * 회원의 Re-Cash 조회
   *
   * @param userid 회원아이디
   */
  getRecash(userid: string): Observable<Balance> {
    const pathvariables = { userId: userid };
    const params = { feilds: 'DEFAULT' };
    const data = new HttpData('recash', pathvariables, null, params);
    return this.api.get(data);
  }

  /**
   * 쿠폰 목록 조회
   *
   * @param accountid 회원 아이디
   * @param userid 회원 아이디
   */
  searchCoupon(accountid: string, userid: string): Observable<CouponList> {
    const pathvariables = { accountId: accountid, userId: userid };
    const params = { couponStatuses: ['NEW', 'REISSUED', 'REDEEMED'], showActive: true, feilds: 'DEFAULT' }; // , 'EXPIRED', 'DELETED', 'FREEZED'
    const data = new HttpData('searchCoupon', pathvariables, null, params);
    return this.api.get(data);
  }

  /**
   * 쿠폰 적용
   *
   * @param userid 회원 아이디
   * @param cartid 카트 아이디
   * @param couponcode 쿠폰 코드
   */
  applyCoupon(userid: string, cartid: string, couponcode: string): Observable<VoucherList> {
    const pathvariables = { userId: userid, cartId: cartid };
    const param = { voucherId: couponcode };
    const data = new HttpData('applyCoupon', pathvariables, param, null);
    return this.api.post(data);
  }
}
