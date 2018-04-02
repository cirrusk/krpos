import { Injectable } from '@angular/core';
import { HttpClient, HttpParams, HttpHeaders } from '@angular/common/http';

import { Observable } from 'rxjs/Observable';

import 'rxjs/add/operator/catch';
import 'rxjs/add/operator/map';

import { TerminalInfo } from './../data/models/terminal-info';

import Utils from '../core/utils';
import { Config, Logger } from './pos';

@Injectable()
export class TerminalService {

  constructor(private http: HttpClient, private config: Config, private logger: Logger) { }

  /**
   * POS 단말기 인증
   *
   * @param macaddress
   */
  public getTerminalInfo(macaddress: string): Observable<TerminalInfo> {
    macaddress = Utils.convertMacAddress(macaddress);
    const terminalApiUrl = this.config.getConfig('terminalApiUrl');
    const httpParams = new HttpParams().set('macAddress', macaddress);
    const httpHeaders = new HttpHeaders().set('Content-Type', 'application/x-www-form-urlencoded');
    return this.http.post(terminalApiUrl, httpParams.toString(), { headers: httpHeaders, responseType: 'json' })
    .map(Utils.extractData)
    .catch(Utils.handleError);
  }

}
