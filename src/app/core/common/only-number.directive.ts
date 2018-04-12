import { Directive, ElementRef, Input, HostListener } from '@angular/core';

@Directive({
  selector: '[posOnlyNumber]'
})
export class OnlyNumberDirective {
  @Input() posOnlyNumber: boolean;
  // Allow decimal numbers. The \. is only allowed once to occur
  private regex: RegExp = new RegExp(/^[0-9]+(\.[0-9]*){0,1}$/g);
  // Allow key codes for special events. Reflect :
  // Backspace, tab, end, home
  private specialKeys: Array<string> = [ 'Backspace', 'Tab', 'End', 'Home' ];
  constructor(private element: ElementRef) { }

  @HostListener('keydown', ['$event'])
  onKeyDown(evt: KeyboardEvent) {
     if (this.posOnlyNumber) {
      // Allow Backspace, tab, end, and home keys
      if (this.specialKeys.indexOf(evt.key) !== -1) {
        return;
      }
      // Do not use event.keycode this is deprecated.
      // See: https://developer.mozilla.org/en-US/docs/Web/API/KeyboardEvent/keyCode
      const current: string = this.element.nativeElement.value;
      // We need this because the current value on the DOM element
      // is not yet updated with the value from this event
      const next: string = current.concat(evt.key);
      if (next && !String(next).match(this.regex)) {
        evt.preventDefault();
      }
    }
  }
}
