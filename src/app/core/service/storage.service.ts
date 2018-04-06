import { Injectable } from '@angular/core';
import { AccessToken, TerminalInfo } from '../../data/model';
import Utils from '../utils';

@Injectable()
export class StorageService {

  storage: Storage;
  constructor() {
    this.storage = sessionStorage;
    if (!this.isSupported()) {
      throw new Error('Session Storage is not supported by this browser!');
    }
  }

  /**
   * 세션 정보 저장하기
   *
   * @param key 세션 정보 키 문자열
   * @param value 세션 저장 정보 객체
   */
  public setItem<T>(key: string, value: T): void {
    this.storage.setItem(key, JSON.stringify(value));
  }

  /**
   * 세션 정보 조회하기
   *
   * @param key 세션 정보 조회 키
   */
  public getItem<T>(key: string) {
    return JSON.parse(this.storage.getItem(key));
  }

  /**
   * 특정 세션 정보 삭제하기
   *
   * @param key 세션 정보 삭제 키
   */
  public removeItem(key: string): void {
    this.storage.removeItem(key);
  }

  /**
   * 모든 세션 정보 삭제
   */
  public clear(): void {
    this.storage.clear();
  }

  /**
   * Terminal 정보 가져오기
   */
  public getTerminalInfo(): TerminalInfo {
    const terminalinfo: TerminalInfo = this.getItem('terminalInfo');
    return terminalinfo;
  }

  /**
   * Access Token 정보 가져오기
   */
  public getTokenInfo(): AccessToken {
    const tokeninfo: AccessToken = this.getItem('tokenInfo');
    return tokeninfo;
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
      return true;
    }
    return false;
  }

  private isSupported(): boolean {
    let supported = true;

    if (!this.storage) {
      supported = false;
    }

    return supported;
  }

}
