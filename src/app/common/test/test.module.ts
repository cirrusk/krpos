
// import { PrinterDriver } from './../../peripheral/printer/printer.driver';
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { BrowserModule } from '@angular/platform-browser';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';
import { HttpModule } from '@angular/http';

import { PosModalComponent } from './../../core/modal/pos-modal.component';
import { TestComponent } from './test.component';
import { FileDownloader } from './../../service/common/file/filedownloader';
import { PosModalService } from './../../core/service/pos-modal.service';

import { ProductSearchService } from './../../service/product.search.service';
import { AddCartBroker } from './../../broker/cart/addcart.broker';
import { ClickEventObserverComponent } from './../../study/observable/clickevent.component';
import { ReceiptFormComponent } from './../../component/order/receiptform.component';
import { PrintReceiptComponent } from './../../component/order/printreceipt.component';
import { ProductSearchComponent } from './product-search/product-search.component';

import { ProductDataProvider } from '../../service/provider/productdata.provider';
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
    // PrintReceiptComponent,
    // ReceiptFormComponent,
    // ClickEventObserverComponent,
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
    // DriverReadyBroker,
    AddCartBroker,
    // QZDriver,
    ProductSearchService,
    ProductDataProvider,
    PosModalService,
    EscPos,
    // FileDownloader,
    // PrinterService,
    // PrinterDriver,
    // NetworkDriver,
    // NetworkService,
    ReceiptDataProvider,
    ReceiptService
  ]
})
export class TestModule { }
