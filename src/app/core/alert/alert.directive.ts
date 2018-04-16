import { Directive, HostListener, Renderer2, ElementRef } from '@angular/core';

export enum KEY_CODE {
  ENTER = 13,
  ESC = 27
}
@Directive({
  selector: '[posAlert]'
})
export class AlertDirective {

  constructor(private element: ElementRef, private renderer: Renderer2) { }

  // Press Esc or Enter key to close
  @HostListener('window:keydown', ['$event'])
  onAlertKeyDown(event: any) {
    event.stopPropagation(); // event.preventDefault();
    if (event.target.tagName === 'INPUT') { return; }
    if (event.keyCode === KEY_CODE.ENTER || event.keyCode === KEY_CODE.ESC) { // 13:enter, 27 : esc
      this.renderer.setStyle(this.element.nativeElement, 'display', 'none');
    }
  }

}

