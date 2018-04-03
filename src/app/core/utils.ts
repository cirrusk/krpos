import { Observable } from 'rxjs/Observable';
import 'rxjs/add/observable/throw';

import { TextEncoder, TextDecoder } from 'text-encoding';

export default class Utils {

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
      // console.log('... ' + JSON.stringify(body));
      return body || {};
    }
  }

  /**
   * Httpclient 오류 검출
   *
   * @param error
   */
  public static handleError(error: Response | any) {
    console.error(`httpclient error : ${error}`);
    return Observable.throw(error); // error.message ||

  }

  /**
   * qz tray 에서 얻어온 mac address 변환
   *
   * @param macaddress
   * @param splitter
   */
  public static convertMacAddress(macaddress: string, splitter?: string): string {
    if (macaddress === null || macaddress === undefined) {
      return 'UNKNOWN';
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
    // location.href = '/closekiosk';
  }

  /**
   * 문자열 패딩하기
   *
   * @param text
   * @param padchar
   * @param size
   */
  public static padding(text: string, padchar?: string, size?: number): string {
    padchar = padchar || ' ';
    size = size || text.length;
    if (text.length < size) {
      const ln = size - text.length;
      const remain = ( ln % 2 === 0 ) ? '' : padchar;
      const pads = padchar.repeat( ln / 2 );
      return pads + text + pads + remain;
    }
    return text;
  }

}
