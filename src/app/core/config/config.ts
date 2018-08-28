import { Injectable, InjectionToken } from '@angular/core';
import * as format from 'string-format';
import { environment } from '../../../environments/environment';
import { Utils } from '../utils';
export const CLIENT_SECRET = new InjectionToken<string>('CLIENT_SECRET');

/**
 * environment에서 환경설정 정보를 취득함
 * build 시 해당 environment로 build되는지 체크 필요
 * package.json 함수 확인!
 */
@Injectable()
export class Config {

  /**
   * API URL 가져오기
   *
   * baseSiteId는 기본적으로 변환.
   * URL에 Root URL 이 없으면 자동으로 붙힘.
   * 2018.08.28 암웨이 내부 시스템들에서 OCC를 호출 할 때는 내부 도메인을 사용해야 함.
   *
   * @param key API URL key
   * @param params replace 할 path variable json
   */
  public getApiUrl(key: string, params?: any) {
    const apiRootUrl = environment.apiRootUrl;
    const apiRootUrlIntra = environment.apiRootUrlIntra;
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
   * 현재까지는 depth 3까지만 처리하도록 함.
   *
   * @param key  API key
   * @param defaultVal 기본값
   */
  public getConfig(key: string, defaultVal?: any) {
    let cnf: any;
    // 이 부분 잘 가져올 수 있는 방법 고민!!!
    if (key.indexOf('.') !== -1) {
      const keys = key.split('.');
      if (keys.length === 2) {
        cnf = environment[keys[0]][keys[1]];
      } else if (keys.length === 3) {
        cnf = environment[keys[0]][keys[1]][keys[2]];
      }
    } else {
      cnf = environment[key];
    }
    return (defaultVal) ? (cnf === null || cnf === '') ? defaultVal : cnf : cnf;
  }

  /**
   * MDMS Skip 처리
   */
  public isMdmsSkip(): boolean {
    return this.getConfig('isMdmsSkip', false);
  }

}
