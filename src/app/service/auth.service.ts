import { Injectable, Inject } from '@angular/core';
import { Observable } from 'rxjs/Observable';
import 'rxjs/add/operator/mergeMap';
import 'rxjs/add/operator/switchMap';
// import 'rxjs/add/operator/zip';
import 'rxjs/add/observable/zip';
import 'rxjs/add/observable/forkJoin';

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
   * @param {string} userid 회원 로그인 아이디
   * @param {string} userpassword 회원 로그인 비밀번호
   * @return {any} 인증 토큰 정보
   */
  public authentication(userid: string, userpassword: string): Observable<any> {
    this.terminalInfo = this.storage.getTerminalInfo();
    if (this.terminalInfo === null) {
      return Observable.throw({ error: new Error('terminal_error', 'Termianl info is null.') });
    }
    const clientid = this.terminalInfo && this.terminalInfo.id;
    const param = { clientId: clientid, userId: userid, password: userpassword, mac_address: this.storage.getMacAddress() };
    const data = new HttpData('auth', null, null, param);
    return this.api.post(data);
  }

  /**
   * Employee Identification - Access Token
   * client_secret 값 확인 필요!!!
   *
   * client_id : (string) e.g pos-client
   *     클라이언트 응용 프로그램을 식별하는 데 사용 액세스를 요청하는 클라이언트의 단말기ID
   * client_secret : (string) e.g secret
   *     <client_id>의 <secret>. 리소스에 대한 액세스를 요청하는 클라이언트 응용 프로그램을 식별하는 데 사용
   * grant_type : (string) e.g password, refresh_token, authorization_code
   *     토큰 엔드 포인트에 액세스하고자하는 것을 알림. 현재 amwaycore에 대한 암호 흐름이 구현
   * code : Authorization Code
   *     사용자 인증을 통해 받은 Authorization Code(권한코드) 는 authorization_code방식으로 Access Token을 발급받는데 사용
   *
   * @param {string} authCode authentication 에서 취득한 인증 토큰
   * @returns {AccessToken} 엑세스 토큰 정보
   */
  public accessToken(authCode: string): Observable<AccessToken> {
    if (this.terminalInfo === null) {
      return Observable.throw({ error: new Error('terminal_error', 'Termianl info is null.') });
    }
    const clientid = this.terminalInfo && this.terminalInfo.id;
    const param = { code: authCode, client_id: clientid, client_secret: this.clientsecret, grant_type: 'authorization_code' };
    const data = new HttpData('token', null, null, param);
    return this.api.post(data);
  }

  /**
   * User authentication and Access Token
   *
   * @param {string} userid 로그인 아이디
   * @param {string} userpassword 로그인 비밀번호
   * @returns {any} 엑세스 토큰 정보
   */
  public authAndToken(userid: string, userpassword: string): Observable<any> {
    return this.authentication(userid, userpassword)
      .flatMap((authinfo: any) => {
        return this.accessToken(authinfo.code);
      });
  }

}
