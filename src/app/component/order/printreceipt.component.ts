import { Component, ViewChild, ElementRef, ViewEncapsulation } from '@angular/core';

import { PrinterService } from '../../service/common/printer/printer.service';
import { ReceiptFormComponent } from './receiptform.component';

import { PrinterCommands } from '../../service/common/printer/helpers/printer.commands';
import { ReceiptDataProvider } from '../../service/provider/receipt/receiptdata.provider';
import { ReceiptService } from '../../service/receipt.service';
import { UTF8ArrayConverter } from '../../service/common/utils/utf8.arrayconverter';

@Component({
    selector: 'receipt-print',
    template: `
    <h3>Receipt Print</h3>
    Press button to print below contents<br>
    <button (click)="click()">Print</button>

    <!--
    <receipt-form id="printingForm"></receipt-form>
    -->

    <div id="form2">
        <style>
            div .width{
                border-style: solid 1;
                width: 260px;
            },
        </style>
        <div class="width">
            <p>
                &lt;div&gt; width is 260px
            </p>
            <h1>H1 Head</h1>
            <h2>H2 Head</h2>
            <h3>H3 Head</h3>
            <h4>H4 Head</h4>
        </div>
    </div>

    <input type="text" [(ngModel)]="printingText">
    <!--button (click)="clickHtml()">Print</button-->
    <button (click)="clickRaw()">Print Receipt</button>
    <button (click)="openCashDrawer()">Open Cashdrawer</button>

    <br>

    <button (click)="readXmlTemplates()">Read</button>
    <button (click)="testReceipt()">Show!!!</button>
    `,
})
export class PrintReceiptComponent {
    private printingText: string;

    private prtCmd: PrinterCommands;

    private receitTempData: any = {
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


    @ViewChild(ReceiptFormComponent)
    private receiptForm: ReceiptFormComponent;

    constructor(private printerService: PrinterService,
                private receiptService: ReceiptService) {
        this.prtCmd = new PrinterCommands();
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
            this.prtCmd.printNVImage() +
            // this.prtCmd.newline(3) +
            // this.prtCmd.fontA() +
            // this.prtCmd.center() +
            this.prtCmd.println('Font A (center)') +
            this.prtCmd.left();
            // this.prtCmd.println('Font A Overflow after 42th') +
            // this.prtCmd.println('12345678901234567890123456789012345678901234567890') +
            // this.prtCmd.fontB() +
            // this.prtCmd.right() +
            // this.prtCmd.println('Font B (right)') +
            // this.prtCmd.left() +
            // this.prtCmd.println('Font B Overflow after 56th') +
            // this.prtCmd.println('1234567890123456789012345678901234567890123456789012345678901234567890') +
            // this.prtCmd.fontA() +
            // this.prtCmd.println('Return font A mode') +
            // this.prtCmd.println(this.prtCmd.doubledHeight('Doubled Height')) +
            // this.prtCmd.println(this.prtCmd.doubledWidth('Doubled Width')) +
            // this.prtCmd.println(this.prtCmd.doubledBoth('Doubled Both')) +
            // this.prtCmd.println(this.prtCmd.bold('Bold Text')) +
            // this.prtCmd.println(this.prtCmd.underline('Underline Text')) +
            // this.prtCmd.println(this.prtCmd.reverse('Black / White reverse')) +
            // this.prtCmd.println(this.prtCmd.printHorizontalDash()) +
            // this.prtCmd.fontA() +
            // this.prtCmd.center() +
            // this.prtCmd.println('폰트 A (중앙)') +
            // this.prtCmd.left() +
            // this.prtCmd.println('가나다라마바사아자차카타파하가나다라마바사아자차카타파하') +
            // this.prtCmd.println('폰트 A 는 21자') +
            // this.prtCmd.fontB() +
            // this.prtCmd.right() +
            // this.prtCmd.println('폰트 B (오른쪽)') +
            // this.prtCmd.println('가나다라마바사아자차카타파하가나다라마바사아자차카타파하') +
            // // this.prtCmd.println('바코드') +
            // // this.prtCmd.println('Order number : 233365551') +
            // // this.prtCmd.printBarcodeCode128('233365551') +
            // this.prtCmd.println('5 blank lines and cut') +
            // this.prtCmd.newline(5) +
            // this.prtCmd.paperPartialCut();

            console.log(printMsg);

        this.printerService.printText(printMsg);
    }

    public openCashDrawer() {
        this.printerService.sendCommand(this.prtCmd.initPrinter() + this.prtCmd.openCashDrawer());
    }

    public readXmlTemplates() {
        this.printerService.initXmlTemplates();
    }



    public testReceipt() {
        const text = this.receiptService.getOrderReceipt(this.receitTempData);
        console.log(text);
        console.log(UTF8ArrayConverter.encode(text));
        this.printerService.printText(text);
    }

    // ngOnDestroy() {
    //     this.printerService.closeConnection();
    // }
}
