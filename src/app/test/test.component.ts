import { Component, OnInit, HostListener, ElementRef } from '@angular/core';
import { Router } from '@angular/router';
import { Subject } from 'rxjs/Subject';

import { PrinterService, StorageService, CardApprovalResult, NicePaymentService, CardCancelResult, SpinnerService, AlertService, Config } from '../core';
import { ReceiptService, MessageService } from '../service';
import {
    OrderInfo, TerminalInfo, Cashier, AccessToken, Account, AccountInfo, Accounts, MemberType, ProductsEntryInfo,
    OrderEntry, BonusInfo, Bonus, PaymentInfo, PaymentCapture, AmwayMonetaryPaymentInfo, PointPaymentInfo, PointType,
    CashPaymentInfo, CreditCardPaymentInfo, CreditCard, ICCard, Cash, DirectDebit, PriceInfo, PointInfo, Discount, ReceiptInfo, AmwayValue, Price
} from '../data';
import { Order } from '../data/models/order/order';
import { Utils } from '../core/utils';
import { Cart } from '../data/models/order/cart';

/**
 * 테스트 페이지
 * 설치 시 인쇄 및 Cash Drawer 테스트 및 신용카드 테스트 진행
 */
@Component({
    selector: 'pos-test',
    templateUrl: './test.component.html'
})
export class TestComponent implements OnInit {

    terminalInfo: string;
    tokenInfo: string;
    amount: string;
    installment: string;
    approvalResult: string;
    approvalNumber: string;
    approvalDateTime: string;
    cancelResult: string;
    private installcheckPrice: number;
    private creditcardMinPrice: number;
    private regexOnlyNum: RegExp = new RegExp(/^[0-9]+(\.[0-9]*){0,1}$/g); // 숫자만
    private regex: RegExp = /[^0-9]+/g;
    private specialKeys: Array<string> = ['Backspace', 'Tab', 'End', 'Home', 'Delete', 'ArrowLeft', 'ArrowRight'];
    constructor(private print: PrinterService,
        private receipt: ReceiptService,
        private storage: StorageService,
        private message: MessageService,
        private payment: NicePaymentService,
        private spinner: SpinnerService,
        private alert: AlertService,
        private config: Config,
        private router: Router,
        private element: ElementRef) { }

    ngOnInit() {
        this.installcheckPrice = this.config.getConfig('installcheckPrice', 50000);
        this.creditcardMinPrice = this.config.getConfig('creditcardMinPrice', 200);
        const terminal: TerminalInfo = this.storage.getTerminalInfo();
        if (terminal) {
            this.terminalInfo = Utils.stringify(terminal);
        }
        const token: AccessToken = this.storage.getTokenInfo();
        if (token) {
            this.tokenInfo = Utils.stringify(token);
        }
    }

    /**
     * 영수증 인쇄 테스트
     */
    public testReceiptPrint() {
        try {
            const text = this.makeReceiptData();
            if (text) {
                console.log({}, text);
                this.print.printText(text);
            }
        } catch (e) {
            this.alert.error({ message: `인쇄 중 오류가 발생하였습니다. ${e.description}` });
        }
    }

    /**
     * 돈통 열기 테스트
     */
    public testOpenDrawer() {
        try {
            this.print.openCashDrawer();
        } catch (e) {
            this.alert.error({ message: `돈통 열기 중 오류가 발생하였습니다. ${e.description}` });
        }
    }

