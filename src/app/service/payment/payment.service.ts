import { HttpErrorResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs/Observable';
import 'rxjs/add/observable/forkJoin';
import 'rxjs/add/operator/timeout';

import { ApiService, StorageService, Config, CardApprovalResult, ICCardApprovalResult } from '../../core';
import {
  Balance, CouponList, HttpData, PaymentModeList, PaymentModeListByMain,
  ResponseData, BankInfoList, CapturePaymentInfo, BatchInfo, ResponseMessage,
  PaymentCapture, PaymentView, CashPaymentInfo, CashType, PaymentModeData, PaymentModes,
  CurrencyData, CreditCardPaymentInfo, VanTypes, CCMemberType, CCPaymentType, DirectDebitPaymentInfo,
  ICCardPaymentInfo, PointType, PointPaymentInfo, AmwayMonetaryPaymentInfo
} from '../../data';
import { Order } from '../../data/models/order/order';
import { Cart } from '../../data/models/order/cart';
import { InfoBroker } from '../../broker';
import { Utils } from '../../core/utils';
import { BankAccount } from '../../data/models/order/bank-account';
import { OrderService } from '../order/order.service';

/**
 * 지불 처리 서비스
 */
@Injectable()
export class PaymentService {

  private directdebitTimeout: number;
  constructor(private api: ApiService,
    private order: OrderService,
    private storage: StorageService,
    private info: InfoBroker,
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
   * @returns {CouponList} 쿠폰 목록 첫번째 값
   */
  searchCoupon(accountid: string, userid: string, couponcode: string): Observable<CouponList> {
    const pathvariables = { accountId: accountid, userId: userid };
    const params = { voucherId: couponcode, feilds: 'DEFAULT' };
    const data = new HttpData('searchCoupon', pathvariables, null, params, 'json');
    return this.api.get(data);
  }

  /**
   * 쿠폰 적용(카트)
   * apac 의 voucher 정보를 payment정보에 전달하지 않고
   * CART에 전달하여 처리
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
   * 쿠폰 삭제(카트)
   * 카트에 적용된 쿠폰 정보를 삭제
   * 
   * @param {string} userid 회원 아이디
   * @param {string} cartid 카트 아이디
   * @param {string} couponcode 쿠폰 코드
   * @returns {Cart} 카트 정보
   */
  deleteCoupon(userid: string, cartid: string, couponcode: string): Observable<Cart> {
    const pathvariables = { userId: userid, cartId: cartid, voucherId: couponcode };
    const param = { fields: 'FULL' };
    const data = new HttpData('deleteCoupon', pathvariables, null, param, 'json');
    return this.api.delete(data);
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
  cashDrawerLogging(): Observable<ResponseMessage> {
    const batch: BatchInfo = this.storage.getBatchInfo();
    const pathvariables = { batchId: batch.batchNo };
    const data = new HttpData('cashdrawerLog', pathvariables, null, null, 'json');
    return this.api.post(data);
  }

  /**
   * 장바구니와 클라이언트에 정보 전달
   *
   * @param payment Payment Capture 정보
   * @param order Order 정보
   */
  sendPaymentAndOrderInfo(payment: PaymentCapture, order: Order): void {
    this.info.sendInfo('payinfo', [payment, order]);
    this.storage.setPayment([payment, order]);
  }

  /**
   * @deprecated
   * 일반결제/복합결제인지 체크
   * 지불금액과 결제금액이 같을 경우 최종 결제 진행
   * 위의 조건이 만족할 경우
   * 1이면 일반결제, 1보다 크면 복합결제
   *
   * @param paymentcapture Payment 정보
   * @returns {number} 일반결제인지 복합결제 인지 체크
   */
  getPaymentCheck(paymentcapture: PaymentCapture): number {
    let check = 0;
    if (paymentcapture) {
      Object.keys(paymentcapture).forEach((key) => {
        const payment = paymentcapture[key];
        if (payment != null) { check++; }
      });
      return check;
    }
  }

  /**
   * 결제 내역 설정
   * 
   * 결제금액 : 전체 금액 - 프로모션 금액
   * 받은금액 : 결제수단 총합 금액
   * 거스름돈 : 거스름돈
   *
   * @param {PaymentCapture} paymentcapture Payment Capture 정보
   * @param {Order} order 주문정보
   * @returns {PaymentView} 결제 금액 정보
   */
  viewPayment(paymentcapture: PaymentCapture, order: Order): PaymentView {
    const pay = new PaymentView();
    let receivedprice = 0;
    if (paymentcapture) {
      if (paymentcapture.ccPaymentInfo) { // 신용카드
        const cc = paymentcapture.ccPaymentInfo;
        receivedprice += cc.amount ? cc.amount : 0;
        pay.setCardamount = cc.amount ? cc.amount : 0;
        pay.setCardinstallment = cc.installmentPlan ? cc.installmentPlan : '-1';
      }
      if (paymentcapture.cashPaymentInfo) { // 현금결제
        const cash = paymentcapture.cashPaymentInfo;
        receivedprice += cash.amount ? cash.amount : 0;
        const change = cash.change ? Number(cash.change) : 0;
        receivedprice += change; // 받은돈으로 처리하거나 거스름돈을 현금 결제금액에 더해줌.
        pay.setCashamount = cash.amount ? cash.amount : 0;
        pay.setCashchange = cash.change ? Number(cash.change) : 0;
      }
      if (paymentcapture.directDebitPaymentInfo) { // 자동이체
        const ddamount = paymentcapture.directDebitPaymentInfo.amount;
        receivedprice += ddamount ? ddamount : 0;
        pay.setDirectdebitamount = ddamount ? ddamount : 0;
      }
      if (paymentcapture.pointPaymentInfo) { // 포인트결제
        const pointamount = paymentcapture.pointPaymentInfo.amount;
        receivedprice += pointamount ? pointamount : 0;
        pay.setPointamount = pointamount ? pointamount : 0;
      }
      if (paymentcapture.monetaryPaymentInfo) { // 미수금결제(Recash 내역)
        const recashamount = paymentcapture.monetaryPaymentInfo.amount;
        receivedprice += recashamount ? recashamount : 0;
        pay.setRecashamount = recashamount ? recashamount : 0;
      }
      if (paymentcapture.icCardPaymentInfo) { // 현금IC카드
        const ic = paymentcapture.icCardPaymentInfo;
        receivedprice += ic.amount ? ic.amount : 0;
        pay.setCardamount = ic.amount ? ic.amount : 0;
        pay.setCardinstallment = '0';
      }
      pay.setReceivedamount = receivedprice ? receivedprice : 0; // 받은금액 : 모든 결제 수단 합계
    }
    if (order) {
      pay.setDiscount = order.totalDiscounts ? order.totalDiscounts.value : 0;
      pay.setPv = (order.totalPrice && order.totalPrice.amwayValue) ? order.totalPrice.amwayValue.pointValue : 0;
      pay.setBv = (order.totalPrice && order.totalPrice.amwayValue) ? order.totalPrice.amwayValue.businessVolume : 0;
      // pay.setTotalprice = order.totalPrice ? order.totalPrice.value : 0;
      pay.setTotalprice = order.totalPrice ? this.order.getTotalPriceWithTax(order) : 0;
    }
    return pay;
  }

  /**
   * 현금 결제 지불 정보 데이터 생성
   *
   * @param paymentcapture 지불 정보 객체
   * @param paidamount 지불 금액
   * @param received 받은 금액
   * @param change 거스름돈
   * @returns {CapturePaymentInfo} 결제 지불 정보
   */
  makeCashPaymentCaptureData(paymentcapture: PaymentCapture, paidamount: number, received: number, change: number): CapturePaymentInfo {
    let paidamountbypayment = paidamount;
    if (Number(paidamount) > Number(received)) {
      paidamountbypayment = received;
    }
    const capturepaymentinfo = new CapturePaymentInfo();
    const cash = new CashPaymentInfo(paidamountbypayment, CashType.CASH);
    cash.setReceived = received;
    cash.setChange = change < 0 ? 0 : change;
    cash.setPaymentModeData = new PaymentModeData(PaymentModes.CASH);
    cash.setCurrencyData = new CurrencyData();
    if (paymentcapture) {
      paymentcapture.setVoucherPaymentInfo = null; // 쿠폰은 INTERNAL_PROCESS에서 처리하므로 Payment에 세팅안되도록 주의!
      paymentcapture.setCashPaymentInfo = cash;
      capturepaymentinfo.setPaymentModeCode = this.storage.getPaymentModeCode();
      capturepaymentinfo.setCapturePaymentInfoData = paymentcapture;
    } else {
      const paymentcap = new PaymentCapture();
      paymentcap.setVoucherPaymentInfo = null; // 쿠폰은 INTERNAL_PROCESS에서 처리하므로 Payment에 세팅안되도록 주의!
      paymentcap.setCashPaymentInfo = cash;
      capturepaymentinfo.setPaymentModeCode = this.storage.getPaymentModeCode() ? this.storage.getPaymentModeCode() : PaymentModes.CASH;
      capturepaymentinfo.setCapturePaymentInfoData = paymentcap;
    }
    this.storage.setPaymentCapture(capturepaymentinfo.capturePaymentInfoData);
    return capturepaymentinfo;
  }

  /**
   * 신용카드 결제 지불 정보 데이터 생성
   *
   * @param paymentcapture 지불 정보 객체
   * @param cardresult 카드 승인 응답 객체
   * @param paidamount 지불 금액
   * @returns {CapturePaymentInfo} 결제 지불 정보
   */
  makeCCPaymentCaptureData(paymentcapture: PaymentCapture, cardresult: CardApprovalResult, paidamount: number): CapturePaymentInfo {
    const capturepaymentinfo = new CapturePaymentInfo();
    const ccard = this.makeCCPaymentInfo(cardresult, paidamount);
    if (paymentcapture) {
      paymentcapture.setVoucherPaymentInfo = null; // 쿠폰은 INTERNAL_PROCESS에서 처리하므로 Payment에 세팅안되도록 주의!
      paymentcapture.setCcPaymentInfo = ccard;
      capturepaymentinfo.paymentModeCode = this.storage.getPaymentModeCode() ? this.storage.getPaymentModeCode() : PaymentModes.CREDITCARD;
      capturepaymentinfo.capturePaymentInfoData = paymentcapture;
    } else {
      const paymentcap = new PaymentCapture();
      paymentcap.setVoucherPaymentInfo = null; // 쿠폰은 INTERNAL_PROCESS에서 처리하므로 Payment에 세팅안되도록 주의!
      paymentcap.setCcPaymentInfo = ccard;
      capturepaymentinfo.paymentModeCode = this.storage.getPaymentModeCode() ? this.storage.getPaymentModeCode() : PaymentModes.CREDITCARD;
      capturepaymentinfo.capturePaymentInfoData = paymentcap;
    }
    this.storage.setPaymentCapture(capturepaymentinfo.capturePaymentInfoData);
    return capturepaymentinfo;
  }

  /**
   * 신용카드 지불 정보 설정
   *
   * 카드 취소 시에 18자리라면 Hybris에서 cardTransactionId에 NC를 붙여서 처리
   * 매입 관련 처리 시에는 POS에서 들어온 건에 대해서는 18자리로 처리 해야하기 때문에
   * POS에서 NC를 붙혀 처리하지 않음.
   *
   * @param cardresult 신용카드 승인 응답 결과값
   * @param paidamount 지불 금액
   * @returns {CreditCardPaymentInfo} 결제 지불 정보
   */
  private makeCCPaymentInfo(cardresult: CardApprovalResult, paidamount: number): CreditCardPaymentInfo {
    const ccard = new CreditCardPaymentInfo(paidamount);
    ccard.setCardNumber = cardresult.maskedCardNumber;
    ccard.setCardAuthNumber = cardresult.approvalNumber; // 승인번호
    ccard.setCardMerchantNumber = cardresult.merchantNumber; // 가맹점 번호
    ccard.setCardCompanyCode = cardresult.issuerCode; // NICE 단말 reading 된 거래 카드사 코드 전송
    ccard.setPaymentInfoLine1 = cardresult.issuerName; // 카드사명
    ccard.setIssuer = cardresult.issuerName; // 카드사명
    ccard.setVanType = VanTypes.NICE; // NICE 단말 사용
    ccard.setCardAcquirerCode = cardresult.acquireCode; // 매입사 코드
    ccard.setInstallmentPlan = Number(cardresult.installmentMonth) + '';
    ccard.setCardApprovalNumber = cardresult.approvalNumber;
    ccard.setCardRequestDate = Utils.convertDateStringForHybris(cardresult.approvalDateTime);
    ccard.setNumber = cardresult.maskedCardNumber;
    ccard.setMemberType = CCMemberType.PERSONAL;
    ccard.setPaymentType = CCPaymentType.GENERAL;
    ccard.setCardType = PaymentModes.CREDITCARD;
    ccard.setTransactionId = cardresult.resultMsg1; // 정상 승인시 무카드(고유번호), 거래 고유번호(18)
    ccard.setCardTransactionId = cardresult.resultMsg1; // 정상 승인시 무카드(고유번호), 거래 고유번호(18)
    const signdata = cardresult.signData; // 5만원 이상 결제할 경우 sign data 전송
    if (Utils.isNotEmpty(signdata)) {
      ccard.setPaymentSignature = signdata;
    }
    ccard.setPaymentModeData = new PaymentModeData(PaymentModes.CREDITCARD);
    ccard.setCurrencyData = new CurrencyData();
    return ccard;
  }

  /**
   * 자동이체 결제 지불 정보 데이터 생성
   *
   * @param paymentcapture 지불 정보 객체
   * @param bank 자동이체 계좌 정보
   * @param paidamount 지불 금액
   * @returns {CapturePaymentInfo} 결제 지불 정보
   */
  makeDirectDebitPaymentCaptureData(paymentcapture: PaymentCapture, bank: BankAccount, paidamount: number): CapturePaymentInfo {
    const capturepaymentinfo = new CapturePaymentInfo();
    const directdebit = new DirectDebitPaymentInfo(paidamount);
    directdebit.accountNumber = bank.accountNumber;
    directdebit.bank = bank.bankInfo ? bank.bankInfo.name : '';
    directdebit.bankIDNumber = bank.bankInfo ? bank.bankInfo.code : '';
    directdebit.baOwner = bank.depositor;
    directdebit.paymentMode = new PaymentModeData(PaymentModes.DIRECTDEBIT);
    directdebit.currency = new CurrencyData();
    if (paymentcapture) {
      paymentcapture.setVoucherPaymentInfo = null; // 쿠폰은 INTERNAL_PROCESS에서 처리하므로 Payment에 세팅안되도록 주의!
      paymentcapture.directDebitPaymentInfo = directdebit;
      capturepaymentinfo.paymentModeCode = this.storage.getPaymentModeCode();
      capturepaymentinfo.capturePaymentInfoData = paymentcapture;
    } else {
      const paymentcap = new PaymentCapture();
      paymentcap.setVoucherPaymentInfo = null; // 쿠폰은 INTERNAL_PROCESS에서 처리하므로 Payment에 세팅안되도록 주의!
      paymentcap.directDebitPaymentInfo = directdebit;
      capturepaymentinfo.paymentModeCode = this.storage.getPaymentModeCode() ? this.storage.getPaymentModeCode() : PaymentModes.DIRECTDEBIT;
      capturepaymentinfo.capturePaymentInfoData = paymentcap;
    }
    this.storage.setPaymentCapture(capturepaymentinfo.capturePaymentInfoData);
    return capturepaymentinfo;
  }

  /**
   * 현금 IC카드 결제 지불 정보 데이터 생성
   *
   * @param paymentcapture 지불 정보 객체
   * @param cardresult 현금 IC카드 승인 응답 정보
   * @param paidamount 지불 금액
   * @returns {CapturePaymentInfo} 결제 지불 정보
   */
  makeICPaymentCaptureData(paymentcapture: PaymentCapture, cardresult: ICCardApprovalResult, paidamount: number): CapturePaymentInfo {
    const capturepaymentinfo = new CapturePaymentInfo();
    const iccard = this.makeICPaymentInfo(cardresult, paidamount);
    if (paymentcapture) {
      paymentcapture.setVoucherPaymentInfo = null; // 쿠폰은 INTERNAL_PROCESS에서 처리하므로 Payment에 세팅안되도록 주의!
      paymentcapture.setIcCardPaymentInfo = iccard;
      capturepaymentinfo.paymentModeCode = this.storage.getPaymentModeCode();
      capturepaymentinfo.capturePaymentInfoData = paymentcapture;

    } else {
      const paymentcap = new PaymentCapture();
      paymentcap.setVoucherPaymentInfo = null; // 쿠폰은 INTERNAL_PROCESS에서 처리하므로 Payment에 세팅안되도록 주의!
      paymentcap.setIcCardPaymentInfo = iccard;
      capturepaymentinfo.paymentModeCode = this.storage.getPaymentModeCode() ? this.storage.getPaymentModeCode() : PaymentModes.ICCARD;
      capturepaymentinfo.capturePaymentInfoData = paymentcap;
    }
    this.storage.setPaymentCapture(capturepaymentinfo.capturePaymentInfoData);
    return capturepaymentinfo;
  }

  /**
   * 현금 IC카드 지불 정보 설정
   *
   * @param cardresult 현금 IC카드 승인 응답 결과값
   * @param paidamount 지불 금액
   * @returns {ICCardPaymentInfo} 결제 지불 정보
   */
  private makeICPaymentInfo(cardresult: ICCardApprovalResult, paidamount: number): ICCardPaymentInfo {
    const iccard = new ICCardPaymentInfo(paidamount);
    iccard.setCardNumber = cardresult.iccardSerialNumber;
    iccard.setCardAuthNumber = cardresult.approvalNumber; // 승인번호
    iccard.setCardMerchantNumber = cardresult.merchantNumber; // 가맹점 번호
    iccard.setCardCompanyCode = cardresult.issuerCode; // NICE 단말 reading 된 거래 카드사 코드 전송
    iccard.setPaymentInfoLine1 = cardresult.issuerName;
    iccard.setIssuer = cardresult.issuerName;
    iccard.setVanType = VanTypes.NICE; // NICE 단말 사용
    iccard.setCardAcquirerCode = cardresult.acquireCode; // 매입사 코드
    iccard.setInstallmentPlan = '00';
    iccard.setCardApprovalNumber = cardresult.approvalNumber;
    iccard.setCardRequestDate = Utils.convertDateStringForHybris(cardresult.approvalDateTime);
    iccard.setNumber = cardresult.iccardSerialNumber;
    iccard.setMemberType = CCMemberType.PERSONAL;
    iccard.setPaymentType = CCPaymentType.GENERAL;
    iccard.setCardType = PaymentModes.ICCARD;
    iccard.setTransactionId = cardresult.processingNumber; // 현금IC카드는 무카드 없음.
    iccard.setCardTransactionId = cardresult.processingNumber; // 현금IC카드는 무카드 없음.
    const signdata = cardresult.signData; // 5만원 이상 결제할 경우 sign data 전송
    if (Utils.isNotEmpty(signdata)) {
      iccard.setPaymentSignature = signdata;
    }
    iccard.setPaymentModeData = new PaymentModeData(PaymentModes.ICCARD);
    iccard.setCurrencyData = new CurrencyData();
    return iccard;
  }

  /**
   * 포인트 결제 지불 정보 데이터 생성
   *
   * @param paymentcapture 지불 정보 객체
   * @param pointType 포인트 유형
   * @param paidamount 지불 금액
   * @returns {CapturePaymentInfo} 결제 지불 정보
   */
  makePointPaymentCaptureData(paymentcapture: PaymentCapture, pointType: string, paidamount: number): CapturePaymentInfo {
    const capturepaymentinfo = new CapturePaymentInfo();
    const pointtype = (pointType === 'a') ? PointType.BR030 : PointType.BR033; // 전환포인트 : 멤버포인트
    const point = new PointPaymentInfo(paidamount, pointtype);
    point.setPaymentModeData = new PaymentModeData(PaymentModes.POINT);
    point.setCurrencyData = new CurrencyData();
    if (paymentcapture) {
      paymentcapture.setVoucherPaymentInfo = null; // 쿠폰은 INTERNAL_PROCESS에서 처리하므로 Payment에 세팅안되도록 주의!
      paymentcapture.setPointPaymentInfo = point;
      capturepaymentinfo.paymentModeCode = this.storage.getPaymentModeCode();
      capturepaymentinfo.capturePaymentInfoData = paymentcapture;

    } else {
      const paymentcap = new PaymentCapture();
      paymentcap.setVoucherPaymentInfo = null; // 쿠폰은 INTERNAL_PROCESS에서 처리하므로 Payment에 세팅안되도록 주의!
      paymentcap.setPointPaymentInfo = point;
      capturepaymentinfo.paymentModeCode = this.storage.getPaymentModeCode();
      capturepaymentinfo.capturePaymentInfoData = paymentcap;
    }
    this.storage.setPaymentCapture(capturepaymentinfo.capturePaymentInfoData);
    return capturepaymentinfo;
  }

  /**
   * Re-Cash 결제 지불 정보 데이터 생성
   *
   * @param paymentcapture 지불 정보 객체
   * @param paidamount 지불 금액
   * @returns {CapturePaymentInfo} 결제 지불 정보
   */
  makeRecashPaymentCaptureData(paymentcapture: PaymentCapture, paidamount: number): CapturePaymentInfo {
    const capturepaymentinfo = new CapturePaymentInfo();
    const recash = new AmwayMonetaryPaymentInfo(paidamount);
    recash.setPaymentModeData = new PaymentModeData(PaymentModes.ARCREDIT);
    recash.setCurrencyData = new CurrencyData();
    if (paymentcapture) {
      paymentcapture.setVoucherPaymentInfo = null; // 쿠폰은 INTERNAL_PROCESS에서 처리하므로 Payment에 세팅안되도록 주의!
      paymentcapture.setMonetaryPaymentInfo = recash;
      capturepaymentinfo.paymentModeCode = this.storage.getPaymentModeCode();
      capturepaymentinfo.capturePaymentInfoData = paymentcapture;
    } else {
      const paymentcap = new PaymentCapture();
      paymentcap.setVoucherPaymentInfo = null; // 쿠폰은 INTERNAL_PROCESS에서 처리하므로 Payment에 세팅안되도록 주의!
      paymentcap.setMonetaryPaymentInfo = recash;
      capturepaymentinfo.paymentModeCode = this.storage.getPaymentModeCode() ? this.storage.getPaymentModeCode() : PaymentModes.ARCREDIT;
      capturepaymentinfo.capturePaymentInfoData = paymentcap;
    }
    this.storage.setPaymentCapture(capturepaymentinfo.capturePaymentInfoData);
    return capturepaymentinfo;
  }

  /**
   * 결제 에러 메시지 생성
   * 
   * @param error 에러 정보
   * @returns {string} 에러 메시지
   */
  paymentError(error: any): string {
    let msg = '';
    if (error instanceof HttpErrorResponse) {
      switch (error.status) {
        case 500: {
          msg = `[내부 서버 오류] 서버에 오류가 발생하여 요청을 수행할 수 없습니다.${error.message}`;
        } break;
        case 501: {
          msg = `[구현되지 않음] 서버에 요청을 수행할 수 있는 기능이 없습니다.${error.message}`;
        } break;
        case 502: {
          msg = `[Bad Gateway] 서버에서 잘못된 응답을 받았습니다.${error.message}`;
        } break;
        case 503: {
          msg = `[서비스를 사용할 수 없음] 서버가 다운되어 서버를 사용할 수 없습니다.${error.message}`;
        } break;
        case 504: {
          msg = `[시간초과] 서버에서 요청을 받지 못했습니다.${error.message}`;
        } break;
        default: {
          msg = `결제 처리 시 오류가 발생하였습니다.`;
        } break;
      }
    } else {
      msg = `[${error.name}] ${error.message}`;
    }
    return msg;
  }

  /**
   * 결제 방법에 우선 순위를 부여하여 paymentMode를 셋팅
   * 1. 자동이체 2. 카드 3. 현금 4.포인트
   * 
   * @param {PaymentCapture} paymentCapture 지불 캡쳐 정보
   * @returns {string} 우선순위에 따른 주결제 수단 정보
   */
  getPaymentModeCode(paymentCapture: PaymentCapture): string {
    const paymentmodecodes: Array<string> = new Array<string>();
    Object.keys(paymentCapture).forEach((key) => {
      const payment = paymentCapture[key];
      if (payment != null) { paymentmodecodes.push(payment.paymentMode.code); }
    });
    if (paymentmodecodes.indexOf(PaymentModes.DIRECTDEBIT) !== -1) {
      return PaymentModes.DIRECTDEBIT;
    }
    if (paymentmodecodes.indexOf(PaymentModes.CREDITCARD) !== -1) {
      return PaymentModes.CREDITCARD;
    }
    if (paymentmodecodes.indexOf(PaymentModes.CASH) !== -1) {
      return PaymentModes.CASH;
    }
    if (paymentmodecodes.indexOf(PaymentModes.POINT) !== -1) {
      return PaymentModes.POINT;
    }
    return this.storage.getPaymentModeCode();
  }

}
