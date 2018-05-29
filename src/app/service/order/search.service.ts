import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs/Observable';
import 'rxjs/add/observable/of';
import { ApiService, Config, StorageService } from '../../core';
import { AccountList, MemberType, HttpData, BerResult } from '../../data';
import { Products } from '../../data/models/cart/cart-data';
import { Utils } from '../../core/utils';

@Injectable()
export class SearchService {

  constructor(private api: ApiService, private storage: StorageService, private httpClient: HttpClient, private config: Config) { }

  // 회원 정보 조회
  getAccountList(searchMemberType: string, searchText: string): Observable<AccountList> {
    // API ROOT URL
    let apiURL = this.config.getConfig('apiRootUrl');

    // 회원 타입별로 URL 셋팅
    if (MemberType.ABO === searchMemberType) {
      apiURL += `/amwaykorea/accounts/Uid/${searchText}?feilds=FULL`;
    } else if (MemberType.MEMBER === searchMemberType) {
      apiURL += `/amwaykorea/accounts/Uid/${searchText}?feilds=FULL`;
    } else {
      apiURL += `/amwaykorea/customers/Uid/${searchText}?feilds=FULL`;
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
    const params = { query: searchdata, fields: 'FULL', currentPage: currentpage + '', sort: '', pageSize: '5' };
    const pathvariables = { userId: userId, cartId: cartId };
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
    const terminal = this.storage.getTerminalInfo();
    const terminalid = (terminal) ? terminal.id : '';
    const param = { noticeType: noticeType, terminalId: terminalid };
    const data = new HttpData('noticeList', null, null, param);
    return /* this.api.get(data); */ Observable.of({
      notice_ca: [
        '가나다라마바사아자차가나다라마바사아자차가나다라마바사아자차가나다라마바사아자차가나다라마바사아자차가나다라마바사아자차가나다라마바사아자차',
        '②. 3월 27일  시스템 점검 시스템 점검 시스템이 예정되어 있으니 업무에 착오 없으시길 바랍니다. 문의: 2222 - 0000',
        '③. 3월 28일  시스템 점검 시스템 점검 시스템이 예정되어 있으니 업무에 착오 없으시길 바랍니다. 문의: 3333 - 0000',
        '④. 4월 01일  시스템 점검 시스템 점검 시스템이 예정되어 있으니 업무에 착오 없으시길 바랍니다. 문의: 4444 - 0000',
        '⑤. 4월 03일  시스템 점검 시스템 점검 시스템이 예정되어 있으니 업무에 착오 없으시길 바랍니다. 문의: 5555 - 0000'
      ],
      notice_cl: [
        '①. 주차권은 고객센터에서 수령하세요!',
        '②. 쿠폰은 계산전에 확인해주시기 바랍니다.',
        '③. 영수증은 꼭 받아가주시기 바랍니다.'
      ],
      promotion: [
        { title: '', desc: '가나다라마바사아자차가나다라마바사아자차가나다라마바사아자차가나다라마바사아자차가나다라마바사아자차가나다라마바사아자차' },
        { title: '프로모션 2', desc: '② 더블엑스 상품은 2018.02.05~ 02.28 까지 1+1 증정 진행 중입니다.많은 참여 바랍니다.' },
        { title: '프로모션 3', desc: '③ 더블엑스 상품은 2018.02.05~ 02.28 까지 1+1 증정 진행 중입니다.많은 참여 바랍니다.' },
        { title: '프로모션 4', desc: '④ 더블엑스 상품은 2018.02.05~ 02.28 까지 1+1 증정 진행 중입니다.많은 참여 바랍니다.' },
        { title: '프로모션 5', desc: '⑤ 더블엑스 상품은 2018.02.05~ 02.28 까지 1+1 증정 진행 중입니다.많은 참여 바랍니다.' },
        { title: '프로모션 6', desc: '⑥ 더블엑스 상품은 2018.02.05~ 02.28 까지 1+1 증정 진행 중입니다.많은 참여 바랍니다.' },
        { title: '프로모션 7', desc: '⑦ 더블엑스 상품은 2018.02.05~ 02.28 까지 1+1 증정 진행 중입니다.많은 참여 바랍니다.' },
        { title: '프로모션 8', desc: '⑧ 더블엑스 상품은 2018.02.05~ 02.28 까지 1+1 증정 진행 중입니다.많은 참여 바랍니다.' }
      ]
    });
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
