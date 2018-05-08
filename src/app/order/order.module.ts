import { NgModule, Optional, SkipSelf } from '@angular/core';
import { CommonModule } from '@angular/common';

import { throwIfAlreadyLoaded } from '../core/module-import-guard';
import { OrderComponent } from './order.component';
import { CartListComponent } from './cart-list/cart-list.component';
import { OrderMenuComponent } from './order-menu/order-menu.component';
import { OrderCompleteComponent } from './order-complete/order-complete.component';
import { AddCartBroker, SearchBroker } from '../broker';

@NgModule({
  imports: [
    CommonModule
  ],
  declarations: [
    OrderComponent,
    CartListComponent,
    OrderMenuComponent,
    OrderCompleteComponent
  ],
  providers: [AddCartBroker, SearchBroker]
})
export class OrderModule {
  constructor(@Optional() @SkipSelf() parentModule: OrderModule) {
    throwIfAlreadyLoaded(parentModule, 'OrderModule');
  }
}
