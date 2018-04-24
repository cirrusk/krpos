import { Injectable } from '@angular/core';
import { HttpClient, HttpRequest, HttpHeaders, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs/Observable';

import 'rxjs/add/operator/catch';
import 'rxjs/add/operator/map';

import { HttpData } from '../../data/model';
import { Config } from '../config/config';
import { Logger } from '../logger/logger';
import Utils from '../utils';

@Injectable()
export class ApiService {

  constructor(private http: HttpClient, private config: Config, private logger: Logger) { }

  /**
   * API GET METHOD 처리
   *
   * @param data request data
   */
  get(data: HttpData): Observable<any> {
    return this.callApi('get', data.apikey, data.pathvariables, data.body, data.param, data.headertype);
  }

  /**
   * API POST METHOD 처리
   *
   * @param data request data
   */
  post(data: HttpData): Observable<any> {
    return this.callApi('post', data.apikey, data.pathvariables, data.body, data.param, data.headertype);
  }

  /**
   * API PUT METHOD 처리
   *
   * @param data request data
   */
  put(data: HttpData): Observable<any> {
    return this.callApi('put', data.apikey, data.pathvariables, data.body, data.param, data.headertype);
  }

  /**
   * API PATCH METHOD 처리
   *
   * @param data request data
   */
  patch(data: HttpData): Observable<any> {
    return this.callApi('patch', data.apikey, data.pathvariables, data.body, data.param, data.headertype);
  }

  /**
   * API DELETE METHOD 처리
   *
   * @param data request data
   */
  delete(data: HttpData): Observable<any> {
    return this.callApi('delete', data.apikey, data.pathvariables, data.body, data.param, data.headertype);
  }

  /**
   * API URL 가져오기
   *
   * @param data request data
   */
  private getApiUrl(apikey: string, pathvariables: any): string {
    let apiUrl;
    if (pathvariables) {
      apiUrl = this.config.getApiUrl(apikey, pathvariables);
    } else {
      apiUrl = this.config.getApiUrl(apikey);
    }
    return apiUrl;
  }

  /**
   * API 처리하기
   *
   * @param method HTTP METHOD TYPE
   * @param apikey API URL KEY
   * @param pathvariables API PATH VARIABLES
   * @param body BODY 전송 파라미터값
   * @param params HTTP PARAMETER 값
   * @param headertype HTTP HEADER TYPE
   */
  private callApi(method: string, apikey: string, pathvariables: any, body: object = null, params: any, headertype?: string): Observable<any> {
    const apiUrl = this.getApiUrl(apikey, pathvariables);
    this.logger.set('api.service', `URL : ${apiUrl}, METHOD : ${method.toUpperCase()}`).debug();
    return this.http.request(method, apiUrl,
    {
      body: body,
      headers: this.generateHeaders(headertype),
      params: this.generateParams(params),
      responseType: 'json'
    })
    .map(Utils.extractData)
    .catch(Utils.handleError);
  }

  /**
   * HTTP HEADER 설정
   *
   * @param headertype 헤더 타입 결정값
   */
  private generateHeaders(headertype: string): HttpHeaders {
    let headers: HttpHeaders;
    if (headertype === 'b' || headertype === 'json') {
      headers = new HttpHeaders().set('Content-Type', 'application/json');
    } else {
      headers = new HttpHeaders().set('Content-Type', 'application/x-www-form-urlencoded');
    }
    return headers;
  }

  /**
   * HTTP PARAMETER 설정
   *
   * @param params 설정 파라미터 json
   */
  private generateParams(params: any): HttpParams {
    this.logger.set('api.service', `httpparams : ${Utils.stringify(params)}`).debug();
    const httpparams = new HttpParams({ fromObject: params });
    return httpparams;
  }

}
