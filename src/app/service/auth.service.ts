import { Injectable, Inject } from '@angular/core';
import { Observable } from 'rxjs/Observable';
import 'rxjs/add/operator/mergeMap';
import 'rxjs/add/operator/switchMap';

import { StorageService, ApiService, CLIENT_SECRET } from '../core';
import { TerminalInfo, AccessToken, HttpData, Error } from '../data';

/**
 * 인증 서비스
 * client secret 값은 app.module 의 provider에서 제공함.
 * 해당 값이 바뀔 경우 반드시 변경해주어야함.
 */
@Injectable()
export class AuthService {

  private terminalInfo: TerminalInfo;
  constructor(
    private api: ApiService,
    private storage: StorageService,
    @Inject(CLIENT_SECRET) private clientsecret: string) {
      this.terminalInfo = this.storage.getTerminalInfo();
  }

  /**
   * Employee Identification - User authentication
   * 2018.04.04 add param mac address
   *
   * @param userid 회원 로그인 아이디
   * @param userpassword 회원 로그인 비밀번호
   * @return {any} 인증 토큰 정보
   */
  public authentication(userid: string, userpassword: string): Observable<any> {
    this.terminalInfo = this.storage.getTerminalInfo();
    if (this.terminalInfo === null) {
      return Observable.throw({error: new Error('terminal_error', 'Termianl info is null.')});
    }
    const clientid = this.terminalInfo && this.terminalInfo.id;
    const param = {clientId: clientid, userId: userid, password: userpassword, mac_address: this.storage.getMacAddress()};
    const data = new HttpData('auth', null, null, param);
    return this.api.post(data);
  }

  /**
   * Employee Identification - Access Token
   * client_secret 값 확인 필요!!!
   *
   * @param authCode authentication 에서 취득한 인증 토큰
   * @returns {AccessToken} 엑세스 토큰 정보
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

  /**
   * User authentication and Access Token
   *
   * @param userid 로그인 아이디
   * @param userpassword 로그인 비밀번호
   * @returns {any} 엑세스 토큰 정보
   */
  public authAndToken(userid: string, userpassword: string): Observable<any> {
    return this.authentication(userid, userpassword)
    .flatMap((authinfo: any) => {
      return this.accessToken(authinfo.code);
    });
  }

}
