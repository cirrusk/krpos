import { Injectable, Inject } from '@angular/core';
import { Observable } from 'rxjs/Observable';

import { NetworkService, StorageService, ApiService, CLIENT_SECRET } from '../core';
import { TerminalInfo, AccessToken, HttpData, Error } from '../data';
import Utils from '../core/utils';


@Injectable()
export class AuthService {

  terminalInfo: TerminalInfo;
  constructor(
    private api: ApiService,
    private storage: StorageService,
    private networkService: NetworkService,
    @Inject(CLIENT_SECRET) private clientsecret: string) {
      this.terminalInfo = this.storage.getTerminalInfo();
  }

  /**
   * Employee Identification - User authentication
   * 2018.04.04 add param mac address
   *
   * @param userid
   * @param userpassword
   */
  public authentication(userid: string, userpassword: string): Observable<any> {
    this.terminalInfo = this.storage.getTerminalInfo();
    if (this.terminalInfo === null) {
      return Observable.throw({error: new Error('terminal_error', 'Termianl info is null.')});
    }
    const clientid = this.terminalInfo && this.terminalInfo.id;
    const param = {clientId: clientid, userId: userid, password: userpassword, mac_address: this.networkService.getLocalMacAddress('-')};
    const data = new HttpData('auth', null, null, param);
    return this.api.post(data);
  }

  /**
   * Employee Identification - Access Token
   * client_secret 값 확인 필요!!!
   *
   * @param authCode
   */
  public accessToken(authCode: string): Observable<AccessToken> {
    if (this.terminalInfo === null) {
      return Observable.throw({error: new Error('terminal_error', 'Termianl info is null.')});
    }
    const clientid = this.terminalInfo && this.terminalInfo.id;
    const param = {code: authCode, client_id: clientid, client_secret: this.clientsecret, grant_type: 'authorization_code'};
    const data = new HttpData('token', null, null, param);
    return this.api.post(data);
  }

}
