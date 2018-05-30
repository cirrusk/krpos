import { Observable } from 'rxjs/Observable';
import 'rxjs/add/observable/throw';
import { TextEncoder, TextDecoder } from 'text-encoding';
import { ErrorInfo } from '../data/error/error-info';
import { Errors } from '../data/error/errors';

export class StringBuilder {
  private buffer: any [] = [];
  constructor(val?: any) { if (val) { this.buffer.push(val); } }
  append(val: any): StringBuilder {
    this.buffer.push(val);
    return this;
  }

  appendNewLine(): StringBuilder {
    this.buffer.push('\r\n');
    return this;
  }

  clear(): StringBuilder {
    this.buffer = [];
    return this;
  }

  toString(): string {
    return this.buffer.join('');
  }

}

export /* default */ class Utils {

  /** 텍스트 인코더 정의 */
  private static encoder = new TextEncoder('utf-8');

  /** 텍스트 디코더 정의 */
  private static decoder = new TextDecoder('utf-8');

  /**
   * UTF8 Array encode
   *
   * @param data
   */
  public static utf8ArrayEncode(data: string): Uint8Array {
    return this.encoder.encode(data);
  }

  /**
   * UTF8 Array decode
   *
   * @param array
   */
  public static utf8ArrayDecode(array: Uint8Array) {
    return this.decoder.decode(array);
  }

  /**
   * Map converter
   *
   * @param obj
   */
  public static do<K, V>(obj: Object): Map<string, V> {
    // let map: Map<string, V> = new Map<string, V>();
    let map;
    map = new Map<string, V>();
    Object.keys(obj).forEach((key) => {
        map.set(key, obj[key]);
    });

    return map;
}

  /**
   * HttpClient 데이터 추출
   *
   * @param res
   */
  public static extractData(res: Response) {
    if (res.status < 200 || res.status >= 300) {
      console.error(`extract data error: ${res.statusText}`);
      return {};
    } else {
      const body = res;
      return body || {};
    }
  }

  /**
   * Httpclient 오류 검출
   *
   * @param error
   */
  public static handleError(error: Response | any) {
    return Observable.throw(error); // error.message ||
  }

  /**
   * Error 정보 객체 파싱하기
   *
   * @param err
   */
  public static parseError(err: any): ErrorInfo {
    const errorData = err as ErrorInfo;
    return (errorData) ? errorData : null;
  }

  /**
   * Error 정보 가져오기
   *
   * @param err
   */
  public static getError(err: any): Errors {
    const error = this.parseError(err);
    let errors: Errors;
    if (error && error.error.errors) {
      errors = new Errors(error.error.errors[0].type, error.error.errors[0].message);
    } else if (error && error.errors) {
      errors = new Errors(error.errors[0].type, error.errors[0].message);
    } else if (error && error.error) {
      errors = new Errors(error.error.error, error.error.error_description);
    } else {
      errors = new Errors('Unknown Error', `${Utils.stringify(err)}`);
    }
    return errors;
  }

  /**
   * qz tray 에서 얻어온 mac address 변환
   *
   * @param macaddress
   * @param splitter
   */
  public static convertMacAddress(macaddress: string, splitter?: string): string {
    if (macaddress === null || macaddress === undefined) {
      return null;
    }

    splitter = splitter || '-';
    let macFormatted = '';
    for (let i = 0; i < macaddress.length; i++) {
      macFormatted += macaddress[i];
      if ( i % 2 === 1 && i < macaddress.length - 1 ) {
        macFormatted += splitter;
      }
    }
    return macFormatted;
  }

  /**
   * 값이 빈값인지 체크하기
   *
   * @param obj
   */
  public static isEmpty(obj: any): boolean {
    for (const key in obj) {
      if (obj.hasOwnProperty(key)) {
        return false;
      }
    }
    return true;
  }

  /**
   * 값이 빈값이 아닌지 체크하기
   *
   * @param obj
   */
  public static isNotEmpty(obj: any): boolean  {
    return !this.isEmpty(obj);
  }

  /**
   * undefined 인지 체크하기
   *
   * @param value
   */
  public static isUndefined(value: any): boolean {
    return typeof value === 'undefined';
  }

  /**
   * 문자열인지 체크하기
   *
   * @param value
   */
  public static isString(value: any): boolean {
    return typeof value === 'string';
  }

  /**
   * 숫자형인지 체크하기
   *
   * @param value
   */
  public static isNumber(value: any): boolean {
    return typeof value === 'number';
  }

  /**
   * 날짜형인지 체크하기
   *
   * @param value
   */
  public static isDate(value: any): boolean {
    return this.toString.call(value) === '[object Date]';
  }

  /**
   * json string으로 변환하기
   *
   * @param obj
   */
  public static stringify(obj: Object): string {
    if (this.isUndefined(obj)) {
      return undefined;
    }
    return JSON.stringify(obj, null, 2);
  }

  /**
   * json 형태로 변환하기
   *
   * @param json
   */
  public static parse(json: string): any {
    return this.isString(json) ? JSON.parse(json) : json;
  }

  /**
   * chrome kiosk mode 종료
   *
   * 방법 1.self.close();
   * 방법 2. ALT + F4
   * 방법 3. location.href = 'http://closekiosk';
   * plug-in 설치(https://chrome.google.com/webstore/detail/close-kiosk/dfbjahmenldfpkokepmfmkjkhdjelmkb)
   */
  public static kioskModeEnd() {
    // tampermonkey
    // @grant window.close
    self.close(); // only kiosk mode
    // window.open('', '_self').close();
    // location.href = 'http://closekiosk';
  }

  /**
   * 배치 시작 시 기존 배치가 있을 경우
   * 배치 시작 시 오류가 발생하는데 이를 처리하기 위해
   * 기존 배치를 먼저 삭제하고 배치를 다시 생성함.
   * 배치가 없을 경우 바로 배치를 시작하기 위해서
   * 배치가 없을 경우의 오류를 잡아서 배치를 시작하게함.
   * @param err 에러 객체
   */
  public static isNoOpenBatchByErrors(err: Errors) {
    if (err) {
      const errtype = err.type.toLowerCase();
      const errmsgs = err.message.substring(0, 15).toLowerCase().replace(/(\s*)/g, '');
      if (errtype === 'unknownidentifiererror' && errmsgs.startsWith('noopenbatch')) {
        return true;
      }
    }
    return false;
  }

  /**
   * 문자열 날짜를 Date 형식으로 변환
   *
   * @param text 문자열 날짜
   */
  public static convertDate(text: string): Date {
    // "dateOfBatchClosed": "2018-03-11T16:04:35+0000",
    const df = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}Z$/;
    if (df.test(text)) {
      return new Date(text);
    }
    return null;
  }

}
