import { Component, OnInit } from '@angular/core';
import { Subject } from 'rxjs/Subject';

import { ReceiptService } from '../../../../service';
import { PrinterService, PrinterCommands } from '../../../../core';
import { OrderInfoVO } from '../../../../data/models/receipt/order.info';
import { BonusInfoVO } from '../../../../data/models/receipt/bonus.info';
import { PaymentsVO } from '../../../../data/models/receipt/payments';
import { PriceVO } from '../../../../data/models/receipt/price';
import { ProductEntryVO } from '../../../../data/models/receipt/product';
import { ReceiptVO } from '../../../../data/models/receipt/receipt.vo';
import { NicePaymentService } from '../../../../core/peripheral/niceterminal/nice.payment.service';
import { CardApprovalResult } from '../../../../core/peripheral/niceterminal/vo/card.approval.result';
import { CardCancelResult } from '../../../../core/peripheral/niceterminal/vo/card.cancel.result';

@Component({
    selector: 'pos-receipt-print',
    templateUrl: './pos-receipt-print.component.html',
    styleUrls: ['./pos-receipt-print.component.css']
})
export class PosReceiptPrintComponent implements OnInit {
    printingText: string;
    prtCmd: PrinterCommands;
    amount: string;
    installment: string;
    approvalResult: string;
    approvalNumber: string;
    approvalDateTime: string;
    cancelResult: string;

    receiptTempData: any = {
        shopInfo: {
            name: '강서 AP',
            telephone: '02-1234-1234',
            address: '서울 서울 서울 서울'
        },
        orderInfo: {
            posId: 'a1234',
            number: '123456789',
            cashier: {
                ad: 'kr620038',
                lastName: 'Kim',
                firstName: 'MJ'
            },
            macAndCoNum: 'm1234',
            type: '현장구매',
            account: {
                abo: {
                    id: '7480003',
                    name: '암돌이'
                }
            },
            date: '2018/05/14 00:00:00',
        },
        bonus: {
            ordering: {
                PV: '123',
                BV: '254'
            },
            sum: {
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
                amount: '300000',
                detail: {
                    received: '300000',
                    changes: '0'
                }
            },
            creditcard: {
                amount: '430000',
                detail: {
                    cardnumber: '1234***5678',
                    installment: '일시불',
                    authNumber: '74748585'
                }
            }
        },
        price: {
            totalQty: '17',
            amountWithoutVAT: '657000',
            amountVAT: '73000',
            totalAmount: '730000',
            discount: {
                total: '0'
            },
            finalAmount: '730000'
        },
        productList: [
            {
                idx: '1',
                skuCode: '123456K',
                productName: '더블엑스 리필',
                price: '80000',
                qty: '1',
                totalPrice: '80000'
            },
            {
                idx: '2',
                skuCode: '286841K',
                productName: 'XS 에너지 시리얼 허니 콘플레이크',
                price: '6500',
                qty: '2',
                totalPrice: '13000'
            },
            {
                idx: '3',
                skuCode: '286841K',
                productName: '뉴트리키즈 패키지 리비전',
                price: '97000',
                qty: '1',
                totalPrice: '97000'
            },
            {
                idx: '4',
                skuCode: '118761K',
                productName: '비타민 디',
                price: '32000',
                qty: '2',
                totalPrice: '64000'
            },
            {
                idx: '5',
                skuCode: '286841K',
                productName: '뉴트리라이트 베스트 선물세트',
                price: '120000',
                qty: '2',
                totalPrice: '240000'
            },
            {
                idx: '6',
                skuCode: '286841K',
                productName: '뉴트리키즈 츄어블 칼슘',
                price: '35000',
                qty: '1',
                totalPrice: '35000'
            },
            {
                idx: '7',
                skuCode: '110671K2',
                productName: '새티니크 글로시 리페어 컨디셔너 280ml',
                price: '14000',
                qty: '1',
                totalPrice: '14000'
            },
            {
                idx: '8',
                skuCode: '286841K',
                productName: '새티니크 듀얼 디펜드 스프레이',
                price: '20000',
                qty: '1',
                totalPrice: '20000'
            },
            {
                idx: '9',
                skuCode: '285054K',
                productName: '퍼스널케어 파워 셀렉션 선물세트',
                price: '36000',
                qty: '4',
                totalPrice: '144000'
            },
            {
                idx: '10',
                skuCode: '120522A',
                productName: '글리스터 어린이 칫솔',
                price: '11500',
                qty: '2',
                totalPrice: '23000'
            }
        ]
    };

