import { Directive, AfterViewInit, Input, ElementRef } from '@angular/core';

/**
 * 모달 포커스 설정 디렉티브
 * 팝업이 떴을 경우 포커스를 잃으면 키이벤트 바인딩이 되지 않음
 */
@Directive({
  selector: '[posFocusBlur]'
})
export class FocusBlurDirective implements AfterViewInit {

  @Input() posFocusBlur: string;
  constructor(private element: ElementRef) { }

  ngAfterViewInit() {
    setTimeout(() => {
      if (this.posFocusBlur === 'focus' || this.posFocusBlur === 'focus_blur') {
          // this._el.nativeElement.focus();
          // this.renderer.invokeElementMethod(this.element.nativeElement, 'focus');
          this.element.nativeElement.focus();
      }
      if (this.posFocusBlur === 'blur' || this.posFocusBlur === 'blur_focus') {
          // this.element.nativeElement.blur();
          // this.renderer.invokeElementMethod(this.element.nativeElement, 'blur');
          this.element.nativeElement.blur();
      }
    }, 10);
  }

}