    /**
     * 영수증 출력 데이터 생성
     */
    private makeReceiptData(): any {
        // orderSummery - START
        const terminal: TerminalInfo = this.storage.getTerminalInfo();
        const posId = terminal ? terminal.id : 'TEST POS';
        const order = new Order();
        order.code = '180-000000001';
        order.deductionNumber = '27550676';
        const amwayValue: AmwayValue = new AmwayValue();
        amwayValue.businessVolume = 36;
        amwayValue.pointValue = 36;
        amwayValue.personalBusinessVolume = 532;
        amwayValue.personalPointValue = 532;
        amwayValue.groupBusinessVolume = 1500;
        amwayValue.groupPointValue = 1500;
        order.value = amwayValue;
        const orderInfo = new OrderInfo(posId, order.code);
        const token: AccessToken = this.storage.getTokenInfo();
        const empId = token ? token.employeeId : 'Cashier';
        const empName = token ? token.employeeName : 'Cashier';
        orderInfo.setCashier = new Cashier(empId, empName);
        const account = new Accounts();
        account.uid = '7480001';
        account.name = '한국암웨이';
        account.accountTypeCode = MemberType.ABO;
        const cartInfo: Cart = new Cart();
        cartInfo.entries = [this.getOrderEntry()];
        const prc = new Price();
        prc.amwayValue = amwayValue;
        prc.currencyIso = 'KRW';
        prc.formattedValue = '10,000';
        prc.priceType = 'BUY';
        prc.value = 10000.0;
        cartInfo.totalPrice = prc;
        cartInfo.subTotal = prc;
        cartInfo.totalPriceWithTax = prc;
        cartInfo.totalDiscounts = new Price();
        cartInfo.totalTax = new Price();
        cartInfo.totalUnitCount = 1;
        const paymentCapture: PaymentCapture = new PaymentCapture();
        paymentCapture.monetaryPaymentInfo = new AmwayMonetaryPaymentInfo(1000);
        paymentCapture.pointPaymentInfo = new PointPaymentInfo(1000, PointType.BR030);
        const cc: CreditCardPaymentInfo = new CreditCardPaymentInfo(5000);
        cc.cardCompanyCode = '02';
        cc.installmentPlan = '0';
        cc.cardNumber = '457972******8003';
        cc.cardAuthNumber = '15503943';
        cc.cardAcquirerCode = '02';
        cc.cardApprovalNumber = '15503943';
        cc.cardRequestDate = '2018-07-17T15:50:13+09:00';
        cc.number = '457972******8003';
        cc.issuer = '하나카드';
        paymentCapture.ccPaymentInfo = cc;
        const ch: CashPaymentInfo = new CashPaymentInfo(3000);
        ch.setChange = 7000;
        ch.setReceived = 10000;
        paymentCapture.cashPaymentInfo = ch;
        if (account.accountTypeCode === MemberType.ABO) {
            const abo = new Account();
            abo.setAbo = new AccountInfo(account.uid, account.name);
            orderInfo.setAccount = abo;
        } else {
            const member = new Account();
            member.setAbo = new AccountInfo(account.uid, account.name);
            orderInfo.setAccount = member;
        }

        orderInfo.setType = this.message.get('default.order.type'); // '현장구매';
        orderInfo.setDate = Utils.convertDateToString(new Date());
        // orderSummary - END

        // macAndCoNum - START
        if (order.deductionNumber) {
            orderInfo.setMacAndCoNum = Utils.isEmpty(order.deductionNumber) ? this.message.get('deduction.msg') : order.deductionNumber;
        } else {
            orderInfo.setMacAndCoNum = this.message.get('deduction.msg'); // '공제조합홈페이지 확인';
        }
        // macAndCoNum - END

        // productList - START
        console.log('▷ 1.cartInfo : ' + Utils.stringify(cartInfo));
        const productList = Array<any>();
        cartInfo.entries.forEach(entry => {
            productList.push({
                'idx': (entry.entryNumber + 1).toString(),
                'skuCode': entry.product.code,
                'productName': entry.product.name,
                'price': entry.basePrice.value.toString(),
                'qty': entry.quantity.toString(),
                'totalPrice': entry.totalPrice.value.toString()
            });
        });
        const productEntryList = new Array<ProductsEntryInfo>();
        const data = productList;
        Object.assign(productEntryList, data);
        // productList - END

        // bonus - START
        let totalPV = 0;
        let totalBV = 0;
        let sumPV = 0;
        let sumBV = 0;
        let groupPV = 0;
        let groupBV = 0;
        const bonus = new BonusInfo();
        if (cartInfo.totalPrice && cartInfo.totalPrice.amwayValue) { // 장바구니 PV BV
            totalPV = cartInfo.totalPrice.amwayValue.pointValue ? cartInfo.totalPrice.amwayValue.pointValue : 0;
            totalBV = cartInfo.totalPrice.amwayValue.businessVolume ? cartInfo.totalPrice.amwayValue.businessVolume : 0;
            bonus.setOrdering = new Bonus(String(totalPV), String(totalBV));
        } else {
            bonus.setOrdering = new Bonus('0', '0');
        }
        console.log('▷ 2.order : ' + Utils.stringify(order));
        if (order.value) { // 합계 PV BV,  // 그룹 PV BV
            sumPV = order.value.personalPointValue ? order.value.personalPointValue : 0 + totalPV;
            sumBV = order.value.personalBusinessVolume ? order.value.personalBusinessVolume : 0 + totalBV;
            groupPV = order.value.groupPointValue ? order.value.groupPointValue : 0 + totalPV;
            groupBV = order.value.groupBusinessVolume ? order.value.groupBusinessVolume : 0 + totalBV;
            bonus.setSum = new Bonus(String(sumPV), String(sumBV));
            bonus.setGroup = new Bonus(String(groupPV), String(groupBV));
        } else {
            bonus.setSum = new Bonus('0', '0');
            bonus.setGroup = new Bonus('0', '0');
        }
        const point = 15000; // 포인트
        if (account.accountTypeCode === MemberType.ABO) {
            if (point > 0) {
                bonus.setAPoint = String(point);
            }
        } else if (account.accountTypeCode === MemberType.MEMBER) { // 멤버인 경우 보너스를 보여주지 않으므로 무의미함.
            if (point > 0) {
                bonus.setMemberPoint = String(point);
            }
        }
        // bonus - END

        // payments - START
        console.log('▷ 3.paymentCapture : ' + Utils.stringify(paymentCapture));
        const payment = new PaymentInfo();
        if (paymentCapture.getCcPaymentInfo) { // Credit Card
            const ccpinfo = paymentCapture.getCcPaymentInfo;
            const ccard = new CreditCard(ccpinfo.amount, ccpinfo.cardNumber, ccpinfo.issuer, ccpinfo.installmentPlan, ccpinfo.cardAuthNumber);
            payment.setCreditCard = ccard;
        }
        if (paymentCapture.getIcCardPaymentInfo) { // IC Card
            const icinfo = paymentCapture.getIcCardPaymentInfo;
            const iccard = new ICCard(icinfo.amount, icinfo.cardNumber, icinfo.issuer, icinfo.cardAuthNumber);
            payment.setICCard = iccard;
        }
        if (paymentCapture.getCashPaymentInfo) { // 현금 결제
            const cainfo = paymentCapture.getCashPaymentInfo;
            const cash = new Cash(cainfo.amount, cainfo.getReceived, cainfo.getChange, true); // 거스름돈은 보여주도록 수정
            payment.setCash = cash;
        }
        if (paymentCapture.getDirectDebitPaymentInfo) { // 자동이체
            const debitinfo = paymentCapture.getDirectDebitPaymentInfo;
            const directdebit = new DirectDebit(debitinfo.amount);
            payment.setDirectDebit = directdebit;
        }
        // payments - END

        // prices - START
        console.log('▷ 4.cartInfo : ' + Utils.stringify(cartInfo));
        let sumAmount = 0; // 합계
        let totalAmount = 0; // 결제금액
        let amountVAT = 0; // 부가세
        let amountWithoutVAT = 0; // 과세 물품
        let totalDiscount = 0; // 할인금액
        const taxValue = cartInfo.totalTax.value ? cartInfo.totalTax.value : 0;
        const subTotalPrice = cartInfo.subTotal.value ? cartInfo.subTotal.value : 0;
        const totalQty = cartInfo.totalUnitCount; // 상품수량
        // if (cartInfo.totalPriceWithTax && cartInfo.totalTax) { // 과세 물품
        //     amountWithoutVAT = cartInfo.totalPriceWithTax.value - cartInfo.totalTax.value;
        // }
        if (cartInfo.subTotal && cartInfo.totalTax) { // 과세 물품
            amountWithoutVAT = subTotalPrice - taxValue;
        }
        if (cartInfo.totalTax) { // 부가세
            amountVAT = taxValue;
        }
        // if (cartInfo.totalPriceWithTax) { // 합계
        //     sumAmount = cartInfo.totalPriceWithTax.value; // subTotalPrice;
        // }
        if (cartInfo.subTotal) { // 합계
            sumAmount = subTotalPrice;
        }
        if (cartInfo.totalPrice) { // 결제금액 - 프로모션 금액
            totalAmount = cartInfo.totalPrice.value ? cartInfo.totalPrice.value : 0;
        }
        //                          상품수량  과세 물품         부가세     합계       결제금액      할인금액         할인금액정보
        //                          totalQty  amountWithoutVAT  amountVAT  sumAmount  totalAmount   totalDiscount    discount
        const price = new PriceInfo(totalQty, amountWithoutVAT, amountVAT, sumAmount, totalAmount);
        if (paymentCapture.getPointPaymentInfo) { // 2. 포인트
            const pointinfo = paymentCapture.getPointPaymentInfo;
            let pointname = this.message.get('receipt.apoint.label'); // '포인트차감(A포인트)';
            if (account.accountTypeCode === MemberType.MEMBER) {
                pointname = this.message.get('receipt.mpoint.label'); // '포인트차감(멤버포인트)';
            }
            price.setPointInfo = new PointInfo(pointname, pointinfo.amount);
        }
        if (paymentCapture.getMonetaryPaymentInfo) { // 3. Re-Cash
            const recash = paymentCapture.getMonetaryPaymentInfo;
            price.setRecash = recash.amount;
        }
        if (cartInfo.totalDiscounts) { // 할인금액
            totalDiscount = cartInfo.totalDiscounts.value ? cartInfo.totalDiscounts.value : 0;
        }
        if (totalDiscount > 0) { // 할인금액 있을 경우만 출력 -> 프로모션 정보를 이용함.
            price.setTotalDiscount = totalDiscount; // 할인금액
            // 할인금액정보 - START
            const discount = new Discount();
            // if (order.appliedVouchers) {
            //     order.appliedVouchers.forEach(voucher => {
            //         if (voucher.appliedValue) {
            //             if (voucher.appliedValue.value > 0) {
            //                 discount.setCoupon = new DiscountInfo(voucher.name, voucher.appliedValue.value);
            //             }
            //         }
            //     });
            // }
            price.setDiscount = discount;
            // 할인금액정보 - END
        }
        // prices - END

        // 최종 영수증 데이터 구성 - START
        const receiptInfo = new ReceiptInfo();
        receiptInfo.setOrderInfo = orderInfo;
        receiptInfo.setBonus = bonus;
        receiptInfo.setPayments = payment;
        receiptInfo.setPrice = price;
        receiptInfo.setProductList = productEntryList;
        let text = '';
        if (account.accountTypeCode === MemberType.ABO) { // ABO
            text = this.receipt.aboNormal(receiptInfo);
        } else if (account.accountTypeCode === MemberType.MEMBER) {
            text = this.receipt.memberNormal(receiptInfo);
        } else {
            text = this.receipt.consumerNormal(receiptInfo);
        }
        // 최종 영수증 데이터 구성 - END
        return text;
    }

