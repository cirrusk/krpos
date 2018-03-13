import { Component, ViewChild, ElementRef, ViewEncapsulation } from "@angular/core";

import { PrinterService } from "../../service/common/printer/printer.service";
import { PrinterConfigs } from "../../peripheral/printer/interface/override.printerconfig.interface";
import { ReceiptFormComponent } from "./receiptform.component";

import { PrinterCommands } from "../../service/common/printer/helpers/printer.commands";

@Component({
    selector: 'receipt-print',
    template: `
    <h3>Receipt Print</h3>
    Press button to print below contents<br>
    <button (click)="click()">Print</button>
    
    <receipt-form id="printingForm"></receipt-form>

    <div id="form2">
        <style>
            div .width{
                border-style: solid;
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
    `,
})
export class PrintReceiptComponent {
    private printingText:string;

    private prtCmd: PrinterCommands;

    @ViewChild(ReceiptFormComponent)
    private receiptForm: ReceiptFormComponent

    constructor(private receiptPrinterService: PrinterService,) {
        this.prtCmd = new PrinterCommands();
    }

    ngOnInit() {
        
    }

    ngAfterViewInit() {
        
    }

    public clickHtml() {
        // HTML 방식
        // 출력 품질이 좋지 못함
        // let html = document.getElementById('printingForm').shadowRoot.innerHTML;
        // console.log(`Printing this contents ... ${html}`);
        // this.receiptPrinterService.printInlineHTML(html);
        
        let html = document.getElementById('printingForm').shadowRoot.innerHTML;
    }

    public clickRaw() {
        let printMsg: string =
            this.prtCmd.initPrinter() +
            this.prtCmd.printNVImage() +
            this.prtCmd.newline(3) +
            this.prtCmd.fontA() + 
            this.prtCmd.center() +
            this.prtCmd.println('Font A (center)') +
            this.prtCmd.left() +
            this.prtCmd.println('Font A Overflow after 42th') +
            this.prtCmd.println('12345678901234567890123456789012345678901234567890') +
            this.prtCmd.fontB() +
            this.prtCmd.right() +
            this.prtCmd.println('Font B (right)') +
            this.prtCmd.left() +
            this.prtCmd.println('Font B Overflow after 56th') +
            this.prtCmd.println('1234567890123456789012345678901234567890123456789012345678901234567890') +
            this.prtCmd.fontA() +
            this.prtCmd.println('Return font A mode') +
            this.prtCmd.println(this.prtCmd.doubledHeight('Doubled Height')) +
            this.prtCmd.println(this.prtCmd.doubledWidth('Doubled Width')) +
            this.prtCmd.println(this.prtCmd.doubledBoth('Doubled Both')) +
            this.prtCmd.println(this.prtCmd.bold('Bold Text')) +
            this.prtCmd.println(this.prtCmd.underline('Underline Text')) +
            this.prtCmd.println(this.prtCmd.reverse('Black / White reverse')) +
            this.prtCmd.println(this.prtCmd.printHorizontalDash()) +
            this.prtCmd.fontA() + 
            this.prtCmd.center() +
            this.prtCmd.println('폰트 A (중앙)') +
            this.prtCmd.left() +
            this.prtCmd.println('가나다라마바사아자차카타파하가나다라마바사아자차카타파하') +
            this.prtCmd.println('폰트 A 는 21자') +
            this.prtCmd.fontB() + 
            this.prtCmd.right() +
            this.prtCmd.println('폰트 B (오른쪽)') +
            this.prtCmd.println('가나다라마바사아자차카타파하가나다라마바사아자차카타파하') +
            // this.prtCmd.println('바코드') +
            // this.prtCmd.println('Order number : 233365551') +
            // this.prtCmd.printBarcodeCode128('233365551') +
            this.prtCmd.println('5 blank lines and cut') +
            this.prtCmd.newline(5) +
            this.prtCmd.paperPartialCut();

        this.receiptPrinterService.printText(printMsg);
    }

    public openCashDrawer() {
        this.receiptPrinterService.sendCommand(this.prtCmd.initPrinter() + this.prtCmd.openCashDrawer());
    }

    ngOnDestroy() {
        this.receiptPrinterService.closeConnection();
    }
}