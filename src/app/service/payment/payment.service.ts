import { Injectable } from '@angular/core';
import { Observable } from 'rxjs/Observable';
import 'rxjs/add/observable/forkJoin';
import 'rxjs/add/operator/timeout';

import { ApiService, StorageService, Config } from '../../core';
import {
  Balance, CouponList, HttpData,
  PaymentModeList, PaymentModeListByMain, PaymentDetails, PaymentCapture, VoucherList, ResponseData, BankInfoList
} from '../../data';
import { Order } from '../../data/models/order/order';
import { Cart } from '../../data/models/order/cart';

@Injectable()
export class PaymentService {

  private directdebitTimeout: number;
  constructor(private api: ApiService, private storage: StorageService, private config: Config) {
    this.directdebitTimeout = this.config.getConfig('directdebitTimeout');
  }

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
   * 신용카드 무이자 할부 정보 조회
   *
   * @param code 카드사코드
   */
  getInstallmentPlan(): Observable<BankInfoList> {
    const params = { feilds: 'DEFAULT' };
    const data = new HttpData('intallmentPlan', null, null, params);
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

  /**
   * 쿠폰 목록 조회
   * @param accountid 회원 아이디
   * @param userid 회원 아이디
   * @param couponcode 쿠폰코드
   * @param currentpage 현재 페이지
   * @param pagesize 페이지사이즈
   * @param sort 정렬값
   * @param asc 정렬
   */
  searchCoupon(accountid: string, userid: string, couponcode?: string, currentpage = 0, pagesize = 5, sort = 'startDate', asc = true): Observable<CouponList> {
    const pathvariables = { accountId: accountid, userId: userid };
    const params = { currentPage: currentpage, pageSize: pagesize, sort: sort, asc: asc, feilds: 'DEFAULT' };
    const data = new HttpData('searchCoupon', pathvariables, null, params, 'b');
    return this.api.get(data);
  }

  /**
   * 쿠폰 적용
   *
   * @param userid 회원 아이디
   * @param cartid 카트 아이디
   * @param couponcode 쿠폰 코드
   */
  applyCoupon(userid: string, cartid: string, couponcode: string): Observable<Cart> {
    const pathvariables = { userId: userid, cartId: cartid };
    const param = { voucherId: couponcode, fields: 'FULL' };
    const data = new HttpData('applyCoupon', pathvariables, null, param, 'b');
    return this.api.post(data);
  }

  /**
   * 수표 조회
   * @param checknumber 수표번호(42 자리, 0으로 right padding)
   */
  searchCheque(checknumber: string): Observable<ResponseData> {
    const params = { checkNumber: checknumber };
    const data = new HttpData('searchCheque', null, null, params);
    return this.api.get(data);
  }

  /**
   * Payment Capture 실행하기
   *
   * @deprecated Payment Capture와 Place Order를 진행하도록 변경
   * @see placeOrder 참조
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
   * Payment Capture와 Place Order를 진행
   *
   * @param accountid 회원 아이디
   * @param userid 회원 아이디
   * @param cartid 카트 아이디
   * @param paymentcapture Payment Capture 정보
   */
  placeOrder(accountid: string, userid: string, cartid: string, paymentcapture: PaymentCapture): Observable<Order> {
    const pathvariables = { accountId: accountid, userId: userid, cartId: cartid };
    const param = { fields: 'FULL' };
    const data = new HttpData('placeOrder', pathvariables, paymentcapture, param, 'b');
    return this.api.post(data);
  }

  /**
   * Payment Capture와 Place Order를 진행
   * 타임아웃 지정(자동이체 등)
   *
   * @param accountid 회원 아이디
   * @param userid 회원 아이디
   * @param cartid 카트 아이디
   * @param paymentcapture Payment Capture 정보
   */
  placeOrderWithTimeout(accountid: string, userid: string, cartid: string, paymentcapture: PaymentCapture): Observable<Order> {
   return this.placeOrder(accountid, userid, cartid, paymentcapture).timeout(1000 * this.directdebitTimeout);
  }
}
