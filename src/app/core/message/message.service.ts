import { Injectable, Inject } from '@angular/core';
import { MESSAGE } from './../config/config';
import * as format from 'string-format';
import Utils from '../utils';

@Injectable()
export class MessageService {

  private lang: string;
  constructor(@Inject(MESSAGE) private messages: any) {
    this.lang = 'ko';
  }

  set(lang: string): void {
    this.lang = lang;
  }

  get(key: string, args1?: string, args2?: string, args3?: string, args4?: string, args5?: string, args6?: string): string {
    if (args1) {
      return format(this.getMessage(key), args1, args2, args3, args4, args5, args6);
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
