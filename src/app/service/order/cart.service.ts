import { Injectable, ElementRef } from '@angular/core';
import { HttpResponseBase } from '@angular/common/http';
import { Observable } from 'rxjs/Observable';

import { StorageService, ApiService, AlertService, Logger } from '../../core';
import {
  CartInfo, CartParams, CartModification, OrderEntries, OrderEntryList, Product, Accounts, OrderEntry,
  ProductInfo, SaveCartResult, CartList, CopyCartEntries, HttpData, ResCartInfo, MemberType, AmwayExtendedOrdering,
  CartModifications, TerminalInfo, CopyGroupCartEntries, ResponseMessage, Block, APIMethodType, PaymentCapture
} from '../../data';
import { Cart } from '../../data/models/order/cart';
import { MessageService } from '../../message';

/**
 * 장바구니 처리 서비스
 */
@Injectable()
export class CartService {
  constructor(private storage: StorageService,
    private api: ApiService,
    private alert: AlertService,
    private message: MessageService,
    private logger: Logger
  ) { }

  /**
   * 장바구니(Cart) 생성
   *
   * @param {string} accountId 회원 아이디
   * @param {string} userId 회원 아이디
   * @param {string} pickupStore AP명
   * @param {string} cartType 장바구니 타입 ex) POS -> 일반주문, POSGROUP -> 그룹주문
   * @returns {CartInfo} Cart 정보
   */
  createCartInfo(accountId: string, userId: string, pickupStore: string, cartType: string): Observable<CartInfo> {
    const macAddress = this.storage.getMacAddress(); // this.networkService.getLocalMacAddress('-');
    const cartParams = new CartParams(pickupStore, cartType);
    const param = { fields: 'BASIC', mac_address: macAddress };
    const pathvariables = { accountId: accountId, userId: userId };
    const data = new HttpData('createCart', pathvariables, cartParams, param, 'json');
    return this.api.post(data);
  }

  /**
   * VolumeAccount 수정
   *
   * @param {string} userId 회원 아이디
   * @param {string} cartId 카트 아이디
   * @param {string} volumeAccount 볼륨 아이디
   * @returns {HttpResponseBase} Http 응답
   */
  updateVolumeAccount(userId: string, cartId: string, volumeAccount: string): Observable<HttpResponseBase> {
    const pathvariables = { 'userId': userId, 'cartId': cartId };
    const param = { 'volumeAccount': volumeAccount };
    const data = new HttpData('updateVolAcc', pathvariables, null, param, 'json');
    return this.api.response(APIMethodType.PUT, data);
  }

  /**
   * 카트 조회
   *
   * @param {string} userId 회원 아이디
   * @param {string} cartId 카트 아이디
   * @returns {Cart} 카트 정보
   */
  getCartList(userId: string, cartId: string): Observable<Cart> {
    const pathvariables = { userId: userId, cartId: cartId };
    const param = { fields: 'FULL' };
    const data = new HttpData('getCartList', pathvariables, null, param, 'json');
    return this.api.get(data);
  }

  /**
   * 장바구니에 제품 추가
   *
   * @param {string} userId 회원 아이디
   * @param {string} cartId 카트 아이디
   * @param {string} code 제품 코드
   * @param {Array<string>} serialNumbers 시리얼/RFID 배열
   * @returns {ResCartInfo} 카트 정보
   */
  addCartEntry(userId: string, cartId: string, code: string, serialNumbers?: Array<string>): Observable<ResCartInfo> {
    const orderList = new OrderEntryList();
    const orderEntries: OrderEntry[] = [];
    const entry: OrderEntry = new OrderEntry(new ProductInfo(code));
    entry.quantity = 1;
    serialNumbers = serialNumbers.filter(arr => (arr !== null && arr !== '')) as string[];
    if (serialNumbers && serialNumbers.length > 0) { // null값이 들어갈 경우 체크
      entry.serialNumbersCodes = serialNumbers;
    }
    orderEntries.push(entry);
    orderList.orderEntries = orderEntries;
    return this.addCartEntries(userId, cartId, orderList.orderEntries);
  }

  /**
   * 장바구니 복제 시 사용
   *
   * @param {string} userId 회원 아이디
   * @param {string} cartId 카트 아이디
   * @param {Array<OrderEntry>} orderEntries 주문 엔트리 배열정보
   * @returns {ResCartInfo} 카트 정보
   */
  addCartEntries(userId: string, cartId: string, orderEntries: Array<OrderEntry>): Observable<ResCartInfo> {
    const orderList = new OrderEntryList();
    orderList.orderEntries = orderEntries;

    const pathvariables = { userId: userId, cartId: cartId };
    const param = { fields: 'FULL' };
    const data = new HttpData('addToCart', pathvariables, orderList, param, 'json');
    return this.api.post(data).flatMap((cartModifications: CartModifications) => {
      return this.getCartList(userId, cartId)
        .map(cart => new ResCartInfo(cart, cartModifications) as ResCartInfo);
    });
  }

