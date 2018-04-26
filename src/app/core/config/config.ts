
import { Injectable, InjectionToken } from '@angular/core';
import * as format from 'string-format';
import { environment } from '../../../environments/environment';
import Utils from '../utils';
import { LANG_KO_NAME, LANG_KO_MSGS } from './../message/msg-ko';

export const CLIENT_SECRET = new InjectionToken<string>('CLIENT_SECRET');
export const MESSAGE = new InjectionToken<string>('MESSAGE');
export const langset = {
 [LANG_KO_NAME]: LANG_KO_MSGS
};

@Injectable()
export class Config {

  /**
   * API URL 가져오기
   * baseSiteId는 기본적으로 변환.
   * URL에 Root URL 이 없으면 자동으로 붙힘.
   *
   * @param key API URL key
   * @param params replace 할 path variable json
   */
  public getApiUrl(key: string, params?: any) {
    const apiRootUrl = environment.apiRootUrl;
    const baseSiteId = environment.baseSiteId;
    const cnf = environment.apiUrl;
    let apiUrl = String(cnf[key]);
    if (!apiUrl.startsWith('http') && apiUrl.indexOf(apiRootUrl) === -1) { apiUrl = apiRootUrl + apiUrl; }
    if (params) {
      const jsondata = Utils.stringify(params);
      const jsonparam = Utils.parse(jsondata);
      jsonparam.baseSiteId = baseSiteId;
      return format(apiUrl, jsonparam);
    } else {
      const param = { baseSiteId: baseSiteId };
      return format(apiUrl, param);
    }
  }

  /**
   * Config 정보 가져오기
   *
   * @param key
   */
  public getConfig(key: string) {
    // 이 부분 잘 가져올 수 있는 방법 고민!!!
    if (key.indexOf('.') !== -1) {
      const keys = key.split('.');
      if (keys.length === 2) {
        return environment[keys[0]][keys[1]];
      } else if (keys.length === 3) {
        return environment[keys[0]][keys[1]][keys[2]];
      }
    }
    return environment[key];
  }

}
