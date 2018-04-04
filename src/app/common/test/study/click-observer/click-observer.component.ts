import { OnDestroy } from '@angular/core';

import { Component, ElementRef, ViewChild, OnInit } from '@angular/core';
import { Observable } from 'rxjs/Observable';
import { Subscription } from 'rxjs/Subscription';
import { fromEvent } from 'rxjs/observable/fromEvent';

@Component({
  selector: 'pos-click-observer',
  templateUrl: './click-observer.component.html',
  styleUrls: ['./click-observer.component.css']
})
export class ClickObserverComponent implements OnInit, OnDestroy {
  @ViewChild('btn')
  private btn: ElementRef;
  private time: string;

  private observer: Observable<any>;
  private subscription: Subscription;
  private isSubscribing = false;
  constructor() { }

  ngOnInit() {
    this.observer = fromEvent(this.btn.nativeElement, 'click');
  }

  ngOnDestroy() {
    if (this.subscription) { this.subscription.unsubscribe(); }
  }

  public on() {
    if (this.isSubscribing) { return; }

    this.subscription = this.observer.subscribe((event) => {
                                console.log(`Click event on ${event.target}`);
                                this.time = event.timeStamp;
                                this.isSubscribing = true;
                            });
  }

  public off() {
    if (!this.isSubscribing) { return; }

    this.subscription.unsubscribe();
    this.isSubscribing = false;
  }

}