    /**
     * 주문 데이터 생성
     */
    private getOrderEntry(): any {
        const orderentry = new OrderEntry();
        const data = {
            aboBasePrice: 0.0,
            basePrice: {
                currencyIso: 'KRW',
                formattedValue: '10,000',
                priceType: 'BUY',
                value: 10000.0
            },
            dispositionCode: {
                code: 'inStock'
            },
            entryNumber: 0,
            isKitProductOrderEntry: false,
            proRatedPrice: 0.0,
            product: {
                baseOptions: [],
                code: '100099A',
                description: '',
                name: 'BODY SERIES G&H SHAMPOO',
                price: {
                    amwayValue: {
                        businessVolume: 36.0,
                        groupBusinessVolume: 1500.0,
                        groupPointValue: 1500.0,
                        personalBusinessVolume: 532.0,
                        personalPointValue: 532.0,
                        pointValue: 36.0,
                        volumeabo: 0.0
                    },
                    currencyIso: 'KRW',
                    formattedValue: '10,000',
                    priceType: 'BUY',
                    value: 10000.0
                },
                purchasable: true,
                retailPrice: {
                    currencyIso: 'KRW',
                    formattedValue: '10,000',
                    priceType: 'BUY',
                    value: 10000.0
                },
                stock: {
                    stockLevel: 420,
                    stockLevelStatus: 'inStock'
                },
                vpsCode: '1234'
            },
            quantity: 1,
            retailBasePrice: 0.0,
            serialNumbersCodes: [],
            totalPrice: {
                currencyIso: 'KRW',
                formattedValue: '10,000',
                priceType: 'BUY',
                value: 10000.0,
                amwayValue: {
                    businessVolume: 36.0,
                    pointValue: 36.0
                }
            },
            totalPriceInclTax: {
                currencyIso: 'KRW',
                formattedValue: '10,000',
                priceType: 'BUY',
                value: 10000.0
            },
            totalTax: {
                currencyIso: 'KRW',
                formattedValue: '0',
                priceType: 'BUY',
                value: 0.0
            },
            updateable: true,
            value: {
                businessVolume: 36.0,
                groupBusinessVolume: 1500.0,
                groupPointValue: 1500.0,
                personalBusinessVolume: 532.0,
                personalPointValue: 532.0,
                pointValue: 36.0,
                volumeabo: 0.0
            }
        };
        return Object.assign(orderentry, data);
    }

