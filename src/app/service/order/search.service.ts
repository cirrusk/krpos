import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Config } from '../pos';
import { Observable } from 'rxjs/Observable';
import { AccountList } from '../../data/models/order/account-list';
import Utils from '../../core/utils';
import { MemberType } from '../../data/models/order/member-type.enum';

@Injectable()
export class SearchService {

  constructor(private httpClient: HttpClient, private config: Config) { }

  getAccountList(searchMemberType: string, searchText: string): Observable<AccountList> {
    // API ROOT URL
    let apiURL = this.config.getConfig('apiRootUrl');

    // 회원 타입별로 URL 셋팅
    if (MemberType.ABS === searchMemberType) {
      apiURL += `amwaykorea/accounts/Uid/${searchText}?feilds=FULL`;
    } else if (MemberType.MEMBER === searchMemberType) {
      apiURL += `amwaykorea/accounts/Uid/${searchText}`;
    } else {
      apiURL += `amwaykorea/accounts/Uid/${searchText}`;
    }

    return this.httpClient.get<AccountList>(apiURL)
               .map(data => data as AccountList)
               .catch(Utils.handleError);
  }

}
