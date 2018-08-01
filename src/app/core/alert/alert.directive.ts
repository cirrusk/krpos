import { Directive, HostListener, Renderer2, ElementRef } from '@angular/core';
import { AlertService } from './alert.service';
import { KeyCode } from '../../data/models/key-code';

/**
 * alert 메시지 키이벤트 처리 디렉티브
 * ENTER, ESC 키 이벤트 시 hide
 * 포커스가 INPUT 요소에 있을 경우 처리하지 않음.
 */
@Directive({
  selector: '[posAlert]'
})
export class AlertDirective {

  constructor(private element: ElementRef, private renderer: Renderer2, private alertService: AlertService) { }

  // Press Esc or Enter key to close
  @HostListener('document:keydown', ['$event'])
  onAlertKeyDown(event: any) {
    event.stopPropagation(); // event.preventDefault();
    if (event.target.tagName === 'INPUT') { return; }
    if (event.keyCode === KeyCode.ENTER || event.keyCode === KeyCode.ESCAPE) { // 13:enter, 27 : esc
      // this.renderer.setStyle(this.element.nativeElement, 'display', 'none');
      this.alertService.hide();
    }
  }

}

