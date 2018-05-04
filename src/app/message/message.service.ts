import { Injectable, Inject } from '@angular/core';
import { MESSAGE } from './message';
import Utils from '../core/utils';

declare interface Window {
  navigator: any;
}

declare const window: Window;

@Injectable()
export class MessageService {

  private lang: string;
  constructor(@Inject(MESSAGE) private messages: any) {
    this.lang = 'ko';
  }

  /**
   * 언어를 설정/변경함.
   * 변경한 언어를 넘기지 않을 경우 브라우저 언어로 설정함.
   * msg-[lang].ts 언어를 설정하지 않은 경우 오류 발생에 주의!
   *
   * @param lang 언어
   */
  changeLang(lang?: string): void {
    if (lang) {
      this.lang = lang;
    } else {
      const blng = this.getBrowserLang();
      this.lang = blng === undefined ? 'ko' : blng;
    }
  }

  /**
   * 브라우저의 언어를 가져옴.
   */
  getBrowserLang(): string {
    if (typeof window === 'undefined' || typeof window.navigator === 'undefined') {
      return undefined;
    }
    let browserLang: any = window.navigator.languages ? window.navigator.languages[0] : null;
    browserLang = browserLang || window.navigator.language || window.navigator.browserLanguage || window.navigator.userLanguage;
    if (browserLang.indexOf('-') !== -1) { browserLang = browserLang.split('-')[0]; }
    if (browserLang.indexOf('_') !== -1) { browserLang = browserLang.split('_')[0]; }
    return browserLang;
  }

  /**
   * 메시지 가져오기
   * 2018.05.04 multiple argument 지원 수정
   *
   * @param key 메시지 키
   * @param holders 치환할 값(문자열 또는 문자열 배열)
   */
  get(key: string, ...holders: string[]): string {
    const m = this.getMessage(key);
    if (!holders) { return m; }
    return this.replace(m, holders);
  }

  /**
   * 메시지 치환하기
   *
   * @param msg 치환할 메시지
   * @param holders 치환할 값(문자열 또는 문자열 배열)
   */
  private replace(msg: string = '', holders: string | string[] = ''): string {
    let m: string = msg;
    const vals: string[] = [].concat(holders);
    vals.forEach((val, idx) => { m = m.replace('{'.concat(<any> idx).concat('}'), val); });
    return m;
  }

  /**
   * 키값으로 메시지 가져오기
   *
   * @param key 메시지 키값
   */
  private getMessage(key: string): string {
    const msgkey = key;
    if (this.messages[this.lang] && this.messages[this.lang][key]) {
      return this.messages[this.lang][key];
    }
    return msgkey;
  }

}
