import { Injectable } from '@angular/core';
import { Observable } from 'rxjs/Observable';
import 'rxjs/add/observable/forkJoin';
import 'rxjs/add/operator/timeout';

import { ApiService, StorageService, Config } from '../../core';
import {
  Balance, CouponList, HttpData, PaymentModeList, PaymentModeListByMain,
  ResponseData, BankInfoList, CapturePaymentInfo, Coupon, TerminalInfo, BatchInfo
} from '../../data';
import { Order } from '../../data/models/order/order';
import { Cart } from '../../data/models/order/cart';

/**
 * 지불 처리 서비스
 */
@Injectable()
export class PaymentService {

  private directdebitTimeout: number;
  constructor(private api: ApiService,
    private storage: StorageService,
    private config: Config) {
    this.directdebitTimeout = this.config.getConfig('directdebitTimeout');
  }

  /**
   * AP 별 결제 수단 조회하기
   *
   * @param {string} storeid AP Name
   * @returns {PaymentModeList} AP 별 결제 수단목록
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
   * @param {string} userid 사용자아이디
   * @param {string} cartid 카트아이디
   * @returns {PaymentModeListByMain} 사용가능한 결제 수단
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
   * @returns {BankInfoList} 신용카드 무이자 할부 정보
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
   * @param {string} userid 회원아이디
   * @returns {Balance[]} 회원의 포인트 / Re-Cash 정보
   */
  getBalanceAndRecash(userid: string): Observable<Balance[]> {
    return Observable.forkJoin(this.getBalance(userid), this.getRecash(userid));
  }

  /**
   * 회원의 가용 포인트 조회
   *
   * @param {string} userid 회원아이디
   * @returns {Balance} 회원의 포인트 정보
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
   * @param {string} userid 회원아이디
   * @returns {Balance} 회원의 Re-Cash 정보
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
   * @param {string} accountid 회원 아이디
   * @param {string} userid 회원 아이디
   * @param {number} currentpage 현재 페이지
   * @param {number} pagesize 페이지사이즈
   * @param {string} sort 정렬값
   * @param {string} asc 정렬
   * @returns {CouponList} 쿠폰 목록
   */
  searchCoupons(accountid: string, userid: string, currentpage = 0, pagesize = 5, sort = 'startDate', asc = true): Observable<CouponList> {
    const pathvariables = { accountId: accountid, userId: userid };
    const params = { currentPage: currentpage, pageSize: pagesize, sort: sort, asc: asc, feilds: 'DEFAULT' };
    const data = new HttpData('searchCoupons', pathvariables, null, params, 'json');
    return this.api.get(data);
  }

  /**
   * 쿠폰 조회
   * @param {string} accountid 회원 아이디
   * @param {string} userid 회원 아이디
   * @param {string} couponcode 쿠폰코드
   * @returns {Coupon} 쿠폰정보
   */
  searchCoupon(accountid: string, userid: string, couponcode: string): Observable<Coupon> {
    const pathvariables = { accountId: accountid, userId: userid };
    const params = { voucherId: couponcode, feilds: 'DEFAULT' };
    const data = new HttpData('searchCoupon', pathvariables, null, params, 'json');
    return this.api.get(data);
  }

  /**
   * 쿠폰 적용
   *
   * @param {string} userid 회원 아이디
   * @param {string} cartid 카트 아이디
   * @param {string} couponcode 쿠폰 코드
   * @returns {Cart} 카트 정보
   */
  applyCoupon(userid: string, cartid: string, couponcode: string): Observable<Cart> {
    const pathvariables = { userId: userid, cartId: cartid };
    const param = { voucherId: couponcode, fields: 'FULL' };
    const data = new HttpData('applyCoupon', pathvariables, null, param, 'json');
    return this.api.post(data);
  }

  /**
   * 수표 조회
   *
   * @param {string} checknumber 수표번호(42 자리, 0으로 right padding)
   * @returns {ResponseData} 수표 조회 응답
   */
  searchCheque(checknumber: string): Observable<ResponseData> {
    const params = { checkNumber: checknumber };
    const data = new HttpData('searchCheque', null, null, params);
    return this.api.get(data);
  }

  /**
   * Payment Capture와 Place Order를 진행
   * 2018.07.20 배치 정보 추가
   *
   * @param {string} userid 회원 아이디
   * @param {string} cartid 카트 아이디
   * @param {CapturePaymentInfo} paymentcapture Payment Capture 정보
   * @returns {Order} 주문 정보
   */
  placeOrder(userid: string, cartid: string, paymentcapture: CapturePaymentInfo): Observable<Order> {
    const batch: BatchInfo = this.storage.getBatchInfo();
    const pathvariables = { userId: userid, cartId: cartid };
    const param = { batchId: batch.batchNo, fields: 'FULL' };
    const data = new HttpData('placeOrder', pathvariables, paymentcapture, param, 'json');
    return this.api.post(data);
  }

  /**
   * Payment Capture와 Place Order를 진행
   * 타임아웃 지정(자동이체 등)
   *
   * @param {string} userid 회원 아이디
   * @param {string} cartid 카트 아이디
   * @param {CapturePaymentInfo} paymentcapture Payment Capture 정보
   * @param {number} timeout 타임아웃 설정
   */
  placeOrderWithTimeout(userid: string, cartid: string, paymentcapture: CapturePaymentInfo, timeout = this.directdebitTimeout): Observable<Order> {
    return this.placeOrder(userid, cartid, paymentcapture).timeout(1000 * timeout);
  }

  /**
   * Cash Drawer open 로그 기록하기
   * AD 계정, 시간, AP 정보, POS 정보. 돈통 열렸을 때만 기록
   * cashier AD 번호
   * open 시간
   */
  cashDrawerLogging() {
    const batch: BatchInfo = this.storage.getBatchInfo();
    const pos: TerminalInfo = this.storage.getTerminalInfo();

    const data = new HttpData('cashdrawerLog', null, null, null, 'json');
    return this.api.post(data);
  }

}
