import { Component, OnInit } from '@angular/core';

import { ReceiptService } from '../../../../service';
import { PrinterService, PrinterCommands } from '../../../../core';
import Utils from '../../../../core/utils';

@Component({
  selector: 'pos-receipt-print',
  templateUrl: './pos-receipt-print.component.html',
  styleUrls: ['./pos-receipt-print.component.css']
})
export class PosReceiptPrintComponent implements OnInit {
  printingText: string;
  prtCmd: PrinterCommands;
  receiptTempData: any = {
    shopInfo: {
        name: '강서 AP',
        telephone: '02-1234-1234',
        address: '서울 서울 서울 서울'
    },
    orderInfo: {
        posId: 'a1234',
        orderNumber: '1234456789',
        cashier: {
            lastName: 'Kim',
            firstName: 'MJ'
        },
        macAndCoNum: 'm1234',
        type: 'Offline',
        account: '74748585',
        date: '28/03/2018 00:00:00',
    },
    bonus: {
        ordering: {
            PV: '1234',
            BV: '56789'
        },
        final: {
            PV: '123456',
            BV: '789456'
        },
        group: {
            PV: '123456789',
            BV: '789456123'

        }
    },
    payments: {
        cash: {
            detail: {
                received: '100000',
                changes: '2000'
            }
        },
        creditcard: {
            amount: '200000'
        }
    },
    price: {
        totalQty: '10',
        amountWithoutVAT: '180000',
        amountVAT: '20000',
        totalAmount: '200000',
        discount: {
            total: '0'
        },
        finalAmount: '20000'
    },
    productList: [
        {
            idx: '1',
            skuCode: '123456K',
            productName: '프로덕트네임',
            price: '50000',
            qty: '2',
            totalPrice: '10000'
        },
        {
            idx: '2',
            skuCode: '10000K',
            productName: '프로덕트네임',
            price: '50000',
            qty: '2',
            totalPrice: '10000'
        }
    ]
  };

  constructor(private printerService: PrinterService, private receiptService: ReceiptService) {
    this.prtCmd = new PrinterCommands();
  }

  ngOnInit() {
  }

  public click() {

  }

  public clickHtml() {
    // HTML 방식
    // 출력 품질이 좋지 못함
    // let html = document.getElementById('printingForm').shadowRoot.innerHTML;
    // console.log(`Printing this contents ... ${html}`);
    // this.receiptPrinterService.printInlineHTML(html);

    const html = document.getElementById('printingForm').shadowRoot.innerHTML;
  }

public clickRaw() {
    const printMsg: string =
        this.prtCmd.initPrinter() +
        this.prtCmd.printBarcodeCodeUAT('100099A') +
        this.prtCmd.printBarcodeCodeUAT('100331M') +
        this.prtCmd.printBarcodeCodeUAT('100497M') +
        this.prtCmd.printBarcodeCodeUAT('100663T') +
        this.prtCmd.printBarcodeCodeUAT('100957A') +
        this.prtCmd.printBarcodeCodeUAT('101156M') +
        this.prtCmd.paperFullCut();
        
        console.log(printMsg);

    this.printerService.printText(printMsg);
  }

  public openCashDrawer() {
    console.log('open cash drawer... [' + this.prtCmd.initPrinter() + this.prtCmd.openCashDrawer() + ']');
    this.printerService.sendCommand(this.prtCmd.initPrinter() + this.prtCmd.openCashDrawer());
  }

  public readXmlTemplates() {
    this.printerService.initXmlTemplates();
  }

  public testReceipt() {
    const text = this.receiptService.getOrderReceipt(JSON.stringify(this.receiptTempData));
    this.printerService.printText(text);
    
  }

}
