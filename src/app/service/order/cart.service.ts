import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams, HttpResponse, HttpResponseBase } from '@angular/common/http';
import { Observable } from 'rxjs/Observable';

import { Config, NetworkService, Logger } from '../pos';
import {
  CartInfo, CartParams, CartModification,
  OrderEntries, OrderEntryList, OrderParams, Product} from '../../data/model';

@Injectable()
export class CartService {
  private orderEntries: OrderEntryList;

  constructor(private httpClient: HttpClient, private config: Config, private networkService: NetworkService, private logger: Logger) { }

  // 장바구니 생성
  createCartInfo(accountId: string, userId: string, pickupStore: string, cartType: string): Observable<CartInfo> {
    const macAddress = this.networkService.getLocalMacAddress('-');
    const cartParams = new CartParams(pickupStore, cartType, null);
    const apiURL = this.config.getApiUrl('createCart', {'accountId' : accountId, 'userId': userId})
                                       + `?fields=BASIC&mac_address=${macAddress}`;
    const httpHeaders = new HttpHeaders().set('content-type', 'application/json');

    return this.httpClient.post<CartInfo>(apiURL, JSON.stringify(cartParams), { headers : httpHeaders })
                          .map(data => data as CartInfo);
  }

  // VolumeAccount 수정
  updateVolumeAccount(userId: string, cartId: string, volumeAccount: string): Observable<HttpResponseBase> {
    const apiURL = this.config.getApiUrl('updateVolAcc', {'userId' : userId, 'cartId': cartId});
    const httpHeaders = new HttpHeaders().set('content-type', 'application/x-www-form-urlencoded');

    const httpParams = new HttpParams().set('volumeAccount', volumeAccount);

    return this.httpClient.put<HttpResponseBase>(apiURL, httpParams, { headers : httpHeaders, observe: 'response'})
                          .map(data => data as HttpResponseBase);
  }

  // 장바구니 추가
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

  // 장바구니 개별 삭제
  deleteCartEntries(userId: string, cartId: string, entryNumber: string): Observable<HttpResponseBase> {
    const apiURL = this.config.getApiUrl('deleteItemCart', {'userId' : userId, 'cartId': cartId, 'entryNumber': entryNumber});
    const httpHeaders = new HttpHeaders().set('content-type', 'application/json');

    return this.httpClient.put<HttpResponseBase>(apiURL, { headers : httpHeaders, observe: 'response'})
                          .map(data => data as HttpResponseBase);
  }
}
