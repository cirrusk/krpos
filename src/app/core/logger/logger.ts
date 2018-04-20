import { Injectable } from '@angular/core';
import { DatePipe } from '@angular/common';

import { Levels } from './levels.enum';
import { Config } from '../config/config';
import Utils from '../utils';

const noop = (): any => undefined;

@Injectable()
export class Logger {
  confLogLevel: string;
  params: any;
  constructor(private config: Config, private datePipe: DatePipe) {
    this.confLogLevel = this.config.getConfig('logLevel');
  }

  /**
   * 적절한 메시지를 구성하여
   * console 정보를 return 함.
   * 출력하고자 하는 로그레벨이 환경설정의 로그레벨보다 크면 로그 출력하지 않음.
   *
   * @param level 로그레벨
   */
  private logger(level: string) {
    const cnfLevel: string = (this.confLogLevel && this.confLogLevel !== '') ? this.confLogLevel.toUpperCase() : 'DEBUG';
    if (Levels[level] >= Levels[cnfLevel]) {
      let nm, msg;
      if (this.params) {
        if (this.params.n) { nm = '[' + this.params.n + '] '; } else { nm = ''; }
        msg = this.params.m ? this.params.m : '';
        switch (level) {
          case 'TRACE': { return console.trace.bind(console, `%c[%s] %c%s%s`, 'color:blue', 'TRACE', 'color:blue', nm, msg); }
          case 'DEBUG': { return console.debug.bind(console, `%c[%s] %c%s%s`, 'color:teal', 'DEBUG', 'color:teal', nm, msg); }
          case 'INFO':
          case 'LOG':   { return console.log.bind(console, `%c[%s] %c%s%s`, 'color:gray', 'LOG', 'color:gray', nm, msg); }
          case 'WARN':
          case 'ERROR': { return console.error.bind(console, `%c[%s] %c%s%s`, 'color:red', 'ERROR', 'color:red;', nm, msg); }
          case 'OFF':
          default: return noop;
        }
      } else {
        switch (level) {
          case 'TRACE': { return console.trace.bind(console); }
          case 'DEBUG': { return console.debug.bind(console); }
          case 'INFO':
          case 'LOG':   { return console.log.bind(console); }
          case 'WARN':
          case 'ERROR': { return console.error.bind(console); }
          case 'OFF':
          default: return noop;
        }
      }
    }
  }

  /**
   * 로그를 남길 경우 로그 정보를 설정
   *
   * @param params : { n : 소스의 대표 명칭, m : 남길 메시지 }
   */
  set(params: any) {
    this.params = params;
    return this;
  }

  get trace() {
    return this.logger('TRACE');
  }

  get debug() {
    return this.logger('DEBUG');
  }

  get info() {
    return this.logger('INFO');
  }

  get log() {
    return this.logger('LOG');
  }

  get warn() {
    return this.logger('WARN');
  }

  get error() {
    return this.logger('ERROR');
  }
}