    /**
     * 대시보드 이동
     */
    goDashboard() {
        this.router.navigate(['/']);
    }

    /**
     * 나이스 신용카드 결제 테스트
     */
    niceApproval() {
        console.log('▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼ Nice Approval Start ▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼');
        console.log('▷ nice approval amount : ' + this.amount);
        console.log('▷ nice approval installment plan : ' + this.installment);
        if (Utils.isEmpty(this.amount) || this.amount === '0') {
            this.alert.warn({ message: '카드 결제 금액을 입력해주세요.' });
            return;
        }
        if (Utils.isEmpty(this.installment)) {
            this.alert.warn({ message: '카드 할부기간을 입력해주세요.' });
            return;
        }
        this.amount = this.amount.replace(this.regex, '');
        const nPaid = Number(this.amount);
        if (nPaid < this.creditcardMinPrice) {
            this.alert.warn({ message: `카드 결제 최소 금액은 ${this.creditcardMinPrice} 원 입니다.` });
            return;
        }
        const nInstallment = Number(this.installment);
        if (nInstallment > 0 && nPaid < this.installcheckPrice) {
            this.alert.warn({ message: '카드 할부기간을 지정할 수 없는 결제 금액입니다.' });
            return;
        }
        const resultNotifier: Subject<CardApprovalResult> = this.payment.cardApproval(this.amount, this.installment);
        resultNotifier.subscribe(
            (res: CardApprovalResult) => {
                this.approvalResult = res.stringify();
                console.log('▷ nice approval result : ' + this.approvalResult);
                this.approvalNumber = res.approvalNumber;
                this.approvalDateTime = res.approvalDateTime;
                this.spinner.hide();
                console.log('▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲ Nice Approval End ▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲');
            },
            error => {
                this.spinner.hide();
                console.log({}, `${error}`);
            },
            () => { this.spinner.hide(); }
        );
    }

