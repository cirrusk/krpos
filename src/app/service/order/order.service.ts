import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs/Observable';
import { ApiService, Config, StorageService } from '../../core';
import { Utils } from '../../core/utils';
import { HttpData, OrderSearchParameters, OrderHistoryList } from '../../data';
import { Order } from '../../data/models/order/order';

@Injectable()
export class OrderService {

  constructor(private api: ApiService, private storage: StorageService , private httpClient: HttpClient, private config: Config) { }

  getOrderInfo(searchType: string, searchText: string, memberType: string): Observable<OrderHistoryList> {
    const orderParameters = new OrderSearchParameters();
    orderParameters.orderingABOId = searchText;
    const param = {fields: 'FULL'};
    const data = new HttpData('orderInfo', null, orderParameters, param, 'json');
    return this.api.post(data);
  }

  getOrderDetail(orderNo: string): Observable<Order> {
    const param = {fields: 'BASIC'};
    const pathvariables = {code : orderNo};
    const data = new HttpData('orderDetail', pathvariables, null, param);
    return this.api.get(data);
  }

}
