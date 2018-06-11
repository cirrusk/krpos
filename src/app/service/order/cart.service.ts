import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams, HttpResponseBase } from '@angular/common/http';
import { Observable } from 'rxjs/Observable';

import { StorageService, Config, ApiService } from '../../core';
import {
  CartInfo, CartParams, CartModification,
  OrderEntries, OrderEntryList, OrderParams, Product, Accounts, OrderEntry, ProductInfo, SaveCartResult, CartList, CopyCartEntries, HttpData} from '../../data';
import { Cart } from '../../data/models/order/cart';
// import { Utils } from '../../core/utils';

@Injectable()
export class CartService {
  constructor(private httpClient: HttpClient,
              private config: Config,
              // private networkService: NetworkService,
              private storage: StorageService,
              private api: ApiService
              // private logger: Logger
            ) { }

  /**
   * 장바구니 생성
   * @param accountId
   * @param userId
   * @param pickupStore
   * @param cartType
   */
  createCartInfo(accountId: string, userId: string, pickupStore: string, cartType: string): Observable<CartInfo> {
    const macAddress = this.storage.getMacAddress(); // this.networkService.getLocalMacAddress('-');
    const cartParams = new CartParams(pickupStore, cartType, null);
    const param = {fields: 'BASIC', mac_address: macAddress};
    const pathvariables = {accountId : accountId, userId: userId};
    const data = new HttpData('createCart', pathvariables, cartParams, param, 'json');
    return this.api.post(data);
  }

  /**
   * VolumeAccount 수정
   * @param userId
   * @param cartId
   * @param volumeAccount
   */
  updateVolumeAccount(userId: string, cartId: string, volumeAccount: string): Observable<HttpResponseBase> {
    const apiURL = this.config.getApiUrl('updateVolAcc', {'userId' : userId, 'cartId': cartId});
    const httpHeaders = new HttpHeaders().set('content-type', 'application/x-www-form-urlencoded');

    const httpParams = new HttpParams().set('volumeAccount', volumeAccount);

    return this.httpClient.put<HttpResponseBase>(apiURL, httpParams, { headers : httpHeaders, observe: 'response'})
                          .map(data => data as HttpResponseBase);
  }

  /**
   * 카트 조회
   * @param userId
   * @param cartId
   */
  getCartList(userId: string, cartId: string): Observable<Cart> {
    const pathvariables = {userId : userId, cartId: cartId};
    const data = new HttpData('getCartList', pathvariables, null, null, 'json');
    return this.api.get(data);
  }

  /**
   * 제품 추가
   * @param userId
   * @param cartId
   * @param code
   */
  addCartEntry(userId: string, cartId: string, code: string): Observable<CartModification[]> {
    const orderList = new OrderEntryList();
    const orderEntries: OrderEntry[] = [];
    const entry = new OrderEntry(new ProductInfo(code));
    entry.quantity = 1;
    orderEntries.push(entry);
    orderList.orderEntries = orderEntries;

    const pathvariables = {userId : userId, cartId: cartId};
    const data = new HttpData('addToCart', pathvariables, orderList, null, 'json');
    return this.api.post(data);
  }

  addCartEntries(userId: string, cartId: string, orderEntries: Array<OrderEntry>): Observable<CartModification[]> {
    const orderList = new OrderEntryList();
    orderList.orderEntries = orderEntries;

    const pathvariables = {userId : userId, cartId: cartId};
    const data = new HttpData('addToCart', pathvariables, orderList, null, 'json');
    return this.api.post(data);
  }