    /**
     * 나이스 신용카드 결제 취소 테스트
     */
    niceCancel() {
        console.log('▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼ Nice Cancel Start ▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼');
        console.log('▷ nice cancel amount : ' + this.amount);
        console.log('▷ nice cancel approval number : ' + this.approvalNumber);
        console.log('▷ nice cancel approval date : ' + this.approvalDateTime);
        console.log('▷ nice cancel installment plan : ' + this.installment);
        const resultNotifier: Subject<CardCancelResult> = this.payment.cardCancel(this.amount, this.approvalNumber, this.approvalDateTime, this.installment);
        resultNotifier.subscribe(
            (res: CardCancelResult) => {
                this.cancelResult = res.stringify();
                console.log('▷ nice cancel result : ' + this.cancelResult);
                this.spinner.hide();
                console.log('▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲ Nice Cancel End ▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲');
            },
            error => {
                this.spinner.hide();
                console.log({}, `${error}`);
            },
            () => { this.spinner.hide(); }
        );
    }

    /**
     * 테스트 초기화
     */
    reset() {
        this.amount = '';
        this.installment = '';
        this.approvalResult = null;
        this.approvalNumber = null;
        this.approvalDateTime = null;
        this.cancelResult = null;
    }

    /**
     * INPUT에 숫자만 입력되도록 처리
     *
     * @param evt 키보드 이벤트
     */
    @HostListener('input', ['$event'])
    onKeyDown(evt: any) {
        if (this.specialKeys.indexOf(evt.key) !== -1) {
            return;
        }
        evt.target.value = evt.target.value.replace(this.regex, '');
        let current: string = this.element.nativeElement.value;
        current = current ? current : '';
        const next: string = current.concat(evt.key);
        if (next && !String(next).match(this.regexOnlyNum)) {
            evt.preventDefault();
        }
    }
}
