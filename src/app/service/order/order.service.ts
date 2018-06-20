import { Injectable } from '@angular/core';
import { Observable } from 'rxjs/Observable';
import { ApiService } from '../../core';
import { HttpData, OrderSearchParameters, OrderHistoryList, OrderData, Order, OrderList } from '../../data';

@Injectable()
export class OrderService {

  constructor(private api: ApiService) { }

  getOrderInfo(searchType: string, searchText: string, memberType: string): Observable<OrderHistoryList> {
    const orderParameters = new OrderSearchParameters();
    orderParameters.orderingABOId = searchText;
    const param = { fields: 'FULL' };
    const data = new HttpData('orderInfo', null, orderParameters, param, 'json');
    return this.api.post(data);
  }

  getOrderDetail(orderNo: string): Observable<Order> {
    const param = { fields: 'BASIC' };
    const pathvariables = { code: orderNo };
    const data = new HttpData('orderDetail', pathvariables, null, param);
    return this.api.get(data);
  }

  /**
   * 주문 목록 조회
   *
   * @param userid 회원 아이디
   * @param orderdata 주문 Data Parameter
   * @param sort 정렬조건값
   * @param asc asc 정렬 여부
   */
  orderList(userid: string, orderdata: OrderData, sort = 'date', asc = true): Observable<OrderHistoryList> {
    const param = {
      currentPage: orderdata.currentPage ? orderdata.currentPage : 0,
      pageSize: orderdata.pageSize ? orderdata.pageSize : 10,
      sort: sort, asc: asc, fields: 'FULL'
    };
    const pathvariables = { userId: userid };
    const data = new HttpData('orderList', pathvariables, orderdata, param);
    return this.api.get(data);
  }

  /**
   * 주문 상세 조회
   *
   * @param userid 회원 아이디
   * @param ordercodes 주문코드 배열
   */
  orderDetails(userid: string, ordercodes: Array<string>): Observable<OrderList> {
    const param = { fields: 'DEFAULT' };
    const pathvariables = { userId: userid };
    const body = { codes: ordercodes };
    const data = new HttpData('orderDetails', pathvariables, body, param);
    return this.api.get(data);
  }
}
