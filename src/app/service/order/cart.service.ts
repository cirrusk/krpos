import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams, HttpResponse, HttpResponseBase } from '@angular/common/http';
import { Observable } from 'rxjs/Observable';

import { NetworkService, StorageService, Config, Logger } from '../../core';
import {
  CartInfo, CartParams, CartModification,
  OrderEntries, OrderEntryList, OrderParams, Product} from '../../data';
import { CartList } from '../../data/models/order/cart-list';
import { SaveCartResult } from '../../data/models/order/save-cart-result';
import { Cart } from '../../data/models/order/cart';

@Injectable()
export class CartService {
  private orderEntries: OrderEntryList;

  constructor(private httpClient: HttpClient,
              private config: Config,
              private networkService: NetworkService,
              private storage: StorageService,
              private logger: Logger) { }

  /**
   * 장바구니 생성
   * @param accountId
   * @param userId
   * @param pickupStore
   * @param cartType
   */
  createCartInfo(accountId: string, userId: string, pickupStore: string, cartType: string): Observable<CartInfo> {
    const macAddress = this.networkService.getLocalMacAddress('-');
    const cartParams = new CartParams(pickupStore, cartType, null);
    const apiURL = this.config.getApiUrl('createCart', {'accountId' : accountId, 'userId': userId})
                                       + `?fields=BASIC&mac_address=${macAddress}`;
    const httpHeaders = new HttpHeaders().set('content-type', 'application/json');

    return this.httpClient.post<CartInfo>(apiURL, JSON.stringify(cartParams), { headers : httpHeaders })
                          .map(data => data as CartInfo);
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
    const apiURL = this.config.getApiUrl('getCartList', {'userId' : userId, 'cartId' : cartId});

    const httpHeaders = new HttpHeaders().set('content-type', 'application/json');

    return this.httpClient.get<Cart>(apiURL, { headers : httpHeaders })
                          .map(data => data as Cart);
  }

  /**
   * 제품 추가
   * @param userId
   * @param cartId
   * @param code
   */
  addCartEntries(userId: string, cartId: string, code: string): Observable<CartModification[]> {
    const o1: OrderEntries = new OrderEntries(new Product(code), '1');
    const oa: OrderEntries[] = [];
    oa.push(o1);
    const op = new OrderParams(oa);

    const apiURL = this.config.getApiUrl('addToCart', {'userId' : userId, 'cartId': cartId});
    const httpHeaders = new HttpHeaders().set('content-type', 'application/json');

    return this.httpClient.post<CartModification[]>(apiURL, JSON.stringify(op), { headers : httpHeaders })
                          .map(data => data as CartModification[]);
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
    const oa: OrderEntries[] = [];
    oa.push(o1);
    const op = new OrderParams(oa);

    const apiURL = this.config.getApiUrl('updateItemQtyCart', {'userId' : userId, 'cartId': cartId, 'entryNumber': entryNumber});
    const httpHeaders = new HttpHeaders().set('content-type', 'application/x-www-form-urlencoded');

    const httpParams = new HttpParams().set('qty', qty.toString())
                                       .set('product', JSON.stringify(op));

    return this.httpClient.put<CartModification>(apiURL, httpParams, { headers : httpHeaders })
                          .map(data => data as CartModification);
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
    const macAddress = this.networkService.getLocalMacAddress('-');

    let apiURL = this.config.getApiUrl('getCart', {'macAddress' : macAddress});
    if (userId) {
      apiURL += `?userId=${userId}`;
    }

    const httpHeaders = new HttpHeaders().set('content-type', 'application/json');

    return this.httpClient.get<CartList>(apiURL, { headers : httpHeaders })
                          .map(data => data as CartList);
  }

  /**
   * 장바구니 보류
   */
  saveCart(accountId: string, userId: string, cartId: string): Observable<SaveCartResult> {
    const cashierId = this.storage.getEmloyeeId();
    const macAddress = this.networkService.getLocalMacAddress('-');

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
