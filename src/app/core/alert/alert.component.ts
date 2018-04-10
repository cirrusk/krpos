import { AlertState } from './../service/alert.service';
import { Component, OnInit, OnDestroy, ViewChild, ElementRef, Renderer } from '@angular/core';
import { Subscription } from 'rxjs/Subscription';
import { AlertService } from '../service/alert.service';
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
  private alertState: Subscription;
  @ViewChild('alertPanel', { read: ElementRef }) elm: ElementRef;
  constructor(private alert: AlertService, private renderer: Renderer) { }

  ngOnInit() {
    this.alertState = this.alert.alertState.subscribe(
      (state: AlertState) => {
        this.show = state.show;
        this.alertType = state.alertType;
        if (state.show) {
          this.renderer.setElementStyle(this.elm.nativeElement, 'display', '');
        } else {
          this.renderer.setElementStyle(this.elm.nativeElement, 'display', 'none');
        }
        this.title = state.title;
        this.message = state.message;
      }
    );
  }

  ngOnDestroy() {
    if (this.alertState) { this.alertState.unsubscribe(); }
  }
}

