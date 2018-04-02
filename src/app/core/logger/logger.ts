import { Injectable } from '@angular/core';
import { DatePipe } from '@angular/common';

import { Levels } from './levels.enum';
import { Config } from './../config/config';
import Utils from '../utils';

@Injectable()
export class Logger {
  logLevel: string;
  constructor(private config: Config, private datePipe: DatePipe) {
    this.logLevel = this.config.getConfig('logLevel');
  }

  private consoleLog(level: string, message: string, name?: string) {
    if (!message) { return; }
    let logcolor;

    switch (level) {
      case 'TRACE': {
        logcolor = 'blue';
      } break;
      case 'DEBUG': {
        logcolor = 'teal';
      } break;
      case 'INFO':
      case 'LOG': {
        logcolor = 'gray';
      } break;
      case 'WARN':
      case 'ERROR': {
        logcolor = 'red';
      } break;
      case 'OFF':
      default: return;
    }

    const _loglevel: string = (this.logLevel && this.logLevel !== '') ? this.logLevel.toUpperCase() : 'DEBUG';
    if (Levels[level] >= Levels[_loglevel]) {
      // const date_str: string = this.datePipe.transform(new Date(), 'yyyy-MM-dd HH:mm:ss');
      if (name) { name = '[' + name + '] '; } else { name = ''; }
      console.log(
        // `%c${date_str} [%s] %c%s%s`,
      `%c[%s] %c%s%s`,
      `background:#fff; color:${logcolor}`,
      Utils.padding(`${level}`, ' ', 5),
      'color:black',
      name,
      message
    );
    }
  }

  public trace(message: string, name?: string) {
    this.consoleLog('TRACE', message, name);
  }

  public debug(message: string, name?: string) {
    this.consoleLog('DEBUG', message, name);
  }

  public info(message: string, name?: string) {
    this.consoleLog('INFO', message, name);
  }

  public log(message: string, name?: string) {
    this.consoleLog('LOG', message, name);
  }

  public warn(message: string, name?: string) {
    this.consoleLog('WARN', message, name);
  }

  public error(message: string, name?: string) {
    this.consoleLog('ERROR', message, name);
  }

}
