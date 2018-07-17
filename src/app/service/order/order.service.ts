import { Injectable } from '@angular/core';
import { Observable } from 'rxjs/Observable';
import { ApiService } from '../../core';
import { HttpData, OrderSearchParameters, OrderHistoryList, OrderData, MemberType, ResponseMessage } from '../../data';
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
  orderList(searchText: string, memberType: string, searchType: string, orderTypes: string, channels: string,
    deliveryModes: string, confirmFlag = false, currentPage = 0, pageSize = 10, sort = 'date', asc = true, orderStatus?: string): Observable<OrderHistoryList> {
    const arrOrderTypes = new Array<string>(); // NORMAL_ORDER
    const arrChannels = new Array<string>(); // Web,WebMobile
    const arrDeliveryModes = new Array<string>(); // delivery,install
    const statuses = new Array<string>();
    let amwayBusinessNature = '';
    const confirm = confirmFlag;

    if (memberType === 'A') {
      amwayBusinessNature = MemberType.ABO;
    } else if (memberType === 'M') {
      amwayBusinessNature = MemberType.MEMBER;
    } else {
      amwayBusinessNature = MemberType.CONSUMER;
    }

    orderTypes.split(',').forEach(orderType => {
      arrOrderTypes.push(orderType.trim());
    });

    channels.split(',').forEach(channel => {
      arrChannels.push(channel.trim());
    });

    deliveryModes.split(',').forEach(deliveryMode => {
      arrDeliveryModes.push(deliveryMode.trim());
    });

    if (orderStatus) {
      orderStatus.split(',').forEach(status => {
        statuses.push(status.trim());
      });
    }

    const orderData = new OrderData(arrOrderTypes, arrChannels, arrDeliveryModes, statuses, amwayBusinessNature, confirm, currentPage, pageSize);

    if (searchType === 'phone') {
      orderData.phoneNumber = searchText;
    } else if (searchType === 'orderCode') {
      orderData.orderCode = searchText;
    } else {
      orderData.orderingABOId = searchText;
    }

    const param = {
      currentPage: orderData.currentPage,
      pageSize: orderData.pageSize,
      sort: sort, asc: asc, fields: 'FULL'
    };

    const data = new HttpData('orderList', null, orderData, param, 'json');
    return this.api.post(data);
  }

  /**
   * 주문 상세 조회
   *
   * @param userid 회원 아이디
   * @param ordercodes 주문코드 배열
   */
  orderDetails(userid: string, ordercodes: Array<string>): Observable<OrderList> {
    const param = { codes: ordercodes, fields: 'FULL' };
    const pathvariables = { userId: userid };
    const body = { codes: ordercodes };
    const data = new HttpData('orderDetails', pathvariables, body, param, 'json');
    return this.api.get(data);
  }

  /**
   * 주문취소
   *
   * @param accountid account 아이디
   * @param userid 회원아이디
   * @param ordercode 주문번호
   */
  orderCancel(accountid: string, userid: string, ordercode: string) {
    const pathvariables = { accountId: accountid, userId: userid, orderCode: ordercode };
    const data = new HttpData('orderCancel', pathvariables, null, null, 'json');
    return this.api.get(data);
  }

  /**
   * 그룹주문 조회
   *
   * @param userid 회원아이디
   * @param ordercode Ordering ABO 주문번호
   */
  groupOrder(userid: string, ordercode: string) {
    const pathvariables = { userId: userid, orderId: ordercode };
    const param = { fields: 'FULL' };
    const data = new HttpData('getGroupOrder', pathvariables, null, param, 'json');
    return this.api.get(data);
  }

  /**
   * Serial, RFID 등록
   *
   * @param userid 회원아이디
   * @param ordercode 주문번호
   * @param entries Data Parameter
   */
  serialAndRfid(userid: string, ordercode: string, entries: any): Observable<ResponseMessage> {
    const pathvariables = { userId: userid, orderCode: ordercode};
    const param = { fields: 'FULL' };
    const data = new HttpData('serialAndRfid', pathvariables, entries, param, 'json');
    return this.api.post(data);
  }

  /**
   * 영수증 신청
   *
   * @param userid 회원아이디
   * @param ordercode 주문번호
   * @param params Data Pameter
   */
  receipt(userid: string, ordercode: string, params: any): Observable<ResponseMessage> {
    const pathvariables = { userId: userid, orderCode: ordercode };
    const body = {
      receiptType: params.receiptType, // CASH
      receiptIssuanceType: params.issuanceType, // 'INCOME_DEDUCTION',
      receiptNumberType: params.numberType, // 'CDN',
      receiptIssuanceNumber: params.issuanceNumber
    };
    const param = { fields: 'DEFAULT' };
    const data = new HttpData('receipt', pathvariables, body, param, 'json');
    return this.api.post(data);
  }
}
