import { Injectable } from '@angular/core';
import { HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs/Observable';

import { ApiService } from '../core';
import { AccountList, HttpData } from '../data';

@Injectable()
export class AccountService {

  constructor(private api: ApiService) {

  }

  /**
   * 비회원 등록
   */
  createNewAccount(registerType: string, phoneContactInfoType: string, phoneNumber: string): Observable<AccountList> {
    const param = {registerType: registerType, phoneContactInfoType: phoneContactInfoType, phoneNumber: phoneNumber};
    const data = new HttpData('createNewAccount', null, param, null, 'json');
    return this.api.post(data);
  }
}
