import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { FormatReader, PosModalComponent, PosModalService, ReceiptDataProvider, EscPos } from '../../core';
import { ReceiptService } from '../../service';
import { TestComponent } from './test.component';
import { ProductSearchService } from './product-search/product.search.service';

import { AddCartBroker } from '../../broker/cart/addcart.broker';

import { ProductSearchComponent } from './product-search/product-search.component';

import { ProductDataProvider } from './product-search/product-data-provider';
import { CartListComponent } from './order/cart-list/cart-list.component';
import { PosReceiptPrintComponent } from './order/pos-receipt-print/pos-receipt-print.component';
import { ClickObserverComponent } from './study/click-observer/click-observer.component';
import { HttpModule } from '@angular/http';

@NgModule({
    declarations: [
    TestComponent,
    ProductSearchComponent,
    PosModalComponent,
    CartListComponent,
    PosReceiptPrintComponent,
    ClickObserverComponent,
  ],
  imports: [
    CommonModule,
    HttpModule,
    FormsModule,
    ReactiveFormsModule
  ],
  providers: [
    AddCartBroker,
    ProductSearchService,
    ProductDataProvider,
    PosModalService,
    EscPos,
    FormatReader,
    ReceiptDataProvider,
    ReceiptService
  ]
})
export class TestModule { }
