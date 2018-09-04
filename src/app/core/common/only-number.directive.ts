import { Directive, ElementRef, Input, HostListener } from '@angular/core';

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
