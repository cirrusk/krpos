import { Directive, TemplateRef } from '@angular/core';

@Directive({
  selector: '[posPromotionItem]'
})
export class PromotionItemDirective {

  constructor(public tmpl: TemplateRef<any>) { }

}
