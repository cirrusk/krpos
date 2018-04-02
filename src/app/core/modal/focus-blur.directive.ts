import { Directive, AfterViewInit, Input, ElementRef, Renderer } from '@angular/core';

@Directive({
  selector: '[posFocusBlur]'
})
export class FocusBlurDirective implements AfterViewInit {

  @Input() posFocusBlur: string;
  constructor(private element: ElementRef, private renderer: Renderer) { }

  ngAfterViewInit() {
    setTimeout(() => {
      if (this.posFocusBlur === 'focus' || this.posFocusBlur === 'focus_blur') {
          // this._el.nativeElement.focus();
          this.renderer.invokeElementMethod(this.element.nativeElement, 'focus');
      }
      if (this.posFocusBlur === 'blur' || this.posFocusBlur === 'focus_blur') {
          // this.element.nativeElement.blur();
          this.renderer.invokeElementMethod(this.element.nativeElement, 'blur');
      }
    }, 10);
  }

}
