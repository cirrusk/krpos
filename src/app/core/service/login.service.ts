import { TerminalInfo } from './../../data/models/terminal-info';
import { Injectable } from '@angular/core';

import { AccessToken } from './../../data/models/access-token';
import Utils from '../utils';

@Injectable()
export class LoginService {

  /**
   * Terminal 정보 가져오기
   */
  public getTerminalInfo(): TerminalInfo {
    const terminalinfo: TerminalInfo = JSON.parse(sessionStorage.getItem('terminalInfo'));
    return terminalinfo;
  }

  /**
   * Access Token 정보 가져오기
   */
  public getTokenInfo(): AccessToken {
    const tokeninfo: AccessToken = JSON.parse(sessionStorage.getItem('tokenInfo'));
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

}
