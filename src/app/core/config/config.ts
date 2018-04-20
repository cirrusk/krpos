import { Injectable } from '@angular/core';
import * as format from 'string-format';

import { environment } from '../../../environments/environment';
import Utils from '../utils';

@Injectable()
export class Config {

  /**
   * API URL 가져오기
   * baseSiteId는 기본적으로 변환.
   *
   * @param key API URL key
   * @param params replace 할 path variable json
   */
  public getApiUrl(key: string, params?: any) {
    const baseSiteId = environment.baseSiteId; //  this.config['baseSiteId'];
    const cnf = environment.apiUrl; //  this.config['apiUrl'];
    if (params) {
      const jsondata = Utils.toJson(params);
      const jsonparam = Utils.fromJson(jsondata);
      jsonparam.baseSiteId = baseSiteId;
      return format(cnf[key], jsonparam);
    } else {
      const param = { baseSiteId: baseSiteId };
      return format(cnf[key], param);
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
