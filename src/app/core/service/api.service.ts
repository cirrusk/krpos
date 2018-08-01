import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs/Observable';

import 'rxjs/add/operator/map';
import 'rxjs/add/operator/catch';
import 'rxjs/add/operator/shareReplay';

import { Logger } from '../logger/logger';
import { Config } from '../config/config';
import { HttpData } from '../../data';
import { Utils } from '../utils';

/**
 * API 호출 서비스
 */
@Injectable()
export class ApiService {

  constructor(private http: HttpClient, private config: Config, private logger: Logger) { }

  /**
   * API GET METHOD 처리
   *
   * Avoid Duplicate HTTP Requests
   * @link https://blog.angular-university.io/angular-http/
   * @link https://chrome.google.com/webstore/detail/allow-control-allow-origi/nlfbmbojpeacfghkpbjhddihlkkiljbi?hl=en
   *
   * @param {HttpData} data request data
   * @returns {any} 응답 데이터
   */
  get(data: HttpData): Observable<any> {
    return this.callApi('GET', data.apikey, data.pathvariables, data.body, data.param, data.headertype).shareReplay();
  }

  /**
   * API POST METHOD 처리
   *
   * @param {HttpData} data request data
   * @returns {any} 응답 데이터
   */
  post(data: HttpData): Observable<any> {
    return this.callApi('POST', data.apikey, data.pathvariables, data.body, data.param, data.headertype);
  }

  /**
   * API PUT METHOD 처리
   *
   * @param {HttpData} data request data
   * @returns {any} 응답 데이터
   */
  put(data: HttpData): Observable<any> {
    return this.callApi('PUT', data.apikey, data.pathvariables, data.body, data.param, data.headertype);
  }

  /**
   * API PATCH METHOD 처리
   *
   * @param {HttpData} data request data
   * @returns {any} 응답 데이터
   */
  patch(data: HttpData): Observable<any> {
    return this.callApi('PATCH', data.apikey, data.pathvariables, data.body, data.param, data.headertype);
  }

  /**
   * API DELETE METHOD 처리
   *
   * @param {HttpData} data request data
   * @returns {any} 응답 데이터
   */
  delete(data: HttpData): Observable<any> {
    return this.callApi('DELETE', data.apikey, data.pathvariables, data.body, data.param, data.headertype);
  }

  /**
   * API URL 가져오기
   *
   * @param {string} apikey API 키값
   * @param {any} pathvariables URL Pathvariables 취환값
   * @return {string} API URL 문자열
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
   * @param {string} method HTTP METHOD TYPE
   * @param {string} apikey API URL KEY
   * @param {any} pathvariables API PATH VARIABLES
   * @param {object} body BODY 전송 파라미터값
   * @param {any} params HTTP PARAMETER 값
   * @param {string} headertype HTTP HEADER TYPE
   * @returns {any} 응답 데이터
   */
  private callApi(method: string, apikey: string, pathvariables: any, body: object = null, params: any, headertype?: string): Observable<any> {
    const apiUrl = this.getApiUrl(apikey, pathvariables);
    this.logger.set('api.service', `[${method.toUpperCase()}] URL : ${apiUrl}`).debug();
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
   * @param {string} headertype 헤더 타입 결정값
   * @returns {HttpHeaders} 설정된 헤더
   */
  private generateHeaders(headertype: string): HttpHeaders {
    let headers: HttpHeaders;
    if (headertype === 'json') {
      headers = new HttpHeaders().set('Content-Type', 'application/json');
    } else if (headertype === 'text') {
      headers = new HttpHeaders().set('Content-Type', 'text/plain');
    } else {
      headers = new HttpHeaders().set('Content-Type', 'application/x-www-form-urlencoded');
    }
    return headers;
  }

  /**
   * HTTP PARAMETER 설정
   *
   * @param {any} params 설정 파라미터 json
   * @returns {HttpParams} 설정된 파라미터
   */
  private generateParams(params: any): HttpParams {
    this.logger.set('api.service', `Http Params : ${Utils.stringify(params)}`).debug();
    const httpparams = new HttpParams({ fromObject: params });
    return httpparams;
  }

}
