import { Injectable } from '@angular/core';
import { Observable } from 'rxjs/Observable';
import 'rxjs/add/observable/forkJoin';
import { ApiService, Config, StorageService } from '../../core';
import { AccountList, MemberType, HttpData, BerResult } from '../../data';
import { Products } from '../../data/models/cart/cart-data';
import { Utils } from '../../core/utils';


@Injectable()
export class SearchService {

  constructor(private api: ApiService, private storage: StorageService, private config: Config) { }

  /**
   * 회원 정보 조회
   *
   * @param searchMemberType 멤버 타입
   * @param searchText 검색어(4자리 : 전화번호, 그 외 : 사용자 아이디)
   */
  getAccountList(searchMemberType: string, searchText: string): Observable<AccountList> {
    // 회원 타입별로 URL 셋팅
    let apiUrl;
    if (MemberType.ABO === searchMemberType) {
      apiUrl = 'userSearch';
    } else if (MemberType.MEMBER === searchMemberType) {
      apiUrl = 'userSearch';
    } else {
      apiUrl = 'customerSearch';
    }
    const params = { feilds: 'FULL' };
    const pathvariables = { userId: searchText };
    const data = new HttpData(apiUrl, pathvariables, null, params);
    return this.api.get(data);
  }

  /**
   * 기본 상품 검색
   *
   * @param searchdata 검색어 (SKU ID, BARCODE)
   * @param userId 사용자아이디
   * @param cartId 카트 아이디
   * @param currentpage 현재페이지
   */
  getBasicProductInfo(searchdata: string, userId: string, cartId: string, currentpage: number): Observable<Products> {
    const params = { query: searchdata, fields: 'FULL', searchQueryContext: 'BARCODE', currentPage: currentpage + '', sort: '', pageSize: '5' };
    const pathvariables = { userId: userId, cartId: cartId };
    const data = new HttpData('productSearch', pathvariables, null, params);
    return this.api.get(data);
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
   * @param noticeType 공지사항 타입(ca : 캐셔화면, cl : 클라이언트화면)
   *
   */
  getNoticeList(noticeType: string): Observable<any> {
    const terminal = this.storage.getTerminalInfo();
    const terminalName = (terminal) ? terminal.pointOfService.name : '';

    let newsData;
    let promotionData;
    let clientData;

    if (noticeType === 'ca') {
      const newsParam = { noticeTypes: 'NEWS', pageSize: 20 };
      const promotionParam = { noticeTypes: 'PROMOTION', pageSize: 10 };
      // const newsParam      = { noticeTypes: 'PROMOTION', posNames: terminalName, pageSize: 20};
      // const promotionParam = { noticeTypes: 'PROMOTION', posNames: terminalName, pageSize: 10};
      newsData = new HttpData('noticeList', null, null, newsParam);
      promotionData = new HttpData('noticeList', null, null, promotionParam);

      return Observable.forkJoin(this.api.get(newsData), this.api.get(promotionData));
    } else {
      const clientParam = { noticeTypes: 'NEWS', pageSize: 20 };
      // const clientParam = { noticeTypes: 'NEWS', posNames: terminalName, pageSize: 20};
      clientData = new HttpData('noticeList', null, null, clientParam);

      return this.api.get(clientData);
    }
  }

  /**
   * 사업자 등록증 조회
   *
   * @param berName 업체명
   * @param aboNum ABO 회원번호
   * @param accessToken 액세스 토큰
   */
  getBerSearch(berName: string, aboNum: string, accessToken?: string, pageSize = 5, currentPage = 1): Observable<BerResult> {
    const accesstoken = (accessToken) ? accessToken : this.storage.getTokenInfo().access_token;
    const params = { access_token: accesstoken, searchText: berName, pageSize: pageSize, currentPage: currentPage };
    const pathvariables = { aboNum: aboNum };
    const data = new HttpData('berSearch', pathvariables, null, params);
    return this.api.get(data);
  }
}
