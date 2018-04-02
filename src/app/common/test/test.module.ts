import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { BrowserModule } from '@angular/platform-browser';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';
import { HttpModule } from '@angular/http';

import { FormatReader } from './../../core/peripheral/common/format-reader';
import { PosModalComponent } from './../../core/modal/pos-modal.component';
import { TestComponent } from './test.component';
import { PosModalService } from './../../core/service/pos-modal.service';

import { ProductSearchService } from './../../service/product.search.service';
import { AddCartBroker } from './../../broker/cart/addcart.broker';

import { ReceiptFormComponent } from './../../component/order/receiptform.component';
import { PrintReceiptComponent } from './../../component/order/printreceipt.component';
import { ProductSearchComponent } from './product-search/product-search.component';

import { ProductDataProvider } from './../../core/provider/product-data-provider';
import { ReceiptDataProvider } from './../../core/provider/receipt-data-provider';

import { ReceiptService } from '../../service/receipt.service';
import { CartListComponent } from './order/cart-list/cart-list.component';
import { PosReceiptPrintComponent } from './order/pos-receipt-print/pos-receipt-print.component';
import { EscPos } from '../../core/peripheral/model/helper/escpos';
import { ClickObserverComponent } from './study/click-observer/click-observer.component';


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
    BrowserModule,
    FormsModule,
    ReactiveFormsModule,
    HttpModule,
    HttpClientModule
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
