import { Injectable } from '@angular/core';
// import { HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs/Observable';

import { ApiService } from '../core';
import { AccountList, HttpData } from '../data';

/**
 * 회원 서비스
 */
@Injectable()
export class AccountService {

  constructor(private api: ApiService) { }

  /**
   * 비회원 등록
   *
   * @param registerType 등록 타입
   * @param phoneContactInfoType 전화번호 타입
   * @param phoneNumber 전화번호
   * @returns {AccountList} 등록된 회원 정보
   */
  createNewAccount(registerType: string, phoneContactInfoType: string, phoneNumber: string): Observable<AccountList> {
    const param = {registerType: registerType, phoneContactInfoType: phoneContactInfoType, phoneNumber: phoneNumber};
    const data = new HttpData('createNewAccount', null, param, null, 'json');
    return this.api.post(data);
  }
}
