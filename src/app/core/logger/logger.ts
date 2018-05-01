import { Injectable } from '@angular/core';
import { LogLevels } from '../../data';
import { Config } from '../config/config';
import Utils from '../utils';

const noop = (): any => undefined;

@Injectable()
export class Logger {
  private confLogLevel: string;
  private name: string;
  private message: string;
  constructor(private config: Config) {
    this.confLogLevel = this.config.getConfig('logLevel');
  }

  /**
   * 적절한 메시지를 구성하여
   * console 정보를 return 함.
   * 출력하고자 하는 로그레벨이 환경설정의 로그레벨보다 크면 로그 출력하지 않음.
   *
   * @param level 로그레벨
   */
  private logger(level: string, message?: string) {
    const cnfLevel: string = (this.confLogLevel && this.confLogLevel !== '') ? this.confLogLevel.toUpperCase() : 'DEBUG';
    if (LogLevels[level] >= LogLevels[cnfLevel]) {
      let nm, msg;
      if (this.message) {
        if (this.name) { nm = '[' + this.name + '] '; } else { nm = ''; }
        msg = this.message ? this.message : '';
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
   * @param name 소스의 대표 명칭
   * @param message 남길 메시지
   */
  set(name?: string, message?: string) {
    this.name = name;
    this.message = message;
    return this;
  }

  trace() {
    return this.logger('TRACE');
  }

  debug(message?: string) {
     return this.logger('DEBUG', message);
  }

  info() {
    return this.logger('INFO');
  }

  log() {
    return this.logger('LOG');
  }

  warn() {
    return this.logger('WARN');
  }

  error() {
    return this.logger('ERROR');
  }
}