  /**
   * 장바구니 복제
   *
   * @param {Accounts} changeCartInfo 변경 회원 정보
   * @param {Array<OrderEntry>} orderEntries 주문 엔트리 배열정보
   * @returns {CopyCartEntries} 복제한 카트 엔트리 정보
   */
  copyCartEntries(changeUserInfo: Accounts,
    orderEntries: Array<OrderEntry>): Observable<CopyCartEntries> {
    const terminalInfo = this.storage.getTerminalInfo();
    let accountId = '';

    if (changeUserInfo.accountTypeCode.toUpperCase() === MemberType.CONSUMER || changeUserInfo.accountTypeCode.toUpperCase() === MemberType.MEMBER) {
      accountId = changeUserInfo.parties[0].uid;
    } else {
      accountId = changeUserInfo.uid;
    }
    return this.createCartInfo(changeUserInfo.uid, accountId, terminalInfo.pointOfService.name, 'POS')
      .flatMap((cartInfo: CartInfo) => {
        return this.addCartEntries(cartInfo.user.uid, cartInfo.code, orderEntries)
          .map(addEntries => new CopyCartEntries(cartInfo, addEntries) as CopyCartEntries);
      });
  }

  /**
   * 그룹정보로 그룹장바구니 생성
   * @param orderList 그룹주문정보
   */
  copyGroupCart(orderList: AmwayExtendedOrdering): Observable<CopyGroupCartEntries> {
    const terminalInfo: TerminalInfo = this.storage.getTerminalInfo();
    const pickupStore = terminalInfo.pointOfService.name;
    return this.createCartInfo(orderList.orderList[0].user.uid, orderList.orderList[0].user.uid, pickupStore, 'POSGROUP')
      .flatMap((cartInfo: CartInfo) => {
        let accountUid = '';
        orderList.orderList.forEach((order, index) => {
          if (index > 0) {
            accountUid += ',' + order.volumeABOAccount.uid;
          }
        });

        return this.createGroupCart(cartInfo.user.uid, cartInfo.code, accountUid.slice(1))
          .map(amwayExtendedOrdering => new CopyGroupCartEntries(cartInfo, amwayExtendedOrdering) as CopyGroupCartEntries);
      });
  }

  /**
   * 제품 수량 수정
   *
   * @param {string} userId 회원 아이디
   * @param {string} cartId 카트 아이디
   * @param {number} entryNumber 엔트리 넘버
   * @param {string} code 제품 코드
   * @param {number} qty 수량
   * @param {Array<string>} serialNumbersCodes 시리얼/RFID 배열 정보
   * @returns {ResCartInfo} 카트 정보
   */
  updateItemQuantityCart(userId: string, cartId: string, entryNumber: number, code: string, qty: number, serialNumbersCodes?: Array<string>): Observable<ResCartInfo> {
    const o1: OrderEntries = new OrderEntries(new Product(code), qty.toString(), serialNumbersCodes);
    const pathvariables = { userId: userId, cartId: cartId, entryNumber: entryNumber };
    const param = { fields: 'FULL' };
    const data = new HttpData('updateItemQtyCart', pathvariables, o1, param, 'json');
    return this.api.put(data).flatMap((cartModification: CartModification) => {
      const arrayCart = new Array<CartModification>();
      arrayCart.push(cartModification);
      const carts = new CartModifications(arrayCart);
      return this.getCartList(userId, cartId)
        .map(cart => new ResCartInfo(cart, carts) as ResCartInfo);
    });
  }

  /**
   * 장바구니 개별 삭제
   *
   * @param {string} userId 회원 아이디
   * @param {string} cartId 카트 아이디
   * @param {number} entryNumber 엔트리 넘버
   * @returns {ResCartInfo} 삭제후 재조회한 카트 정보
   */
  deleteCartEntries(userId: string, cartId: string, entryNumber: number): Observable<ResCartInfo> {
    const pathvariables = { 'userId': userId, 'cartId': cartId, 'entryNumber': entryNumber };
    const data = new HttpData('deleteItemCart', pathvariables, null, null, 'json');
    return this.api.response(APIMethodType.DELETE, data).flatMap((httpRes: HttpResponseBase) => {
      return this.getCartList(userId, cartId).map(cart => new ResCartInfo(cart) as ResCartInfo);
    });
  }

