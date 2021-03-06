import { Injectable } from '@angular/core';
import { Observable } from 'rxjs/Observable';

import { ApiService, Config, AlertService, StorageService } from '../core';
import { AccountList, Accounts, Block, HttpData, MemberType, ResponseMessage, Errors } from '../data';
import { MessageService } from '../message';
import { InfoBroker } from '../broker';

/**
 * 회원 서비스
 */
@Injectable()
export class AccountService {

  constructor(private api: ApiService, private alert: AlertService,
    private info: InfoBroker, private storage: StorageService, private message: MessageService, private config: Config) { }

  /**
   * 비회원 등록
   *
   * @param {string} registerType 등록 타입
   * @param {string} phoneContactInfoType 전화번호 타입
   * @param {string} phoneNumber 전화번호
   * @param {string} sponsorNo 후원자 번호
   * @returns {AccountList} 등록된 회원 정보
   */
  createNewAccount(registerType: string, phoneContactInfoType: string, phoneNumber: string, sponsorNo?: string): Observable<AccountList> {
    const param = {
      registerType: registerType,
      phoneContactInfoType: phoneContactInfoType,
      phoneNumber: phoneNumber,
      sponsorNo: sponsorNo
    };
    const data = new HttpData('createNewAccount', null, param, null, 'json');
    return this.api.post(data);
  }

  /**
   * OCC를 사용하는 모든 시스템은 주문 시점(Cart 생성 시점) 마다 해당 해당 API를 호출
   *
   * 1. 기본체크 : 회원 탈퇴 및 존재여부
   *    Invalid Customer
   * 2. 프로필 업데이트 : 자동갱신, 일반 갱신 기간에 갱신 하지 않은 회원
   *    Not Renewal Customer
   * 2. 프로필 업데이트 : 일반 로그인 제한 대상자
   *    Login Blocked Customer
   * 2. 프로필 업데이트 : 로그인한 사용자가 프로필 업데이트 시도
   *    Loggin Customer can't update profile
   * 3. 주문 블락 체크 :
   *    Order Blocked Customer
   *
   * 중요) 소비자인 경우 Block 체크를 하지 않음.
   * Block 체크 시 MDMS 프로파일로 Hybris 업데이트 함.
   * 소비자인 경우 Hybris에만 존재하므로 Block 체크 수행할 필요없음.
   *
   * @param {Accounts} account 회원 정보
   */
  checkBlock(account: Accounts): Observable<ResponseMessage> {
    let skip = false;
    if (this.config.isMdmsSkip()) {
      skip = true;
    }
    if (account.accountTypeCode === MemberType.CONSUMER) {
      skip = true;
    }
    if (skip) {
      const resp = new ResponseMessage(Block.VALID);
      return Observable.of(resp);
    } else {
      const userId = (account.accountTypeCode === MemberType.ABO) ? account.uid : account.parties[0].uid;
      const pathvariables = { userId: userId };
      const data = new HttpData('checkBlock', pathvariables, null, null, 'json');
      return this.api.put(data);
    }
  }

  /**
   * 에러가 잡혔을 경우 에러 내용 출력
   * 
   * @param errdata 에러 객체
   * @param msgkey 에러 메시지 출력 메시지 키(지정한 에러가 아닐 경우 메시지 출력용)
   */
  checkError(errdata: Errors, msgkey?: string): string {
    if (errdata.type === 'InvalidTokenError') {
      this.storage.removeTokenInfo();
      this.storage.removeBatchInfo();
      this.info.sendInfo('tkn', null);
      this.alert.error({ message: this.message.get('token.error', errdata.message), timer: true, interval: 2500 });
    } else if (errdata.type === 'InvalidDmsError') {
      this.alert.error({ message: this.message.get('dms.error', errdata.message), timer: true, interval: 2500 });
    } else {
      if (msgkey) {
        this.alert.error({ message: this.message.get(msgkey, errdata.message), timer: true, interval: 1800 });
      }
    }
    return errdata.type;
  }

}
