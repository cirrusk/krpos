import { Injectable, Inject } from '@angular/core';
import * as format from 'string-format';
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
   * 언어를 설정함.
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
    if (browserLang.indexOf('-') !== -1) {
      browserLang = browserLang.split('-')[0];
    }
    if (browserLang.indexOf('_') !== -1) {
      browserLang = browserLang.split('_')[0];
    }
    return browserLang;
  }

  /**
   * 메시지 가져오기
   * multiple argument 형식이 없으므로 임의로 개수(6개까지)를 정해서 처리하도록 함.
   *
   * @param key 메시지 키
   * @param args0 index0 치환값
   * @param args1 index1 치환값
   * @param args2 index2 치환값
   * @param args3 index3 치환값
   * @param args4 index4 치환값
   * @param args5 index5 치환값
   */
  get(key: string, args0?: string, args1?: string, args2?: string, args3?: string, args4?: string, args5?: string): string {
    if (args1) {
      return format(this.getMessage(key), args0, args1, args2, args3, args4, args5);
    } else {
      return this.getMessage(key);
    }
  }

  private getMessage(key: string): string {
    const msgkey = key;
    if (this.messages[this.lang] && this.messages[this.lang][key]) {
      return this.messages[this.lang][key];
    }
    return msgkey;
  }

}
