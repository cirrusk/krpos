import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { HotkeysService, Hotkey } from 'angular2-hotkeys';
import { Subject } from 'rxjs/Subject';
import { Observable } from 'rxjs/Observable';
import { Logger } from '../logger/logger';

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

@Injectable()
export class KeyboardService {
  private subject: Subject<KeyCommand>;
  commands: Observable<KeyCommand>;
  constructor(private hotkeysService: HotkeysService, private http: HttpClient, private logger: Logger) {
    this.subject = new Subject<KeyCommand>();
    this.commands = this.subject.asObservable();
    this.http.get('assets/keyboard.json').map(data => data as ConfigModel).subscribe(c => {
      this.logger.set('keyboard.service', 'keyboard ' + JSON.stringify(c)).debug();
      for (const key in c.hotkeys) {
        if (key) {
          const commands = c.hotkeys[key];
          this.hotkeysService.add(new Hotkey(key, (evt, combo) => this.hotkeys(evt, combo, commands)));
        }
      }
    });
  }

  hotkeys(evt: KeyboardEvent, combo: string, commands: string[]): boolean {
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