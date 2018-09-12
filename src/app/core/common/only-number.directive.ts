import { Directive, ElementRef, Input, HostListener } from '@angular/core';

/**
 * 숫자만 입력가능하도록 처리
 * 이벤트 차단 방식으로는 조합형인 한글에 대해서 올바르게 처리되지 않음.
 * 기존의 키보드 up/down, press 등의 이벤트로 처리할 경우
 * garbage 문자가 남거나 한글인 경우 이벤트를 잡지 못할 경우가 있음.
 * input에 대해서 Hostlistener를 지정하여 input에 대해서 모든 이벤트를 감지하도록 하고
 * 해당 이벤트 발생 시 regular expression으로 숫자 이외의 문자에 대해서 모두 빈값으로 치환
 */
@Directive({
  selector: '[posOnlyNumber]'
})
export class OnlyNumberDirective {
  @Input() posOnlyNumber: boolean;
  // Allow decimal numbers. The \. is only allowed once to occur
  private regexOnlyNum: RegExp = new RegExp(/^[0-9]+(\.[0-9]*){0,1}$/g); // 숫자만
  private regex: RegExp = /[^0-9]+/g;
  // Allow key codes for special events. Reflect :
  // Backspace, tab, end, home
  private specialKeys: Array<string> = [ 'Backspace', 'Tab', 'End', 'Home', 'Delete', 'ArrowLeft', 'ArrowRight'];
  constructor(private element: ElementRef) { }

  @HostListener('input', ['$event'])
  // @HostListener('keydown', ['$event'])
  onKeyDown(evt: any) {
     if (this.posOnlyNumber) {
      // Allow Backspace, tab, end, and home keys
      if (this.specialKeys.indexOf(evt.key) !== -1) {
        return;
      }
      evt.target.value = evt.target.value.replace(this.regex, '');

      // Do not use event.keycode this is deprecated.
      // See: https://developer.mozilla.org/en-US/docs/Web/API/KeyboardEvent/keyCode
      let current: string = this.element.nativeElement.value;
      current = current ? current : '';
      // We need this because the current value on the DOM element
      // is not yet updated with the value from this event
      const next: string = current.concat(evt.key);
      if (next && !String(next).match(this.regexOnlyNum)) {
        evt.preventDefault();
      }
    }
  }
}
