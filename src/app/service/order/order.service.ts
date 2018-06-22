import { Injectable } from '@angular/core';
import { Observable } from 'rxjs/Observable';
import { ApiService } from '../../core';
import { HttpData, OrderSearchParameters, OrderHistoryList, OrderData } from '../../data';
import { Order, OrderList } from '../../data/models/order/order';

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
   * @param orderType 주문 타입 (NORMAL_ORDER) 복수의 경우 ,(콤마) 구분
   * @param channels 채널 (Web,WebMobile,pos) 복수의 경우 ,(콤마) 구분
   * @param deliveryModes 배송모드 (delivery,install, pickup) 복수의 경우 ,(콤마) 구분
   * @param sort 정렬조건값
   * @param asc asc 정렬 여부
   */
  orderList(userid: string, orderTypes: string, channels: string, deliveryModes: string, currentPage = 0, pageSize = 10, sort = 'date', asc = true): Observable<OrderHistoryList> {
    const arrOrderTypes = new Array<string>(); // NORMAL_ORDER
    const arrChannels = new Array<string>(); // Web,WebMobile
    const arrDeliveryModes = new Array<string>(); // delivery,install

    orderTypes.split(',').forEach( orderType => {
      arrOrderTypes.push(orderType.trim());
    });

    channels.split(',').forEach( channel => {
      arrChannels.push(channel.trim());
    });

    deliveryModes.split(',').forEach( deliveryMode => {
      arrDeliveryModes.push(deliveryMode.trim());
    });

    const orderData = new OrderData(arrOrderTypes, arrChannels, arrDeliveryModes, currentPage, pageSize);

    const param = {
      currentPage: orderData.currentPage,
      pageSize: orderData.pageSize,
      sort: sort, asc: asc, fields: 'FULL'
    };

    const pathvariables = { userId: userid };
    const data = new HttpData('orderList', pathvariables, orderData, param);
    return this.api.get(data);
  }

  /**
   * 주문 상세 조회
   *
   * @param userid 회원 아이디
   * @param ordercodes 주문코드 배열
   */
  orderDetails(userid: string, ordercodes: Array<string>): Observable<OrderList> {
    const param = { codes: ordercodes, fields: 'DEFAULT' };
    const pathvariables = { userId: userid };
    const body = { codes: ordercodes };
    const data = new HttpData('orderDetails', pathvariables, body, param);
    return this.api.get(data);
  }
}
