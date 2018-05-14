import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs/Observable';

import { ApiService, Config } from '../../core';
import { AccountList, MemberType, HttpData } from '../../data';
import { Products } from '../../data/models/cart/cart-data';
import Utils from '../../core/utils';

@Injectable()
export class SearchService {

  constructor(private api: ApiService, private httpClient: HttpClient, private config: Config) { }

  // 회원 정보 조회
  getAccountList(searchMemberType: string, searchText: string): Observable<AccountList> {
    // API ROOT URL
    let apiURL = this.config.getConfig('apiRootUrl');

    // 회원 타입별로 URL 셋팅
    if (MemberType.ABO === searchMemberType) {
      apiURL += `/amwaykorea/accounts/Uid/${searchText}?feilds=FULL`;
    } else if (MemberType.MEMBER === searchMemberType) {
      apiURL += `/amwaykorea/accounts/Uid/${searchText}`;
    } else {
      apiURL += `/amwaykorea/accounts/Uid/${searchText}`;
    }

    return this.httpClient.get<AccountList>(apiURL)
               .map(data => data as AccountList)
               .catch(Utils.handleError);
  }

  /**
   * 기본 상품 검색
   * 프로모션 정보/ 상품명 / KPS번호 / 상품 SKU ID /재고수량 순으로 노출
   *
   * @param searchdata
   */
  getBasicProductInfo(searchdata: string, userId: string, cartId: string, currentpage: number): Observable<Products> {
    const params = {query: searchdata, fields: 'BASIC', currentPage: currentpage + '', sort: '', pageSize: '5'};
    const pathvariables = {userId : userId, cartId : cartId};
    const data = new HttpData('productSearch', pathvariables, null, params);
    return this.api.get(data);
  }

  /**
   * SKU ID로 상품 검색
   */
  getProductInfoBySkuId(skuid: string) {

  }

  /**
   * VPS CODE로 상품 검색
   */
  getProductInfoByVpsCode(vpscode: string) {

  }

  /**
   * 캐셔 및 고객용 공지사항 조회
   * API 적용 시 파라미터 재확인 필요.
   *
   * @param noticeType 공지사항 타입(ca : 캐셔, cl : 고객)
   */
  getNoticeList(noticeType: string): Observable<any> {
    const param = { noticeType: noticeType };
    const data = new HttpData('noticeList', null, null, param);
    return this.api.get(data);
  }
}
