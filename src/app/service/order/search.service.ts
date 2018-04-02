import { Injectable } from '@angular/core';
import { HttpClient, HttpHandler, HttpHeaders } from '@angular/common/http';
import { Config } from '../pos';
import { Observable } from 'rxjs/Observable';
import { AccountList } from '../../data/models/order/account-list';

@Injectable()
export class SearchService {

  constructor(private httpClient: HttpClient, private httpHandler: HttpHandler, private config: Config) { }

  getAccountList(searchMemberType: string, searchText: string): Observable<AccountList> {
    // API ROOT URL
    let apiURL = this.config.getConfig('apiRootUrl');

    // 회원 타입별로 URL 셋팅
    if (searchMemberType === 'A') {
      apiURL += `amwaykorea/accounts/Uid/${searchText}?feilds=FULL`;
    } else if (searchMemberType === 'M') {
      apiURL += `amwaykorea/accounts/Uid/${searchText}`;
    } else {
      apiURL += `amwaykorea/accounts/Uid/${searchText}`;
    }

    return this.httpClient.get<AccountList>(apiURL)
               .map(data => data as AccountList)
               .catch(this.handleError);
  }

  private extractData(res: Response) {
    if (res.status < 200 || res.status >= 300) {
      console.error(`get terminal info error: ${res.statusText}`);
      return {};
    } else {
      const body = res;
      console.log('... ' + JSON.stringify(body));
      return body || {};
    }
  }

  private handleError(error: Response | any) {
    console.error(`terminal info error : ${error}`);
    return Observable.throw(error.message || error);
  }
}