  /**
   * 장바구니 삭제
   *
   * @param {string} userId 회원 아이디
   * @param {string} cartId 카트 아이디
   * @returns {HttpResponseBase} Http 응답
   */
  deleteCart(userId: string, cartId: string): Observable<HttpResponseBase> {
    const pathvariables = { 'userId': userId, 'cartId': cartId };
    const data = new HttpData('deleteCart', pathvariables, null, null, 'json');
    return this.api.response(APIMethodType.DELETE, data);
  }

  /**
   * 보류된 장바구니 리스트 가져오기
   *
   * @param {string} userId 회원 아이디
   * @returns {CartList} 카트 목록
   */
  getSaveCarts(userId?: string): Observable<CartList> {
    const macAddress = this.storage.getMacAddress();

    let param = {};
    if (userId) {
      param = { userId: userId, fields: 'FULL' };
    } else {
      param = { fields: 'FULL' };
    }
    const pathvariables = { macAddress: macAddress };
    const data = new HttpData('getSaveCart', pathvariables, null, param, 'json');
    return this.api.get(data);
  }

  /**
   * 장바구니 보류
   *
   * @param {string} accountId 회원 아이디
   * @param {string} userId 회원 아이디
   * @param {string} cartId 카트 아이디
   * @returns {SaveCartResult} 보류되어 저장된 카트 결과
   */
  saveCart(accountId: string, userId: string, cartId: string): Observable<SaveCartResult> {
    const tokenInfo = this.storage.getTokenInfo();
    const cashierId = tokenInfo.employeeId;
    const macAddress = this.storage.getMacAddress();
    const pathvariables = { 'accountId': accountId, 'userId': userId, 'cashierId': cashierId, 'macAddress': macAddress, 'cartId': cartId };
    const data = new HttpData('saveCart', pathvariables, null, null, 'json');
    return this.api.patch(data);
  }

  /**
   * 보류된 장바구니 복원
   *
   * @param {string} userId 회원 아이디
   * @param {string} cartId 카트 아이디
   * @returns {SaveCartResult} 보류에서 복원된 카트 결과
   */
  restoreSavedCart(userId: string, cartId: string): Observable<SaveCartResult> {
    const pathvariables = { 'userId': userId, 'cartId': cartId };
    const data = new HttpData('restoreCart', pathvariables, null, null, 'json');
    return this.api.patch(data);
  }

  /**
   * 그룹 장바구니 생성
   *
   * @param {string} userId 회원 아이디
   * @param {string} cartId 카트 아이디
   * @param {string} volumeAccounts 볼륨회원정보 (여러 회원을 ,로 구분 ex) 7480001,7460002)
   * @returns {AmwayExtendedOrdering} 그룹주문 정보
   */
  createGroupCart(userId: string, cartId: string, volumeAccounts: string): Observable<AmwayExtendedOrdering> {
    const arrVolumeAccount = new Array<string>();
    volumeAccounts.split(',').forEach(volumeAccount => {
      arrVolumeAccount.push(volumeAccount.trim());
    });

    const param = { fields: 'FULL', volumeAccounts: arrVolumeAccount };
    const pathvariables = { userId: userId, cartId: cartId };
    const data = new HttpData('createGroupCart', pathvariables, null, param, 'json');
    return this.api.post(data);
  }

  /**
   * 그룹 장바구니 조회
   *
   * @param {string} userId 회원 아이디
   * @param {string} cartId 카트 아이디
   * @returns {AmwayExtendedOrdering} 그룹주문 정보
   */
  getGroupCart(userId: string, cartId: string): Observable<AmwayExtendedOrdering> {
    const param = { fields: 'FULL' };
    const pathvariables = { userId: userId, cartId: cartId };
    const data = new HttpData('getGroupCart', pathvariables, null, param, 'json');
    return this.api.get(data);
  }

  /**
   * 회원 블록 체크
   *
   * @param {ResponseMessage} resp 응답값
   * @param {Accounts} account 회원 정보
   * @param {ElementRef} el 엘리먼트 요소 정보
   */
  checkUserBlock(resp: ResponseMessage, account: Accounts, el?: ElementRef): string {
    if (resp.code === Block.INVALID) {
      this.alert.error({ title: '알림', message: this.message.get('block.invalid'), timer: true, interval: 2000 });
    } else if (resp.code === Block.NOT_RENEWAL) {
      const custname = account.accountTypeCode === MemberType.ABO ? account.name : account.parties[0].name;
      this.alert.error({ title: '알림', message: this.message.get('block.notrenewal', custname, account.uid, resp.returnMessage), timer: true, interval: 2000 });
    } else if (resp.code === Block.LOGIN_BLOCKED) {
      this.alert.error({ title: '알림', message: this.message.get('block.loginblock'), timer: true, interval: 2000 });
    } else if (resp.code === Block.ORDER_BLOCK) {
      this.alert.error({ title: '알림', message: this.message.get('block.orderblock'), timer: true, interval: 2000 });
    }
    if (resp.code !== Block.VALID) {
      if (el) {
        setTimeout(() => { el.nativeElement.focus(); }, 2100);
      }
    }
    return resp.code;
  }

