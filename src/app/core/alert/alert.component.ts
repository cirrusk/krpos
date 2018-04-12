
import { Component, OnInit, OnDestroy, ViewChild, ElementRef, Renderer2 } from '@angular/core';
import { Subscription } from 'rxjs/Subscription';
import { AlertService } from './alert.service';
import { AlertState } from './alert.service';
import { AlertType } from './alert-type.enum';

@Component({
  moduleId: module.id,
  selector: 'pos-alert',
  templateUrl: './alert.component.html'
})
export class AlertComponent implements OnInit, OnDestroy {
  show: boolean;
  message: string;
  title: string;
  alertType: string;
  private interval: number;
  private alertState: Subscription;
  @ViewChild('alertPanel', { read: ElementRef }) elm: ElementRef;
  constructor(private alert: AlertService, private renderer: Renderer2) { }

  ngOnInit() {
    this.alertState = this.alert.alertState.subscribe(
      (state: AlertState) => this.activation(state)
    );
  }

  ngOnDestroy() {
    if (this.alertState) { this.alertState.unsubscribe(); }
  }

  private activation(state: AlertState) {
    this.show = state.show;
    this.alertType = state.alertType;
    // timer 값을 true로 설정할 경우 alert 화면이 3.5 초 후 자동으로 닫힘.
    if (state.timer) {
      if (state.show) {
        this.interval = state.interval;
        this.alertShow();
      }
    } else {
      if (state.show) {
        this.renderer.setStyle(this.elm.nativeElement, 'display', '');
      } else {
        this.renderer.setStyle(this.elm.nativeElement, 'display', 'none');
      }
    }
    this.title = state.title;
    this.message = state.message;
  }

  private alertShow() {
    this.renderer.setStyle(this.elm.nativeElement, 'display', '');
    window.setTimeout(() => this.alertHide(), this.interval);
  }

  private alertHide() {
      window.setTimeout(() => this.renderer.setStyle(this.elm.nativeElement, 'display', 'none'), 300);
  }
}
