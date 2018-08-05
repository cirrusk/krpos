
import { Component, OnInit, OnDestroy, ViewChild, ElementRef, Renderer2 } from '@angular/core';
import { Subscription } from 'rxjs/Subscription';
import { AlertService, AlertState, AlertType } from '..';

/**
 * alert 메시지 출력
 *
 * 버튼 없이 키 이벤트(ESC, ENTER)로 화면 닫음.
 * 타이머를 이용하여 toast popup과 동일한 기능 처리 가능.
 *
 */
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
      (state: AlertState) => this.display(state)
    );
  }

  ngOnDestroy() {
    if (this.alertState) { this.alertState.unsubscribe(); }
  }

  /**
   * alert display 처리함.
   *
   * 중요)
   * input 요소가 아닌 element에 focus를 지정하기 위해서는
   * 해당 element 에 반드시 tabindex를 지정(값은 상관없음)하고
   * focus를 설정해야함.
   *
   * @param {AlertState} state alert 상태 객체
   */
  private display(state: AlertState) {
    this.show = state.show;
    this.alertType = state.alertType;
    if (state.timer) { // timer 값을 true로 설정할 경우 alert 화면이 특정 초 후 자동으로 닫힘.
      if (state.show) {
        this.interval = state.interval;
        this.alertShow();
      }
    } else {
      if (state.show) {
        this.renderer.setStyle(this.elm.nativeElement, 'display', '');
        this.elm.nativeElement.focus(); // element 에 focus를 지정해야 event 가 처리됨.
        // setTimeout(() => this.elm.nativeElement.focus(), 200);
      } else {
        this.renderer.setStyle(this.elm.nativeElement, 'display', 'none');
        // this.elm.nativeElement.blur();
        // setTimeout(() => this.elm.nativeElement.blur(), 200);
      }
    }
    this.title = state.title;
    this.message = state.message;
  }

  /**
   * alert 메시지 show
   */
  private alertShow() {
    this.renderer.setStyle(this.elm.nativeElement, 'display', '');
    this.elm.nativeElement.focus();
    window.setTimeout(() => this.alertHide(), this.interval);
  }

  /**
   * alert 메시지 hide
   */
  private alertHide() {
      window.setTimeout(() => this.renderer.setStyle(this.elm.nativeElement, 'display', 'none'), 10);
  }
}
