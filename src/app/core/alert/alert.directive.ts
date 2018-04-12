import { Directive, HostListener, Renderer2, ElementRef, OnInit } from '@angular/core';

export enum KEY_CODE {
  ENTER = 13,
  ESC = 27
}
@Directive({
  selector: '.layer_alert[posAlert]'
})
export class AlertDirective implements OnInit {

  constructor(private element: ElementRef, private renderer: Renderer2) { }

  ngOnInit() { }

  // Press Esc or Enter key to close
  @HostListener('window:keydown', ['$event'])
  onAlertKeyDown(event: any) {
    event.stopPropagation(); // event.preventDefault();
    if (event.target.tagName === 'INPUT') { return; }
    if (event.keyCode === KEY_CODE.ENTER || event.keyCode === KEY_CODE.ESC) { // 13:enter, 27 : esc
      this.element.nativeElement.focus();
      this.renderer.setStyle(this.element.nativeElement, 'display', 'none');
    }
  }

}

