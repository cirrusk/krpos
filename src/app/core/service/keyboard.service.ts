import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { HotkeysService, Hotkey } from 'angular2-hotkeys';
import { Subject } from 'rxjs/Subject';
import { Observable } from 'rxjs/Observable';

class HotkeyConfig {
  [key: string]: string[];
}

class ConfigModel {
  hotkeys: HotkeyConfig;
}

export class KeyCommand {
  name: string;
  combo: string;
  ev: KeyboardEvent;
}

/**
 * 키보드 이벤트 처리 서비스
 */
@Injectable()
export class KeyboardService {
  private subject: Subject<KeyCommand>;
  commands: Observable<KeyCommand>;
  constructor(private hotkeysService: HotkeysService, private http: HttpClient) {
    this.subject = new Subject<KeyCommand>();
    this.commands = this.subject.asObservable();
    this.http.get('assets/keyboard.json').map(data => data as ConfigModel).subscribe(c => {
      for (const key in c.hotkeys) {
        if (key) {
          const commands = c.hotkeys[key];
          this.hotkeysService.add(new Hotkey(key, (evt, combo) => this.sendHotkeyEvent(evt, combo, commands)));
        }
      }
    });
  }

  /**
   * 키보드 이벤트 전송
   *
   * @param {KeyboardEvent} evt 키보드 이벤트
   * @param {string} combo 키보드 콤보값
   * @param {string[]} commands 실행 명령함수배열
   * @returns {boolean} 성공/실패 여부(현재는 무조건 성공으로 전송)
   */
  private sendHotkeyEvent(evt: KeyboardEvent, combo: string, commands: string[]): boolean {
    commands.forEach(c => {
      const command = {
        name: c,
        ev: evt,
        combo: combo
      } as KeyCommand;
      this.subject.next(command);
    });
    return true;
  }
}
