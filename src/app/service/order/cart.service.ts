import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams, HttpResponseBase } from '@angular/common/http';
import { Observable } from 'rxjs/Observable';

import { StorageService, Config, ApiService } from '../../core';
import {
  CartInfo, CartParams, CartModification, OrderEntries, OrderEntryList, Product, Accounts, OrderEntry,
  ProductInfo, SaveCartResult, CartList, CopyCartEntries, HttpData, ResCartInfo, MemberType, AmwayExtendedOrdering,
  ResponseMessage, CartModifications, TerminalInfo, CopyGroupCartEntries, Block
} from '../../data';
import { Cart } from '../../data/models/order/cart';

/**
 * 장바구니 처리 서비스
 */
@Injectable()
export class CartService {
  constructor(private httpClient: HttpClient,
    private config: Config,
    private storage: StorageService,
    private api: ApiService
  ) { }

  /**
   * 장바구니(Cart) 생성
   *
   * @param {string} accountId 회원 아이디
   * @param {string} userId 회원 아이디
   * @param {string} pickupStore AP명
   * @param {string} cartType ex) POS -> 일반주문, POSGROUP -> 그룹주문
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
    const apiURL = this.config.getApiUrl('updateVolAcc', { 'userId': userId, 'cartId': cartId });
    const httpHeaders = new HttpHeaders().set('content-type', 'application/x-www-form-urlencoded');
    const httpParams = new HttpParams().set('volumeAccount', volumeAccount);
    return this.httpClient.put<HttpResponseBase>(apiURL, httpParams, { headers: httpHeaders, observe: 'response' })
      .map(data => data as HttpResponseBase);
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
   * @returns {ResCartInfo} 카트 정보
   */
  updateItemQuantityCart(userId: string, cartId: string, entryNumber: number, code: string, qty: number): Observable<ResCartInfo> {
    const o1: OrderEntries = new OrderEntries(new Product(code), qty.toString());
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
    const apiURL = this.config.getApiUrl('deleteItemCart', { 'userId': userId, 'cartId': cartId, 'entryNumber': entryNumber });
    const httpHeaders = new HttpHeaders().set('content-type', 'application/json');
    return this.httpClient.delete<HttpResponseBase>(apiURL, { headers: httpHeaders, observe: 'response' }).flatMap((httpRes: HttpResponseBase) => {
      return this.getCartList(userId, cartId)
        .map(cart => new ResCartInfo(cart) as ResCartInfo);
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
    const apiURL = this.config.getApiUrl('deleteCart', { 'userId': userId, 'cartId': cartId });
    const httpHeaders = new HttpHeaders().set('content-type', 'application/json');

    return this.httpClient.delete<HttpResponseBase>(apiURL, { headers: httpHeaders, observe: 'response' })
      .map(data => data as HttpResponseBase);
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
    const apiURL = this.config.getApiUrl('saveCart', { 'accountId': accountId, 'userId': userId, 'cashierId': cashierId, 'macAddress': macAddress, 'cartId': cartId });
    const httpHeaders = new HttpHeaders().set('content-type', 'application/json');
    return this.httpClient.patch<SaveCartResult>(apiURL, { headers: httpHeaders, observe: 'response' })
      .map(data => data as SaveCartResult);
  }

  /**
   * 보류된 장바구니 복원
   *
   * @param {string} userId 회원 아이디
   * @param {string} cartId 카트 아이디
   * @returns {SaveCartResult} 보류에서 복원된 카트 결과
   */
  restoreSavedCart(userId: string, cartId: string): Observable<SaveCartResult> {
    const apiURL = this.config.getApiUrl('restoreCart', { 'userId': userId, 'cartId': cartId });
    const httpHeaders = new HttpHeaders().set('content-type', 'application/json');

    return this.httpClient.patch<SaveCartResult>(apiURL, { headers: httpHeaders, observe: 'response' })
      .map(data => data as SaveCartResult);
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
   * OCC를 사용하는 모든 시스템은 주문 시점(Cart 생성 시점) 마다 해당 해당 API를 호출
   *
   * 1. 기본체크 : 회원 탈퇴 및 존재여부
   *    Invalid Customer
   * 2. 프로필 업데이트 : 자동갱신, 일반 갱신 기간에 갱신 하지 않은 회원
   *    Not Renewal Customer
   * 2. 프로필 업데이트 : 일반 로그인 제한 대상자
   *    Login Blocked Customer
   * 2. 프로필 업데이트 : 로그인한 사용자가 프로필 업데이트 시도
   *    Loggin Customer can't update profile
   * 3. 주문 블락 체크 :
   *    Order Blocked Customer
   *
   * @param {string} userId 회원 아이디
   */
  checkBlock(userId: string): Observable<ResponseMessage> {
    if (this.config.isMdmsSkip()) {
      const resp = new ResponseMessage(Block.VALID);
      return Observable.of(resp);
    } else {
      const pathvariables = { userId: userId };
      const data = new HttpData('checkBlock', pathvariables, null, null, 'json');
      return this.api.put(data);
    }
  }
}