  /**
   * 장바구니 복제
   * @param changeCartInfo
   * @param orderEntries
   */
  copyCartEntries(changeUserInfo: Accounts,
                  orderEntries: Array<OrderEntry>): Observable<CopyCartEntries> {
    const terminalInfo = this.storage.getTerminalInfo();
    let accountId = '';

    if (changeUserInfo.accountType === 'CLIENT' || changeUserInfo.accountType === 'EMPLOYEE') {
      accountId = changeUserInfo.parties[0].uid;
    } else {
      accountId = changeUserInfo.uid;
    }
    return this.createCartInfo(changeUserInfo.uid, accountId, terminalInfo.pointOfService.name , 'POS')
               .flatMap((cartInfo: CartInfo) => {
                 return this.addCartEntries(cartInfo.user.uid, cartInfo.code, orderEntries)
                            .map(addEntries => new CopyCartEntries(cartInfo, addEntries) as CopyCartEntries);
               });
  }

  /**
   * 제품 수량 수정
   * @param userId
   * @param cartId
   * @param entryNumber
   * @param code
   * @param qty
   */
  updateItemQuantityCart (userId: string, cartId: string, entryNumber: number, code: string, qty: number): Observable<CartModification> {
    const o1: OrderEntries = new OrderEntries(new Product(code), qty.toString());
    const pathvariables = {userId : userId, cartId: cartId, entryNumber: entryNumber};
    const data = new HttpData('updateItemQtyCart', pathvariables, o1, null, 'json');
    return this.api.put(data);
  }

  /**
   * 장바구니 개별 삭제
   * @param userId
   * @param cartId
   * @param entryNumber
   */
  deleteCartEntries(userId: string, cartId: string, entryNumber: number): Observable<HttpResponseBase> {
    const apiURL = this.config.getApiUrl('deleteItemCart', {'userId' : userId, 'cartId': cartId, 'entryNumber': entryNumber});
    const httpHeaders = new HttpHeaders().set('content-type', 'application/json');

    return this.httpClient.delete<HttpResponseBase>(apiURL, { headers : httpHeaders, observe: 'response'})
                          .map(data => data as HttpResponseBase);
  }

  /**
   * 장바구니 삭제
   * @param userId
   * @param cartId
   */
  deleteCart(userId: string, cartId: string): Observable<HttpResponseBase> {
    const apiURL = this.config.getApiUrl('deleteCart', {'userId' : userId, 'cartId': cartId});
    const httpHeaders = new HttpHeaders().set('content-type', 'application/json');

    return this.httpClient.delete<HttpResponseBase>(apiURL, { headers : httpHeaders, observe: 'response'})
                          .map(data => data as HttpResponseBase);
  }

  /**
   * 보류된 장바구니 리스트 가져오기
   * @param userId
   */
  getCarts(userId?: string): Observable<CartList> {
    const macAddress = this.storage.getMacAddress();

    let param = {};
    if (userId) {
      param = {userId: userId, fields: 'FULL'};
    } else {
      param = {fields: 'FULL'};
    }
    const pathvariables = {macAddress : macAddress};
    const data = new HttpData('getCart', pathvariables, null, param, 'json');
    return this.api.get(data);
  }

  /**
   * 장바구니 보류
   */
  saveCart(accountId: string, userId: string, cartId: string): Observable<SaveCartResult> {
    const tokenInfo = this.storage.getTokenInfo();
    const cashierId = tokenInfo.employeeId;
    const macAddress = this.storage.getMacAddress();

    const apiURL = this.config.getApiUrl('saveCart', {'accountId' : accountId, 'userId': userId, 'cashierId': cashierId, 'macAddress': macAddress, 'cartId': cartId});
    const httpHeaders = new HttpHeaders().set('content-type', 'application/json');

    return this.httpClient.patch<SaveCartResult>(apiURL, { headers : httpHeaders, observe: 'response' })
                          .map(data => data as SaveCartResult);
  }

  /**
   * 보류된 장바구니 복원
   */
  restoreSavedCart(userId: string, cartId: string): Observable<SaveCartResult> {
    const apiURL = this.config.getApiUrl('restoreCart', {'userId' : userId, 'cartId': cartId});
    const httpHeaders = new HttpHeaders().set('content-type', 'application/json');

    return this.httpClient.patch<SaveCartResult>(apiURL, { headers : httpHeaders, observe: 'response' })
                          .map(data => data as SaveCartResult);
  }
}
