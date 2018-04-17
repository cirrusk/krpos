import { Injectable, OnDestroy } from '@angular/core';
import { Subject } from 'rxjs/Subject';

import { AccessToken, TerminalInfo, BatchInfo } from '../../data/model';
import Utils from '../utils';

@Injectable()
export class StorageService implements OnDestroy {

  /** localStorage event 처리용 subject */
  private storageSubject = new Subject<{ key: string, value: any }>();
  public storageChanges = this.storageSubject.asObservable(); // .share();
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
    this.localStroageEventStart(); // localstorage event listen start
  }

  ngOnDestroy() {
    this.localStorageEventStop(); // localstorage event listen stop
  }

  /**
   * 세션 정보 저장하기
   *
   * @param key 세션 정보 키 문자열
   * @param value 세션 저장 정보 객체
   */
  public setSessionItem<T>(key: string, data: T): void {
    this.sstorage.setItem(key, JSON.stringify(data));
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
   * 모달 팝업을 띄울때
   * modal-main.component.ts 에서 마지막 모달 띄운 id 를 가져와서
   * 키 이벤트(HostListner) 에서 해당 모달만 이벤트 처리되도록 함.
   */
  public getLatestModalId(): any {
    const data: Array<string> = [];
    if (this.getSessionItem('latestModalId')) {
      this.getSessionItem('latestModalId').forEach(item => { data.push(item); });
    }
    if (data) {
      return data[data.length - 1];
    } else {
      return null;
    }
  }

  /**
   * 모달 팝업을 띄울때
   * this.modal.openModalByComponent 형식으로 띄워줄 경우
   * modalId: '<Component 이름>' 을 지정하여
   * 모달 닫기 키 이벤트가 동작할때 해당 모달만 이벤트 처리되도록 함.
   */
  public setLatestModalId(item: string): void {
    const data: Array<string> = [];
    if (this.getSessionItem('latestModalId')) {
      this.getSessionItem('latestModalId').forEach(modalitem => { data.push(modalitem); });
    }
    if (data) {
      data.push(item);
    } else {
      data[0] = item;
    }
    const reducedata = data.reduce(function(a, b) {if (a.indexOf(b) < 0) { a.push(b); } return a; }, []);
    this.setSessionItem('latestModalId', reducedata);
  }

  /**
   * 모달 팝업이 닫힐때
   * modal-main.component.ts 에서 해당 모달을 찾아서 닫을때
   * 닫히는 마지막 모달 아이디를 삭제해줌.
   * 마지막 아이디를 삭제해야 다음 모달팝업이 키 이벤트 처리 됨.
   * modal.service.ts 에서 removeModal 할때도 삭제해야함(? 중복).
   */
  public removeLatestModalId(): void {
    const data: Array<string> = [];
    if (this.getSessionItem('latestModalId')) {
      this.getSessionItem('latestModalId').forEach(item => {
        data.push(item);
      });
      const newdata = data.slice(0, -1);
      if (newdata) {
        this.removeSessionItem('latestModalId');
        newdata.forEach(item => {
          this.setLatestModalId(item);
        });
      }
    }
  }

  /**
   * 모달 팝업 모두 지우기
   */
  public removeAllModalIds(): void {
    this.removeSessionItem('latestModalId');
  }

  /**
   * Terminal 정보 가져오기
   */
  public getTerminalInfo(): TerminalInfo {
    const terminalinfo: TerminalInfo = this.getSessionItem('terminalInfo');
    return terminalinfo;
  }

  public setTerminalInfo(data: any): void {
    this.setSessionItem('terminalInfo', data);
  }

  public removeTerminalInfo(): void {
    this.removeSessionItem('terminalInfo');
  }

  /**
   * Access Token 정보 가져오기
   */
  public getTokenInfo(): AccessToken {
    const tokeninfo: AccessToken = this.getSessionItem('tokenInfo');
    return tokeninfo;
  }

  public setTokenInfo(data: any): void {
    this.setSessionItem('tokenInfo', data);
  }

  public removeTokenInfo(): void {
    this.removeSessionItem('tokenInfo');
  }

  /**
   * Start 시 저장한 Batch 정보 가져오기
   */
  public getBatchInfo(): BatchInfo {
    const batchinfo: BatchInfo = this.getSessionItem('batchInfo');
    return batchinfo;
  }

  public setBatchInfo(data: any): void {
    this.setSessionItem('batchInfo', data);
  }

  public getClientId(): string {
    return this.getSessionItem('clientId');
  }

  public setClientId(data: string) {
    this.setSessionItem('clientId', data);
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

  /**
   * local storage 에 저장하기
   * local storage event listener data 전달
   *
   * @param key local 정보 조회키
   * @param value 저장할 값
   */
  public setLocalItem<T>(key: string, data: T): void {
    this.lstorage.setItem(key, JSON.stringify(data));
    this.storageSubject.next({ key: key, value: data});
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
   * local storage event listener data 전달
   *
   * @param key local 정보 삭제키
   */
  public removeLocalItem(key: string): void {
    this.lstorage.removeItem(key);
    this.storageSubject.next({ key: key, value: null });
  }

  /**
   * 고객화면 담당자(캐셔) 지정
   * 듀얼모니터 event 처리
   */
  public setEmployeeName(data: string) {
    this.setLocalItem('employeeName', data);
  }

  /**
   * 고객화면 담당자(캐셔) 정보 가져오기
   */
  public getEmloyeeName(): string {
    return this.getLocalItem('employeeName');
  }

  /**
   * 고객화면 담당자 정보 삭제
   * 캐셔 변경(로그아웃) 시 고객화면 담당자 변경위해
   */
  public removeEmployeeName(): void {
    this.removeLocalItem('employeeName');
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

  /**
   * local storage event listen start
   */
  private localStroageEventStart(): void {
    window.addEventListener('storage', this.storageEventListner.bind(this));
  }

  /**
   * local storage event listen stop
   */
  private localStorageEventStop(): void {
    window.removeEventListener('storage', this.storageEventListner.bind(this));
    this.storageSubject.complete();
  }

  /**
   * local storage event listener define
   */
  private storageEventListner(event: StorageEvent) {
    if (event.storageArea === this.lstorage) {
      let v;
      try {
        v = JSON.parse(event.newValue);
      } catch (e) {
        v = event.newValue;
      }
      this.storageSubject.next({ key: event.key, value: v});
    }
  }
}