    constructor(private printerService: PrinterService, private receiptService: ReceiptService,
                private paymentService: NicePaymentService) {
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
            // this.prtCmd.print() +
            this.prtCmd.newline(5) +
            this.prtCmd.paperFullCut();
        // this.prtCmd.center() +
        // this.prtCmd.printBarcodeCodeUAT('100099A') +
        // this.prtCmd.printBarcodeCodeUAT('100331M') +
        // this.prtCmd.printBarcodeCodeUAT('100497M') +
        // this.prtCmd.printBarcodeCodeUAT('100663T') +
        // this.prtCmd.printBarcodeCodeUAT('100957A') +
        // this.prtCmd.printBarcodeCodeUAT('101156M') +
        // this.prtCmd.paperFullCut();
        this.printerService.printText(printMsg);
    }

    public openCashDrawer() {
        console.log('open cash drawer... [' + this.prtCmd.initPrinter() + this.prtCmd.openCashDrawer() + ']');
        this.printerService.sendCommand(this.prtCmd.initPrinter() + this.prtCmd.openCashDrawer());
    }

    public readXmlTemplates() {
        // Do nothing
    }

    public testReceipt() {
        // const text = this.receiptService.getOrderReceipt(JSON.stringify(this.receiptTempData));
        // const text = this.receiptService.getOrderReceipt(this.receiptTempData);
        // const text = this.receiptService.aboNormal(this.receiptTempData);
        // this.printerService.printText(text);
    }

    public testReceiptwithVO() {
        const orderInfo = new OrderInfoVO('MJ PC', 'kr620038', 'MJ Kim', '7480003', '암돌이');
        const bonus = new BonusInfoVO(200, 300);
        const payments = new PaymentsVO(93000);
        const price = new PriceVO(3, 93000);
        const productList = new Array<ProductEntryVO>();

        const product1 = new ProductEntryVO(1, '123456K', '더블엑스 리필', 80000, 1, 80000);
        const product2 = new ProductEntryVO(10, '286841K', 'XS 에너지 시리얼 허니 콘플레이크', 6500, 2, 13000);

        productList.push(product1);
        productList.push(product2);

        const receitVo = new ReceiptVO(orderInfo, bonus, payments, price, productList);

        const text = this.receiptService.aboNormal(receitVo);
        this.printerService.printText(text);
    }

    public niceApproval() {
        const resultNotifier: Subject<CardApprovalResult> = this.paymentService.cardApproval(this.amount, this.installment);
        console.log('Component Listening on : ' + resultNotifier);
        resultNotifier.subscribe(
            (res: CardApprovalResult) => {
                this.approvalResult = res.stringify();
                this.approvalNumber = res.approvalNumber;
                this.approvalDateTime = res.approvalDateTime;
            }
        );
        // console.log("Disconnecting : " + resultNotifier);
        // resultNotifier.unsubscribe();
    }

    public niceCancel() {
        const resultNotifier: Subject<CardCancelResult> = this.paymentService.cardCancel(this.amount, this.approvalNumber, this.approvalDateTime, this.installment);

        resultNotifier.subscribe(
            (res: CardCancelResult) => {
                console.log(res.stringify());
                this.cancelResult = res.stringify();
            }
        );
        // resultNotifier.unsubscribe();
    }

}
