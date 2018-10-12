import { Injectable } from '@angular/core';
import { Observable } from 'rxjs/Observable';
import 'rxjs/add/observable/forkJoin';
import { ApiService, StorageService } from '../../core';
import { AccountList, MemberType, HttpData, BerResult, ProductList } from '../../data';
import { Products } from '../../data/models/cart/cart-data';

/**
 * 검색 서비스
 */
@Injectable()
export class SearchService {

  constructor(private api: ApiService, private storage: StorageService) { }

  /**
   * 회원 정보 조회
   *
   * @param {string} searchMemberType 멤버 타입
   * @param {string} searchText 검색어(4자리 : 전화번호, 그 외 : 사용자 아이디)
   * @returns {AccountList} 회원 정보 목록
   */
  getAccountList(searchMemberType: string, searchText: string): Observable<AccountList> {
    let memberType = '';

    let search = searchText;

    if (searchMemberType === 'A') {
      memberType = MemberType.ABO;
    } else if (searchMemberType === 'M') {
      memberType = MemberType.MEMBER;
      search = searchText.toUpperCase();
    } else {
      memberType = MemberType.CONSUMER;
    }

    const params = { amwayBusinessNature: memberType, feilds: 'FULL' };
    const pathvariables = { userId: search };
    const data = new HttpData('userSearch', pathvariables, null, params);
    return this.api.get(data);
  }

  /**
   * 기본 상품 검색(재고포함)
   *
   * @param {string} searchtype 검색유형(sku, vps : 일치 검색, 그외(상품명) : 유사검색)
   * @param {string} searchdata 검색어 (SKU ID, BARCODE, 상품명)
   * @param {string} userId 사용자아이디
   * @param {string} cartId 카트 아이디
   * @param {number} currentpage 현재페이지
   * @returns {Products} 상품 목록
   */
  getBasicProductInfoByCart(searchtype: string, searchdata: string, userId: string, cartId: string, currentpage: number): Observable<Products> {
    let params: any;
    if (searchtype === 'sku' || searchtype === 'vps') {
      params = { query: searchdata, fields: 'FULL', searchQueryContext: 'BARCODE', currentPage: currentpage + '', sort: '', pageSize: '5' };
    } else {
      params = { query: searchdata, fields: 'FULL', currentPage: currentpage + '', sort: '', pageSize: '5' };
    }
    const pathvariables = { userId: userId, cartId: cartId };
    const data = new HttpData('productSearchByCart', pathvariables, null, params);
    return this.api.get(data);
  }

  /**
   * 기본 상품 검색
   *
   * @param {string} searchdata 검색어 (SKU ID, BARCODE, 상품명)
   * @returns {Products} 상품 목록
   */
  getBasicProductInfo(searchdata: string): Observable<Products> {
    const params = { query: searchdata, fields: 'FULL', currentPage: '0', sort: '', pageSize: '1' };

    const data = new HttpData('productSearch', null, null, params);
    return this.api.get(data);
  }

  /**
   * 캐셔 및 고객용 공지사항 조회
   * API 적용 시 파라미터 재확인 필요.
   * 프로모션 공지는 요건 변경으로 제외
   * 프로모션 공지는 주문레벨 프로모션 정보를 이용하여 출력함.
   *
   * @param {string} noticeType 공지사항 타입(ca : 캐셔화면, cl : 클라이언트화면)
   * @returns {any} 공지사항 데이터
   */
  getNoticeList(noticeType: string): Observable<any> {
    const terminal = this.storage.getTerminalInfo();
    const terminalName = (terminal) ? terminal.pointOfService.name : '';
    if (noticeType === 'ca') {
      const newsParam = { noticeTypes: 'NEWS', posName: terminalName, pageSize: 20 };
      const newsData = new HttpData('noticeList', null, null, newsParam);
      return this.api.get(newsData);
    } else {
      const clientParam = { noticeTypes: 'BUSINESS', posName: terminalName, pageSize: 20 };
      const clientData = new HttpData('noticeList', null, null, clientParam);
      return this.api.get(clientData);
    }
  }

  /**
   * 사업자 등록증 조회
   *
   * @param {string}  berName 업체명
   * @param {string} aboNum ABO 회원번호
   * @param {string} accessToken 액세스 토큰
   * @returns {BerResult} 사업자등록증 목록
   */
  getBerSearch(berName: string, aboNum: string, accessToken?: string, pageSize = 5, currentPage = 1): Observable<BerResult> {
    const accesstoken = (accessToken) ? accessToken : this.storage.getTokenInfo().access_token;
    const params = { access_token: accesstoken, searchText: berName, pageSize: pageSize, currentPage: currentPage };
    const pathvariables = { aboNum: aboNum };
    const data = new HttpData('berSearch', pathvariables, null, params);
    return this.api.get(data);
  }

  /**
   * AP 즐겨찾기 제품 목록
   */
  getFavoriteProducts(pagenum: number): Observable<ProductList> {
    const pos = this.storage.getTerminalInfo();
    const pathvariables = { pickupStore: pos.pointOfService.name };
    const params = { fields: 'BASIC', currentPage: pagenum, pageSize: '9' };
    const data = new HttpData('getFavoriteProducts', pathvariables, null, params, 'json');
    return this.api.get(data);
  }
}
