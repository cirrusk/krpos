import { Component, ElementRef, ViewChild } from "@angular/core";
import { Observable, Subscription } from "rxjs";

@Component({
    selector: 'click-observer',
    template: `
    <h3>Click Event Observable</h3>
    {{time}}<br>
    <button (click)="on()">Subscribe</button>
    <button (click)="off()">Unsubscribe</button>
    <button #btn>Event Firing</button>
    `
})
export class ClickEventObserverComponent {
    @ViewChild('btn')
    private btn: ElementRef;
    
    private time: string;

    private observer: Observable<any>;
    private subscription: Subscription;

    private isSubscribing: boolean = false;

    ngOnInit() {
        this.observer = Observable.fromEvent(this.btn.nativeElement, 'click');
    }

    public on() {
        if (this.isSubscribing) return;

        this.subscription = this.observer.subscribe((event) => {
                                    console.log(`Click event on ${event.target}`);
                                    this.time = event.timeStamp;
                                    this.isSubscribing = true;
                                });
    }

    public off() {
        if (!this.isSubscribing) return;

        this.subscription.unsubscribe();
        this.isSubscribing = false;
    }
}