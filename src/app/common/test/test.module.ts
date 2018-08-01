import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpModule } from '@angular/http';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { FormatReader, ReceiptDataProvider, EscPos } from '../../core';
import { ReceiptService } from '../../service';
import { TestComponent } from './test.component';

import { PosReceiptPrintComponent } from './order/pos-receipt-print/pos-receipt-print.component';
import { NicePaymentService } from '../../core/peripheral/niceterminal/nice.payment.service';
import { NiceDriver } from '../../core/peripheral/niceterminal/nice.driver';

@NgModule({
    declarations: [
    TestComponent,
    PosReceiptPrintComponent
  ],
  imports: [
    CommonModule,
    HttpModule,
    FormsModule,
    ReactiveFormsModule
  ],
  providers: [
    EscPos,
    FormatReader,
    ReceiptDataProvider,
    ReceiptService,
    NiceDriver,
    NicePaymentService
  ]
})
export class TestModule { }
