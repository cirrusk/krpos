import { Injectable, OnDestroy } from '@angular/core';
import { Subject } from 'rxjs/Subject';
import 'rxjs/add/operator/share';
import { InfoBroker } from '../../broker/info.broker';
import { AccessToken, TerminalInfo, BatchInfo, Accounts, PaymentModeListByMain, PaymentCapture, PointReCash } from '../../data';
import { Utils } from '../utils';
import { Promotion } from '../../data/models/order/promotion';

/**
 * 세션 및 로컬 스토리지 저장/삭제 서비스
 */
@Injectable()
export class StorageService implements OnDestroy {

  /** localStorage event 처리용 subject */
  private storageSubject = new Subject<{ key: string, value: any }>();
  public storageChanges = this.storageSubject.asObservable().share();
  sstorage: Storage;
  lstorage: Storage;
  constructor(private info: InfoBroker) {
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
   * @param {string} key 세션 정보 키 문자열
   * @param {T} data 세션 저장 정보 객체
   */
  public setSessionItem<T>(key: string, data: T): void {
    this.sstorage.setItem(key, Utils.stringify(data));
  }

  /**
   * 세션 정보 조회하기
   *
   * @param {string} key 세션 정보 조회 키
   */
  public getSessionItem<T>(key: string) {
    return Utils.parse(this.sstorage.getItem(key));
  }

  /**
   * 특정 세션 정보 삭제하기
   *
   * @param {string} key 세션 정보 삭제 키
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
   * 로컬 맥어드레스 저장(base64 인코딩)
   *
   * @param {string} data 맥어드레스
   */
  public setMacAddress(data: string): void {
    this.setSessionItem('macaddress', btoa(data));
  }

  /**
   * 로컬 맥어드레스 취득(base64 디코딩)
   *
   * @returns {string} 맥어드레스
   */
  public getMacAddress(): string {
    const data = this.getSessionItem('macaddress');
    return data && atob(data);
  }

  /**
   * 로컬 맥어드레스 삭제
   */
  public removeMacAddress(): void {
    this.removeSessionItem('macaddress');
  }

  /**
   * 화면 잠금 플래그 처리 지정
   * localstorage 로 처리하면 별도의 작업 없이
   * subscribe 할 수 있지만 값이 계속 남아 타 사용자가 들어왔을 경우 적용됨.
   * 따라서 sessionstorage 에 저장하고 broker에 이벤트를 날리는 방식으로 전환   *
   *
   * @param {number} data 잠금 처리 값
   */
  public setScreenLockType(data: number): void {
    this.removeSessionItem('screenLockType');
    this.setSessionItem('screenLockType', { lockType: data });
    this.info.sendInfo('lck', { lockType: data });
  }

  /**
   * 화면 잠금 플래그 여부 가져오기
   * @returns {number} 잠금 여부 값
   */
  public getScreenLockType(): number {
    const data = this.getSessionItem('screenLockType');
    return data && data.lockType;
  }

  /**
   * 화면 잠금 플래그 삭제하기
   */
  public removeScreenLock(): void {
    this.removeSessionItem('screenLockType');
    this.info.sendInfo('lck', { lockType: -1 });
  }

  /**
   * 이미 해당 모달이 떠있는지 체크
   */
  public alreadyOpenModal(modalid: string) {
    let rtn = false;
    const modals = this.getSessionItem('latestModalId');
    if (modals) {
      modals.forEach(modal => {
        if (modal === modalid) {
          rtn = true;
        }
      });
    }
    return rtn;
  }

  public getAllModalIds(): Array<string> {
    return this.getSessionItem('latestModalId');
  }

  /**
   * 모달 팝업을 띄울때
   * modal-main.component.ts 에서 마지막 모달 띄운 id 를 가져와서
   * 키 이벤트(HostListner) 에서 해당 모달만 이벤트 처리되도록 함.
   * @returns {any} 마지막 모달 아이디
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
   * @param {string} item 모달 아이디
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
    const reducedata = data.reduce(function (a, b) { if (a.indexOf(b) < 0) { a.push(b); } return a; }, []);
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
      const newdata: string[] = data.slice(0, -1);
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
   * @returns {TerminalInfo} 터미널 정보
   */
  public getTerminalInfo(): TerminalInfo {
    const terminalinfo: TerminalInfo = this.getSessionItem('terminalInfo');
    return terminalinfo;
  }

  /**
   * Terminal 정보 저장하기
   * @param {any} data 터미널 정보
   */
  public setTerminalInfo(data: any): void {
    this.setSessionItem('terminalInfo', data);
  }

  /**
   *  Terminal 정보 삭제하기
   */
  public removeTerminalInfo(): void {
    this.removeSessionItem('terminalInfo');
  }

  /**
   * 터미널 정보를 가지고 있는지 여부 체크
   * @returns {boolean} 가지고 있으면 true, 아니면 false
   */
  public hasTerminalAuth(): boolean {
    const terminalinfo: TerminalInfo = this.getTerminalInfo();
    return (terminalinfo !== null && Utils.isNotEmpty(terminalinfo.id));
  }

  /**
   * 복합결제 시 남은 금액을 조회
   * @returns {number} 남은 금액
   */
  public getPay(): number {
    return this.getSessionItem('pay') ? this.getSessionItem('pay') : 0;
  }

  /**
   * 복합결제 시 남은 금액 기록
   * @param {number} data 남은 금액
   */
  public setPay(data: number): void {
    this.setSessionItem('pay', data);
  }

  /**
   * 복합결제 시 남은 금액 세션 정보 삭제
   */
  public removePay() {
    this.removeSessionItem('pay');
  }

  /**
   * 복합결제 시 주결제 수단을 조회
   *
   * @returns {string} 주결제수단
   */
  public getPaymentModeCode(): string {
    return this.getSessionItem('paymentmode');
  }

  /**
   * 복합결제 시 주결제 수단을 기록
   *
   * @param {string} data 주결제 수단
   */
  public setPaymentModeCode(data: string): void {
    this.setSessionItem('paymentmode', data);
  }

  /**
   * 복합결제 시 주결제 수단 세션정보 삭제
   */
  public removePaymentModeCode(): void {
    this.removeSessionItem('paymentmode');
  }

  /**
   * Access Token 정보 가져오기
   * @returns {AccessToken} 액세스 토큰 정보
   */
  public getTokenInfo(): AccessToken {
    const tokeninfo: AccessToken = this.getSessionItem('tokenInfo');
    return tokeninfo;
  }

  /**
   * Access Token 정보 저장하기
   * @param {any} data 액세스 토큰 정보
   */
  public setTokenInfo(data: any): void {
    this.setSessionItem('tokenInfo', data);
  }

  /**
   * Access Token 정보 세션 삭제하기
   */
  public removeTokenInfo(): void {
    this.removeSessionItem('tokenInfo');
  }

  /**
   * Start 시 저장한 Batch 정보 가져오기
   * @returns {BatchInfo} 배치정보
   */
  public getBatchInfo(): BatchInfo {
    const batchinfo: BatchInfo = this.getSessionItem('batchInfo');
    return batchinfo;
  }

  /**
   * 배치 정보 저장
   *
   * @param {any} data 배치정보
   */
  public setBatchInfo(data: any): void {
    this.setSessionItem('batchInfo', data);
  }

  /**
   * 배치 세션 정보 삭제
   */
  public removeBatchInfo(): void {
    this.removeSessionItem('batchInfo');
  }

  /**
   * 클라이언트 아이디 조회
   * @returns {string} 클라이언트 아이디
   */
  public getClientId(): string {
    return this.getSessionItem('clientId');
  }

  /**
   * 클라이언트 아이디 세션 정보 저장하기
   * @param {string} data 클라이언트 아이디
   */
  public setClientId(data: string) {
    this.setSessionItem('clientId', data);
  }

  /**
   * 로그인 되어있는지 여부 체크
   *
   *  로그인 상태 : 로그인과정을 거쳐서 token 정보를 취득한 상태.
   *  로그인 과정
   *   1. POS 단말기 인증
   *   2. 사용자 Authentication
   *   3. 사용자 Access Token
   *
   * @returns {boolean} 로그인 여부
   */
  public isLogin(): boolean {
    const tokeninfo: AccessToken = this.getTokenInfo();
    if (tokeninfo && Utils.isNotEmpty(tokeninfo.access_token)) {
      return true;
    }
    return false;
  }

  /**
   * 로그아웃 처리
   */
  public logout(): void {
    this.removeScreenLock();
    this.removeTokenInfo();
    this.removeBatchInfo();
    this.info.sendInfo('bat', { batchNo: null });
    this.info.sendInfo('tkn', null);
  }

  /**
   * Serial 배열 세션 저장하기
   *
   * @param key 조회할 Serial값 키(제품코드)
   * @param data 저장할 Serial 배열
   */
  public setSerialCodes(key: string, data: Array<string>): void {
    this.removeSerialCodes(key);
    this.setSessionItem('SR_' + key, data);
  }

  /**
   * 저장한 Serial 배열 조회하기
   *
   * @param key 조회할 Serial값 키(제품코드)
   */
  public getSerialCodes(key: string): Array<string> {
    return this.getSessionItem('SR_' + key);
  }

  /**
   * 저장한 Serial 배열 삭제하기
   *
   * @param key 삭제할 Serial값 키(제품코드)
   */
  public removeSerialCodes(key: string): void {
    this.removeSessionItem('SR_' + key);
  }

  /**
   * 저당된 세션 중 Serial 관련 세션 삭제하기(초기화시 필요)
   */
  public cleanSerialCodes(): void {
    Object.keys(this.sstorage).forEach(key => {
      if (key.startsWith('SR_')) {
        this.removeSessionItem(key);
      }
    });
  }

  public setBer(data: string) {
    this.setSessionItem('Ber', data);
    this.setLocalBerNumber(data);
  }

  public getBer(): string {
    return this.getSessionItem('Ber');
  }

  public removeBer() {
    this.removeSessionItem('Ber');
    this.removeLocalBerNumber();
  }

  public setPaymentCapture(data: PaymentCapture) {
    this.setSessionItem('paymentcapture', data);
    this.setSessionItem('paymentprocess', true);
  }

  public getPaymentCapture(): PaymentCapture {
    return this.getSessionItem('paymentcapture');
  }

  public removePaymentCapture() {
    this.removeSessionItem('paymentcapture');
  }

  public isPaymentProcessing(): boolean {
    return this.getSessionItem('paymentprocess');
  }

  public removePaymentProcessing() {
    return this.removeSessionItem('paymentprocess');
  }

  public setPointReCash(data: PointReCash) {
    this.setSessionItem('pointrecash', data);
  }

  public getPointReCash(): PointReCash {
    return this.getSessionItem('pointrecash');
  }

  public removePointReCash() {
    this.removeSessionItem('pointrecash');
  }

  public setLocalBerNumber(data: string) {
    this.setLocalItem('Ber', data);
  }

  public getLocalBerNumber() {
    return this.getLocalItem('Ber');
  }

  public removeLocalBerNumber() {
    this.removeLocalItem('Ber');
  }

  public setPayInfoReset() {
    this.setLocalItem('payinforeset', true);
  }

  public removePayInfoReset() {
    this.removeLocalItem('payinforeset');
  }

  /**
   * local storage 에 저장하기
   * local storage event listener data 전달
   *
   * @param {string} key local 정보 조회키
   * @param {T} data 저장할 값
   */
  public setLocalItem<T>(key: string, data: T): void {
    this.lstorage.setItem(key, Utils.stringify(data));
    this.storageSubject.next({ key: key, value: data });
  }

  /**
   * local storage 조회하기
   *
   * @param {string} key local 정보 조회키
   * @returns {any} 로컬스토리지 값 조회
   */
  public getLocalItem<T>(key: string): any {
    return Utils.parse(this.lstorage.getItem(key));
  }

  /**
   * 특정 local storage 값 삭제하기
   * local storage event listener data 전달
   *
   * @param {string} key local 정보 삭제키
   */
  public removeLocalItem(key: string): void {
    this.lstorage.removeItem(key);
    this.storageSubject.next({ key: key, value: null });
  }

  /**
   * 고객화면 담당자(캐셔) 지정
   * 듀얼모니터 event 처리
   * @param {string} data 담당자명
   */
  public setEmployeeName(data: string) {
    this.setLocalItem('employeeName', data);
  }

  /**
   * 고객화면 담당자(캐셔) 정보 가져오기
   * @returns {string} 담당자명
   */
  public getEmloyeeName(): string {
    return this.getLocalItem('employeeName');
  }

  /**
   * 담당자(캐셔) Id 저장
   * @param {string} data 담당자 아이디
   */
  public setEmployeeId(data: string) {
    this.setLocalItem('employeeId', data);
  }

  /**
   * 담당자(캐셔) Id 가져오기
   * @returns {string} 담당자 아이디
   */
  public getEmloyeeId(): string {
    return this.getLocalItem('employeeId');
  }

  /**
   * 고객화면 담당자 정보 삭제
   * 캐셔 변경(로그아웃) 시 고객화면 담당자 변경위해
   */
  public removeEmployeeName(): void {
    this.removeLocalItem('employeeName');
  }

  /**
   * 회원 검색 시 회원 정보 저장
   * 회원 검색 시 클라이언트에 뿌려줌.
   *
   * @param {Accounts} data 회원정보
   */
  public setCustomer(data: Accounts): void {
    this.setLocalItem('customer', data);
  }

  /**
   * 회원 정보 조회
   * @returns {Accounts} 회원 정보
   */
  public getCustomer(): Accounts {
    return this.getLocalItem('customer');
  }

  /**
   * 회원 정보 삭제하기
   */
  public removeCustomer(): void {
    this.removeLocalItem('customer');
  }

  public setPromotion(data: string) {
    this.setLocalItem('promo', data);
  }

  public getPromotion(): string {
    return this.getLocalItem('promo');
  }

  public removePromotion() {
    this.removeLocalItem('promo');
  }

  /**
   * 상품 검색 시 장바구니에 담길 상품 정보 저장
   * 상품 검색 시 클라이언트에 뿌려줌.
   *
   * @param {any | any[]} data 상품정보
   */
  public setOrderEntry(data: any | any[]): void {
    this.setLocalItem('orderentry', data);
  }

  /**
   * 상품 정보 삭제
   */
  public removeOrderEntry(): void {
    this.removeLocalItem('orderentry');
  }

  public setPayment(data: any) {
    // this.removePayment();
    this.setLocalItem('payinfo', data);
  }

  public getPayment(): any {
    return this.getLocalItem('payinfo');
  }

  public removePayment() {
    this.removeLocalItem('payinfo');
  }

  public initLocals() {
    this.setLocalItem('clearclient', {});
    this.removeLocalItem('clearclient');
    this.removePayment();
    this.removeOrderEntry();
  }

  /**
   * cart 페이지 정보 저장
   * @param page
   */
  public setCartPage(page: number): void {
    this.setLocalItem('cartPage', page);
  }

  /**
   * Cart 페이지 정보 조회
   */
  public getCartPage(): number {
    return this.getLocalItem('cartPage');
  }

  /**
   * Cart 페이지 정보 삭제
   */
  public removeCartPage(): void {
    this.removeLocalItem('cartPage');
  }

  /**
   * 클라이언트용 로컬스토리지 정보 삭제
   */
  public clearClient(): void {
    this.removeEmployeeName();
    this.removeCustomer();
    this.removeOrderEntry();
    this.clearLocal();
  }

  /**
   * local storage 전체 삭제
   */
  public clearLocal(): void {
    this.lstorage.clear();
  }

  /**
   * @ignore
   */
  private isSessionStorageSupported(): boolean {
    let supported = true;
    if (!this.sstorage) {
      supported = false;
    }
    return supported;
  }

  /**
   * @ignore
   */
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
   * @param event 스토리지 이벤트
   */
  private storageEventListner(event: StorageEvent) {
    if (event.storageArea === this.lstorage) {
      let v;
      try {
        v = Utils.parse(event.newValue);
      } catch (e) {
        v = event.newValue;
      }
      this.storageSubject.next({ key: event.key, value: v });
    }
  }
}
