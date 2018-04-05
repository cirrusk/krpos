import { Directive, HostListener, OnInit, ElementRef, Renderer } from '@angular/core';
import { ModalConfig } from './modal-config';

@Directive({
  selector: '[posModalCenter]'
})
export class ModalCenterDirective implements OnInit {

  modalPaddingTop = 0;
  constructor(public element: ElementRef, public renderer: Renderer) { }

  ngOnInit() {
    this.SetCenter(undefined, true);
  }

  @HostListener('window:resize', ['$event'])
  onResize(event: any) {
      this.SetCenter(event);
  }

  SetCenter(event?: any, isInit?: boolean) {
    const eventTarget = event === undefined ? window : event.target;
    const wh = eventTarget.innerHeight;
    const ww = eventTarget.innerWidth;
    const sy = eventTarget.scrollY;      // Top invisible height when scroll down.
    const ch = this.element.nativeElement.offsetHeight - this.modalPaddingTop; // Dialog visible height
    // IE doesn't support scrollY but it automatically scrolls back to the top 0 position.
    // The scrollY needs to be added for Google Chrome, Firefox, and Microsoft Edge.
    let paddingTopValue = (wh - ch) / 2 + (sy === undefined ? 0 : sy) - ModalConfig.topOffset;
    if (paddingTopValue < 0) {
        paddingTopValue = 0;
    }

    // Cache dialogPaddingTop value for use in next resize.
    this.modalPaddingTop = paddingTopValue;

    if (isInit) {
        paddingTopValue = paddingTopValue - ModalConfig.topOffset / 1.5;
    }

    const h = '-' + (this.element.nativeElement.offsetHeight / 2) + 'px';
    const w = '-' + (this.element.nativeElement.offsetWidth / 2) + 'px';


    this.renderer.setElementStyle(this.element.nativeElement, 'margin-left', w);
    this.renderer.setElementStyle(this.element.nativeElement, 'margin-top', h);

  }

}
