import { Directive, HostListener, Renderer, ElementRef, OnInit } from '@angular/core';

@Directive({
  selector: '[posAlert]'
})
export class AlertDirective implements OnInit {

  constructor(private element: ElementRef, private renderer: Renderer) { }

  ngOnInit() {
  }

  // Press Esc or Enter key to close
  @HostListener('window:keydown', ['$event'])
  onAlertEnter(event: any) {
    // event.preventDefault();
    event.stopPropagation();
    if (event.keyCode === 13 || event.keyCode === 27) { // 13:enter, 27 : esc
      this.renderer.setElementStyle(this.element.nativeElement, 'display', 'none');
    }
  }

}

