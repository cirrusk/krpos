import { Component, OnDestroy, HostListener } from '@angular/core';
import { Subscription } from 'rxjs/Subscription';
import { Router, NavigationStart } from '@angular/router';
@Component({
  selector: 'pos-main',
  templateUrl: './app.component.html'
})
export class AppComponent implements OnDestroy {
  private routesubscription: Subscription;
  isClient: boolean;
  constructor(private router: Router) {
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

  @HostListener('document:keydown', ['$event'])
  handleF5KeyEvent(evt: KeyboardEvent) { // 116
    const key = evt.key.toLowerCase();
    if (evt.keyCode === 116 || evt.ctrlKey && key === 'r') {
      evt.preventDefault();
    }
  }

  ngOnDestroy() {
    if (this.routesubscription) { this.routesubscription.unsubscribe(); }
  }
}

