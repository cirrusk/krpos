import { Component, OnDestroy, OnInit } from '@angular/core';
import { Subscription } from 'rxjs/Subscription';
import { Router, NavigationStart } from '@angular/router';
import { KeyboardService, KeyCommand } from './core';
@Component({
  selector: 'pos-main',
  templateUrl: './app.component.html'
})
export class AppComponent implements OnInit, OnDestroy {
  private routesubscription: Subscription;
  private keyboardsubscription: Subscription;
  isClient: boolean;
  constructor(private keyboard: KeyboardService, private router: Router) {
    this.routesubscription = this.router.events.subscribe(event => {
      if (event instanceof NavigationStart) {
        const clnt = event.url;
        if (clnt && clnt.indexOf('/client') !== -1) {
          this.isClient = true;
        } else {
          this.isClient = false;
        }
      }
    });
  }

  ngOnInit() {
    this.keyboardsubscription = this.keyboard.commands.subscribe(c => {
      this.handleKeyboardCommand(c);
    });
  }

  ngOnDestroy() {
    if (this.routesubscription) { this.routesubscription.unsubscribe(); }
    if (this.keyboardsubscription) { this.keyboardsubscription.unsubscribe(); }
  }

  protected doClearInput(evt: any) {
    if (evt.target.tagName === 'INPUT' && (evt.target.type === 'text' || evt.target.type === 'number')) {
      evt.target.value = '';
    }
  }

  private handleKeyboardCommand(command: KeyCommand) {
    try {
      this[command.name](command.ev);
    } catch (e) { console.log('1111111111111111111'); }
  }

}
