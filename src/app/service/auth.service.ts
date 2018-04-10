import { Injectable } from '@angular/core';
import { HttpClient, HttpParams, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs/Observable';

import 'rxjs/add/operator/catch';
import 'rxjs/add/operator/map';

import { Config, Logger, StorageService, NetworkService } from './pos';
import { TerminalInfo, AccessToken } from '../data/model';
import Utils from '../core/utils';

@Injectable()
export class AuthService {

  terminalInfo: TerminalInfo;
  constructor(
    private http: HttpClient,
    private storage: StorageService,
    private networkService: NetworkService,
    private config: Config,
    private logger: Logger) {
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
    const authUrl = this.config.getApiUrl('auth');
    const clientid = this.terminalInfo && this.terminalInfo.id;
    const httpParams = new HttpParams()
    .set('clientId', clientid)
    .set('userId', userid)
    .set('password', userpassword)
    .set('mac_address', this.networkService.getLocalMacAddress('-'));
    const httpHeaders = new HttpHeaders().set('Content-Type', 'application/x-www-form-urlencoded');
    return this.http.post(authUrl, httpParams.toString(), { headers: httpHeaders, responseType: 'json' })
    .map(Utils.extractData)
    .catch(Utils.handleError);
  }

  /**
   * Employee Identification - Access Token
   * client_secret 값 확인 필요!!!
   *
   * @param authCode
   */
  public accessToken(authCode: string): Observable<AccessToken> {
    const tokenUrl = this.config.getApiUrl('token');
    const clientid = this.terminalInfo && this.terminalInfo.id;

    const httpParams = new HttpParams()
    .set('code', authCode)
    .set('client_id', clientid)
    .set('client_secret', '83d8f684-7a35-47f7-96fd-b6587d3ed736')
    .set('grant_type', 'authorization_code');

    const httpHeaders = new HttpHeaders().set('Content-Type', 'application/x-www-form-urlencoded');

    return this.http.post(tokenUrl, httpParams.toString(), { headers: httpHeaders, responseType: 'json' })
    .map(Utils.extractData)
    .catch(Utils.handleError);
  }

}
