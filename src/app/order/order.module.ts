import { NgModule, Optional, SkipSelf } from '@angular/core';
import { CommonModule } from '@angular/common';

import { throwIfAlreadyLoaded } from '../core/module-import-guard';
import { OrderComponent } from './order.component';
import { CartListComponent } from './cart-list/cart-list.component';
import { OrderMenuComponent } from './order-menu/order-menu.component';
import { OrderCompleteComponent } from './order-complete/order-complete.component';
import { AddCartBroker, SearchBroker } from '../broker';
import { NoticeComponent } from './notice/notice.component';
import { ClientComponent } from './client/client.component';
import { PromotionComponent, PromotionItemElementDirective } from './promotion/promotion.component';
import { PromotionItemDirective } from './promotion/promotion-item.directive';
import { StripHtmlPipe } from '../core/pipe/strip-html.pipe';

@NgModule({
  imports: [
    CommonModule
  ],
  declarations: [
    CartListComponent,
    ClientComponent,
    NoticeComponent,
    OrderComponent,
    OrderMenuComponent,
    OrderCompleteComponent,
    PromotionComponent,
    PromotionItemDirective,
    PromotionItemElementDirective,
    StripHtmlPipe
  ],
  providers: [AddCartBroker, SearchBroker]
})
export class OrderModule {
  constructor(@Optional() @SkipSelf() parentModule: OrderModule) {
    throwIfAlreadyLoaded(parentModule, 'OrderModule');
  }
}
