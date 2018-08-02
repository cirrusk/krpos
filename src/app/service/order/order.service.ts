import { Injectable } from '@angular/core';
import { Observable } from 'rxjs/Observable';
import { ApiService } from '../../core';
import { HttpData, OrderHistoryList, OrderData, MemberType, ResponseMessage, AmwayExtendedOrdering, ResponseData } from '../../data';
import { OrderList } from '../../data/models/order/order';

/**
 * 주문 처리 서비스
 */
@Injectable()
export class OrderService {

  constructor(private api: ApiService) { }

  /**
   * 주문 목록 조회
   *
   * @param {string} searchText 검색어
   * @param {string} memberType 회원타입
   * @param {string} searchType 검색 타입
   * @param {string} orderTypes 주문 타입 (NORMAL_ORDER) 복수의 경우 ,(콤마) 구분
   * @param {string} channels 채널 (Web,WebMobile,pos) 복수의 경우 ,(콤마) 구분
   * @param {string} deliveryModes 배송모드 (delivery,install, pickup) 복수의 경우 ,(콤마) 구분
   * @param {boolean} confirmFlag 컨펌 플래그
   * @param {boolean} isEasyPickupOrder 픽업주문여부
   * @param {number} currentPage 현재 페이지
   * @param {number} pageSize 페이지 사이즈
   * @param {string} sort 정렬 attribute
   * @param {boolean} asc 내림차순 여부
   * @param {string} orderStatus 주문 상태
   * @returns {OrderHistoryList} 주문 목록
   */
  orderList(searchText: string, memberType: string, searchType: string, orderTypes: string, channels: string,
    deliveryModes: string, confirmFlag = false, isEasyPickupOrder = false, currentPage = 0, pageSize = 10,
    sort = 'code', asc = false, orderStatus?: string): Observable<OrderHistoryList> {
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

    const orderData = new OrderData(amwayBusinessNature, arrChannels, arrOrderTypes, arrDeliveryModes, statuses, confirm, isEasyPickupOrder, sort);

    if (searchType === 'phone') {
      orderData.phoneNumber = searchText;
    } else if (searchType === 'orderCode') {
      orderData.orderCode = searchText;
    } else {
      orderData.orderingABOId = searchText;
    }

    const param = {
      currentPage: currentPage,
      pageSize: pageSize,
      sort: sort, asc: asc, fields: 'FULL'
    };

    const data = new HttpData('orderList', null, orderData, param, 'json');
    return this.api.post(data);
  }

  /**
   * 주문 상세 조회
   *
   * @param {string} userid 회원 아이디
   * @param {Array<string>} ordercodes 주문코드 배열
   * @returns {OrderList} 주문내역
   */
  orderDetails(userid: string, ordercodes: Array<string>): Observable<OrderList> {
    const param = { codes: ordercodes, fields: 'FULL' };
    const pathvariables = { userId: userid };
    const body = { codes: ordercodes };
    const data = new HttpData('orderDetails', pathvariables, body, param, 'json');
    return this.api.get(data);
  }

  /**
   * 주문 상세 조회
   *  - 주문 여러건 동시 조회
   * @param {Array<string>} ordercodes 주문코드 배열
   * @returns {OrderList} 주문내역
   */
  orderDetailsByOrderCodes(ordercodes: Array<string>): Observable<OrderList> {
    const param = { codes: ordercodes, fields: 'FULL' };
    const body = { codes: ordercodes };
    const data = new HttpData('orderDetailsByOrderCodes', null, body, param, 'json');
    return this.api.get(data);
  }

  /**
   * 주문취소
   *
   * @param {string} accountid account 아이디
   * @param {string} userid 회원아이디
   * @param {string} ordercode 주문번호
   */
  orderCancel(accountid: string, userid: string, ordercode: string) {
    const pathvariables = { accountId: accountid, userId: userid, orderCode: ordercode };
    const data = new HttpData('orderCancel', pathvariables, null, null, 'json');
    return this.api.get(data);
  }

  /**
   * 그룹주문 조회
   * 사유 : OrderWsDTO 는 단일 주문 결과로 그룹 정보를 넣을 수 없음.
   * 처리 : POS 에서 그룹 주문인 경우 별도 호출 하여 정보 확인
   *
   * @param {string} userid 회원아이디
   * @param {string} ordercode Ordering ABO 주문번호
   * @returns {AmwayExtendedOrdering} 그룹주문 정보
   */
  groupOrder(userid: string, ordercode: string): Observable<AmwayExtendedOrdering> {
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
   * @returns {ResponseMessage} 응답정보
   */
  serialAndRfid(userid: string, ordercode: string, entries: any): Observable<ResponseMessage> {
    const pathvariables = { userId: userid, orderCode: ordercode };
    const param = { fields: 'FULL' };
    const data = new HttpData('serialAndRfid', pathvariables, entries, param, 'json');
    return this.api.post(data);
  }

  /**
   * 영수증 신청
   *
   * @param {string} userid 회원아이디
   * @param {string} ordercode 주문번호
   * @param {any} params Data Pameter
   * @returns {ResponseMessage} 응답정보
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

  /**
   * 영수증 출력 처리 완료 요청
   * 결과값 : 영수증 번호
   *
   * @param {string} userid 회원 아이디
   * @param {string} ordercode 주문번호
   * @returns {ResponseData} 응답정보
   */
  issueReceipt(userid: string, ordercode: string): Observable<ResponseData> {
    const pathvariables = { userId: userid, orderCode: ordercode };
    const param = { fields: 'DEFAULT' };
    const data = new HttpData('issueReceipt', pathvariables, null, param, 'json');
    return this.api.post(data);
  }

  /**
   * 영수증 발급 취소 요청
   *
   * @param {string} userid 회원 아이디
   * @param {string} ordercode 주문번호
   */
  cancelReceipt(userid: string, ordercode: string) {
    const pathvariables = { userId: userid, orderCode: ordercode };
    const param = { fields: 'DEFAULT' };
    const data = new HttpData('cancelReceipt', pathvariables, null, param, 'json');
    return this.api.post(data);
  }

  /**
   * 픽업 컨펌
   *  - 픽업 완료 후 주문 완료로 상태값 변경
   *  ex) 110-11111111,110-11111112
   * @param {string} orderCode 주문번호
   */
  confirmPickup(orderCodes: string): Observable<ResponseData> {
    const arrOrderCode = new Array<String>();
    orderCodes.split(',').forEach(orderCode => {
      arrOrderCode.push(orderCode.trim());
    });
    const pathvariables = { orderCode: orderCodes };
    const data = new HttpData('confirmPickup', pathvariables, arrOrderCode, null, 'json');
    return this.api.put(data);
  }
}
