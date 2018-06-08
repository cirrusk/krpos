import { Directive, HostListener, Renderer2, ElementRef } from '@angular/core';
import { AlertService } from './alert.service';
import { KeyCode } from '../../data/models/key-code';

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

