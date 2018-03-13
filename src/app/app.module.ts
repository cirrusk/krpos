
import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { HttpModule } from '@angular/http';

import { PosMainComponent } from './component/posmain.component';
import { ProductSearchComponent } from './component/product/productsearch.component';

import { AddCartBroker } from './broker/cart/addcart.broker';

import { ProductSearchService } from './service/product.search.service';
import { ProductDataProvider } from './service/provider/productdata.provider';

import { CartListComponent } from './component/order/cartlist.component';
import { ModalComponent } from './component/common/modal/modal.component';

import { ClickEventObserverComponent } from './study/observable/clickevent.component';
import { PrintReceiptComponent } from './component/order/printreceipt.component';

import { ModalService } from './service/common/modal/modal.service';
import { PrinterService } from './service/common/printer/printer.service';
import { ReceiptFormComponent } from './component/order/receiptform.component';
import { NetworkService } from './service/common/network/network.service';
import { DriverReadyBroker } from './peripheral/common/driverstatus.broker';
import { QZDriver } from './peripheral/qz/qz.driver';
import { PrinterDriver } from './peripheral/printer/printer.driver';
import { NetworkDriver } from './peripheral/network/network.driver';

@NgModule({
  declarations: [
    PosMainComponent, ProductSearchComponent, CartListComponent,
    ModalComponent,
    PrintReceiptComponent,ReceiptFormComponent,
    ClickEventObserverComponent,
  ],
  imports: [
    BrowserModule,
    FormsModule, ReactiveFormsModule,
    HttpModule
  ],
  providers: [
    DriverReadyBroker,
    AddCartBroker,
    QZDriver,
    ProductSearchService, ProductDataProvider,
    ModalService,
    PrinterDriver,
    PrinterService,
    NetworkDriver,
    NetworkService,
  ],
  bootstrap: [PosMainComponent]
})
export class AppModule { }