  /**
   * 주문 블럭 체크하기
   *
   * VALID = '0000',
   * INVALID = '0001',
   * NOT_RENEWAL = '0002',
   * LOGIN_BLOCKED = '0003',
   * ORDER_BLOCK = '0005'
   *
   * @param {string} code 블럭체크 응답 코드
   */
  checkOrderBlock(code: string): boolean {
    if (code === Block.ORDER_BLOCK) {
      return true;
    }
    return false;
  }

  /**
   * 과세물품 : 총 금액
   * totalPrice + orderDiscounts + orderTaxDiscount + productDiscounts + productTaxDiscount
   * @param cartInfo 카트 정보
   */
  getTaxablePrice(cartInfo: Cart) {
    const totalprice = cartInfo.totalPrice ? cartInfo.totalPrice.value : 0;
    const taxableprice = totalprice + this.getDiscountPrice(cartInfo);
    this.logger.set('cart.service', `taxable price : ${taxableprice}`).debug();
    return taxableprice;
  }

  /**
   * 부가세 : 총 세금 금액
   * totalTax
   * @param cartInfo 카트 정보
   */
  getTaxPrice(cartInfo: Cart) {
    const taxprice = cartInfo.totalTax ? cartInfo.totalTax.value : 0; // 총 세금 금액
    this.logger.set('cart.service', `tax price : ${taxprice}`).debug();
    return taxprice;
  }

  /**
   * 합계 : 세금 포함 총 금액
   * 과세물품 + 부가세
   * @param cartInfo 카트 정보
   */
  getTotalPriceWithTax(cartInfo: Cart) {
    // const totalprice = this.getTaxablePrice(cartInfo) + this.getTaxPrice(cartInfo);
    const totalprice = cartInfo.totalPriceWithTax ? cartInfo.totalPriceWithTax.value : 0;
    this.logger.set('cart.service', `total price : ${totalprice}`).debug();
    return totalprice;
  }

  /**
   * 할인금액 : 세금을 포함한 총 할인금액
   * orderDiscounts + orderTaxDiscount + productDiscounts + productTaxDiscount
   * @param cartInfo 카트 정보
   */
  getDiscountPrice(cartInfo: Cart) {
    const orderdiscount = cartInfo.orderDiscounts ? cartInfo.orderDiscounts.value : 0;
    const ordertaxdiscount = cartInfo.orderTaxDiscount ? cartInfo.orderTaxDiscount.value : 0;
    const productdiscount = cartInfo.productDiscounts ? cartInfo.productDiscounts.value : 0;
    const producttaxdiscount = cartInfo.productTaxDiscount ? cartInfo.productTaxDiscount.value : 0;
    this.logger.set('cart.service', `order discount : ${orderdiscount}`).debug();
    this.logger.set('cart.service', `order tax discount : ${ordertaxdiscount}`).debug();
    this.logger.set('cart.service', `product discount : ${productdiscount}`).debug();
    this.logger.set('cart.service', `product tax discount : ${producttaxdiscount}`).debug();
    const discountprice = orderdiscount + ordertaxdiscount + productdiscount + producttaxdiscount;
    this.logger.set('cart.service', `discount price : ${discountprice}`).debug();
    return discountprice;
  }

  /**
   * 결제금액 : 총 금액(TAX 제외) + 부가세 - 포인트 - Re-Cash
   *
   * @param {Cart} cartInfo 카트 정보
   * @param {PaymentCapture} paymentCapture 결제 캡쳐 정보
   */
  getPaymentPrice(cartInfo: Cart, paymentCapture?: PaymentCapture) {
    if (!paymentCapture) {
      paymentCapture = this.storage.getPaymentCapture();
    }
    // const totalprice = cartInfo.totalPrice ? cartInfo.totalPrice.value : 0;
    // let paymentprice =  totalprice + this.getTaxPrice(cartInfo);
    let paymentprice = cartInfo.totalPriceWithTax ? cartInfo.totalPriceWithTax.value : 0;
    this.logger.set('cart.service', `payment price : ${paymentprice}`).debug();
    if (paymentCapture.pointPaymentInfo) { // 포인트 내역
      const pointamount = paymentCapture.pointPaymentInfo.amount;
      paymentprice = paymentprice - pointamount;
    }
    if (paymentCapture.monetaryPaymentInfo) { // Recash 내역
      const recashamount = paymentCapture.monetaryPaymentInfo.amount;
      paymentprice  = paymentprice - recashamount;
    }
    return paymentprice;
  }

}
