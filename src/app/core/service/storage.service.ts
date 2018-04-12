import { Injectable } from '@angular/core';

import { AccessToken, TerminalInfo, BatchInfo } from '../../data/model';
import Utils from '../utils';

@Injectable()
export class StorageService {

  sstorage: Storage;
  lstorage: Storage;
  constructor() {
    this.sstorage = sessionStorage;
    this.lstorage = localStorage;
    if (!this.isSessionStorageSupported()) {
      throw new Error('Session Storage is not supported by this browser!');
    }
    if (!this.isLocalStorageSupported()) {
      throw new Error('Local Storage is not supported by this browser!');
    }
  }

  /**
   * 세션 정보 저장하기
   *
   * @param key 세션 정보 키 문자열
   * @param value 세션 저장 정보 객체
   */
  public setSessionItem<T>(key: string, value: T): void {
    this.sstorage.setItem(key, JSON.stringify(value));
  }

  /**
   * 세션 정보 조회하기
   *
   * @param key 세션 정보 조회 키
   */
  public getSessionItem<T>(key: string) {
    return JSON.parse(this.sstorage.getItem(key));
  }

  /**
   * 특정 세션 정보 삭제하기
   *
   * @param key 세션 정보 삭제 키
   */
  public removeSessionItem(key: string): void {
    this.sstorage.removeItem(key);
  }

  /**
   * 모든 세션 정보 삭제
   */
  public clearSession(): void {
    this.sstorage.clear();
  }

  /**
   * Terminal 정보 가져오기
   */
  public getTerminalInfo(): TerminalInfo {
    const terminalinfo: TerminalInfo = this.getSessionItem('terminalInfo');
    return terminalinfo;
  }

  /**
   * Access Token 정보 가져오기
   */
  public getTokenInfo(): AccessToken {
    const tokeninfo: AccessToken = this.getSessionItem('tokenInfo');
    return tokeninfo;
  }

  /**
   * Start 시 저장한 Batch 정보 가져오기
   */
  public getBatchInfo(): BatchInfo {
    const batchinfo: BatchInfo = this.getSessionItem('batchInfo');
    return batchinfo;
  }

  /**
   * 로그인 되어있는지 여부 체크
   * 로그인 상태 : 로그인과정을 거쳐서 token 정보를 취득한 상태.
   * 로그인 과정
   * 1. POS 단말기 인증
   * 2. 사용자 Authentication
   * 3. 사용자 Access Token
   */
  public isLogin(): boolean {
    const tokeninfo: AccessToken = this.getTokenInfo();
    if (tokeninfo && Utils.isNotEmpty(tokeninfo.access_token)) {

      const e = tokeninfo.expires_in;
      const edt = new Date(e * 1000);
      const cdt = new Date();
      console.log(edt + '/' + cdt);
      console.log('expired? ' + (edt < cdt));
      return true;
    }
    return false;
  }

  /**
   * local storage 에 저장하기
   *
   * @param key local 정보 조회키
   * @param value 저장할 값
   */
  public setLocalItem<T>(key: string, value: T): void {
    this.lstorage.setItem(key, JSON.stringify(value));
  }

  /**
   * local storage 조회하기
   *
   * @param key local 정보 조회키
   */
  public getLocalItem<T>(key: string) {
    return JSON.parse(this.lstorage.getItem(key));
  }

  /**
   * 특정 local storage 값 삭제하기
   *
   * @param key local 정보 삭제키
   */
  public removeLocalItem(key: string): void {
    this.lstorage.removeItem(key);
  }

  /**
   * local storage 전체 삭제
   */
  public clearLocal(): void {
    this.lstorage.clear();
  }

  private isSessionStorageSupported(): boolean {
    let supported = true;
    if (!this.sstorage) {
      supported = false;
    }
    return supported;
  }

  private isLocalStorageSupported(): boolean {
    let supported = true;
    if (!this.lstorage) {
      supported = false;
    }
    return supported;
  }

}
