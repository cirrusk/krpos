import { Injectable, OnDestroy } from '@angular/core';
import { Subscription } from 'rxjs/Subscription';
import { Observable } from 'rxjs/Observable';

import { ReceiptDataProvider, EscPos, StorageService, PrinterService, Logger } from '../core';
import { ReceiptTypeEnum } from '../data/receipt/receipt.enum';
import {
    Accounts, PaymentCapture, OrderInfo, Cashier, MemberType, Account, AccountInfo,
    ProductsEntryInfo, BonusInfo, Bonus, PaymentInfo, CreditCard, Cash, PriceInfo,
    Discount, DiscountInfo, ReceiptInfo, ICCard, AccessToken, OrderEntry, Balance
} from '../data';
import { Order, OrderList } from '../data/models/order/order';
import { Cart } from '../data/models/order/cart';
import { Utils } from '../core/utils';
import { MessageService } from '../message/message.service';
import { OrderService } from './order/order.service';
import { PaymentService } from './payment/payment.service';

@Injectable()
export class ReceiptService implements OnDestroy {

    private groupOrderTotalCount;
    private printResult = true;
    private paymentsubscription: Subscription;
    private ordersubscription: Subscription;
    constructor(private receitDataProvider: ReceiptDataProvider,
        private orders: OrderService,
        private payment: PaymentService,
        private order: OrderService,
        private printer: PrinterService,
        private storage: StorageService,
        private message: MessageService,
        private logger: Logger) { }

    ngOnDestroy() {
        // if (this.paymentsubscription) { this.paymentsubscription.unsubscribe(); }
        this.dispose();
    }

    /**
     * Life Cycle hook 이 Service에서 implement 되지 않아
     * Component Level 에서 처리
     * 향후 버전업 시 implement 될 수 도 있음.
     */
    dispose() {
        if (this.paymentsubscription) { this.paymentsubscription.unsubscribe(); }
        if (this.ordersubscription) { this.ordersubscription.unsubscribe(); }
    }

    public aboNormal(data: any): string {
        return this.getReceipt(data, ReceiptTypeEnum.ABONormal);
    }

    public memberNormal(data: any): string {
        return this.getReceipt(data, ReceiptTypeEnum.MemberNormal);
    }

    public consumerNormal(data: any): string {
        return this.getReceipt(data, ReceiptTypeEnum.ConsumerNormal);
    }

    public groupOrderSummary(data: any): string {
        return this.getReceipt(data, ReceiptTypeEnum.GroupSummary);
    }

    private getReceipt(data: any, format: ReceiptTypeEnum): string {
        const templateList: Array<string> = this.receitDataProvider.getReceiptTemplates(format);

        let retText = '';

        templateList.forEach((templateName) => {
            const templateText = this.receitDataProvider.getXmlTemplate(templateName);
            const parsed = EscPos.fillData(templateText, data);
            const isCompiled = this.receitDataProvider.isPrecompiled(templateName);

            if (isCompiled) {
                retText += EscPos.unescapeNull(parsed);
            } else {
                const transformed = EscPos.escPosCommand(parsed);
                retText += transformed;
            }
        });

        return EscPos.unescapeLeadingSpace(retText);
    }

    /**
     * 영수증 재출력
     *
     * @param orderData 주문 정보
     * @param cancelFlag 취소여부
     */
    public reissueReceipts(orderData: OrderList, cancelFlag = false): void {
        let cartInfo = new Cart();
        const paymentCapture = new PaymentCapture();
        let jsonPaymentData = {};

        orderData.orders.forEach(order => {
            const jsonCartData = {
                'user': order.user,
                'entries': order.entries,
                'totalPrice': order.totalPrice,
                'subTotal': order.subTotal,
                'totalUnitCount': order.totalUnitCount,
                'totalPriceWithTax': order.totalPriceWithTax,
                'totalTax': order.totalTax,
                'totalDiscounts': order.totalDiscounts
            };
            cartInfo = jsonCartData as Cart;

            order.paymentDetails.paymentInfos.forEach(paymentInfo => {
                switch (paymentInfo.paymentMode.code) {
                    case 'creditcard': { jsonPaymentData = { 'ccPaymentInfo': paymentInfo }; } break;
                    case 'cashiccard': { jsonPaymentData = { 'icCardPaymentInfo': paymentInfo }; } break;
                    case 'cash': { jsonPaymentData = { 'cashPaymentInfo': paymentInfo }; } break;
                    case 'directdebit': { jsonPaymentData = { 'directDebitPaymentInfo': paymentInfo }; } break;
                    case 'arCredit': { jsonPaymentData = { 'monetaryPaymentInfo': paymentInfo }; } break;
                    case 'point': { jsonPaymentData = { 'pointPaymentInfo': paymentInfo }; } break;
                    case 'creditvoucher': { jsonPaymentData = { 'voucherPaymentInfo': paymentInfo }; } break;
                    default: { jsonPaymentData = {}; } break;
                }
                Object.assign(paymentCapture, jsonPaymentData);
                jsonPaymentData = {};
            });

            if (cancelFlag) {
                this.print(order.account, cartInfo, order, paymentCapture, 'Y', null, null, null, true);
            } else {
                this.print(order.account, cartInfo, order, paymentCapture, null, null, null, null, true);
            }
        });

    }

    /**
     * 그룹주문 영수증 출력
     *
     * @param account 회원 정보
     * @param order 주문정보
     * @param paymentCapture Payment Capture 정보
     * @param cancelFlag 취소 여부
     */
    public groupPrint(account: Accounts, order: Order, paymentCapture: PaymentCapture, cancelFlag = false) {

        this.order.groupOrder(order.user.uid, order.code).subscribe(result => {
            if (result) {
                const groupOrder = result;
                this.groupOrderTotalCount = (groupOrder.orderList.length).toString();
                groupOrder.orderList.forEach((gOrder, index) => {
                    // setTimeout(() => {
                    let gPaymentCapture = new PaymentCapture();
                    const gJsonCartData = {
                        'user': { 'uid': gOrder.volumeABOAccount.uid, 'name': gOrder.volumeABOAccount.name },
                        'entries': gOrder.entries,
                        'totalPrice': gOrder.totalPrice,
                        'subTotal': gOrder.subTotal,
                        'totalUnitCount': gOrder.totalUnitCount,
                        'totalPriceWithTax': gOrder.totalPriceWithTax,
                        'totalTax': gOrder.totalTax,
                        'totalDiscounts': gOrder.totalDiscounts
                    };

                    const gCartInfo = gJsonCartData as Cart;
                    const gOrderDetail = gOrder as Order;

                    if (index === 0) {
                        gPaymentCapture = paymentCapture;
                    }

                    const gAccount = gOrder.volumeABOAccount;
                    const jsonData = { 'parties': [{ 'uid': gOrder.volumeABOAccount.uid, 'name': gOrder.volumeABOAccount.name }] };

                    Object.assign(gAccount, jsonData);
                    const groupInfo = (index + 1).toString() + '/' + this.groupOrderTotalCount;

                    if (cancelFlag) {
                        this.print(gAccount, gCartInfo, gOrderDetail, gPaymentCapture, 'Y', groupInfo, null, null, false, true);
                    } else {
                        this.print(gAccount, gCartInfo, gOrderDetail, gPaymentCapture, 'N', groupInfo, null, null, false, true);
                    }
                    // }, 1000);
                });
            }
        });
    }

    /**
     * 영수증 출력
     *
     * @param account 회원정보
     * @param cartInfo 카트정보
     * @param order 주문정보
     * @param paymentCapture 결제캡쳐 정보
     * @param point 회원 포인트 정보(항상 출력 전에 새로 조회해야함.)
     * @param cancelFlag 취소 문구 삽입 (Y : 취소, N : 승인)
     * @param groupInfo 그룹주문 페이지 정보
     * @param type 주문형태(default, 현장구매)
     * @param macAndCoNum 공제번호
     * @param reIssue 영수증 재발행 여부
     */
    public print(account: Accounts, cartInfo: Cart, order: Order, paymentCapture: PaymentCapture, cancelFlag?: string,
        groupInfo?: string, type?: string, macAndCoNum?: string, reIssue?: boolean, isGroupOrder?: boolean): boolean {
        let rtn = true;
        const printInfo = {
            order: order, account: account, cartInfo: cartInfo, type: type,
            macAndCoNum: macAndCoNum, cancelFlag: cancelFlag,
            paymentCapture: paymentCapture, groupInfo: groupInfo
        };
        // 현재 포인트를 조회 후에 프린트 정보 설정
        const uid = account.parties ? account.parties[0].uid : account.uid;
        if (isGroupOrder) { // 그룹주문의 경우 포인트 조회 subscribe 시 async 로 인해 출력 순서 꼬임.
            Object.assign(printInfo, { point: 0 });
            rtn = this.makeTextAndPrint(printInfo);
            if (rtn && reIssue) { this.issueReceipt(account, order); }
        } else {
            this.paymentsubscription = this.payment.getBalance(uid).subscribe(
                result => {
                    Object.assign(printInfo, { point: result.amount ? result.amount : 0 });
                    rtn = this.makeTextAndPrint(printInfo);
                    if (rtn && reIssue) { this.issueReceipt(account, order); }
                },
                error => { // 포인트 조회 에러 발생 시 정상적으로 출력해야 함.
                    this.logger.set('receipt.service', `${error}`).error();
                    Object.assign(printInfo, { point: 0 });
                    rtn = this.makeTextAndPrint(printInfo);
                    if (rtn && reIssue) { this.issueReceipt(account, order); }
                });
        }
        return rtn;
    }

    /**
     * 영수증 출력 정보를 기록
     *
     * @param account 회원정보
     * @param order 주문정보
     */
    private issueReceipt(account: Accounts, order: Order) {
        const uid = account.parties ? account.parties[0].uid : account.uid;
        this.ordersubscription = this.orders.issueReceipt(uid, order.code).subscribe(receipt => {
            this.logger.set('receipt.service', `receipt issued invoice number : ${receipt.result}`).debug();
        }, error => {
            this.logger.set('receipt.service', `receipt issued : ${error}`).error();
        });
    }

    /**
     * 영수증 출력 정보를 이용하여 영수증 문구를 생성하고 출력
     *
     * @param printInfo 영수증 출력 정보
     */
    private makeTextAndPrint(printInfo: any): boolean {
        let rtn = true;
        // 영수증 출력 파라미터 설정 - START
        const order: Order = printInfo.order;
        const account: Accounts = printInfo.account;
        const cartInfo: Cart = printInfo.cartInfo;
        const type: string = printInfo.type;
        const macAndCoNum: string = printInfo.macAndCoNum;
        const cancelFlag: string = printInfo.cancelFlag;
        const paymentCapture: PaymentCapture = printInfo.paymentCapture;
        const pointValue: number = printInfo.point;
        const posId: string = this.storage.getTerminalInfo().id;
        const token: AccessToken = this.storage.getTokenInfo();
        const groupInfo: string = printInfo.groupInfo;
        // 영수증 출력 파라미터 설정 - END

        // orderSummery - START
        const orderInfo = new OrderInfo(posId, order.code);
        orderInfo.setCashier = new Cashier(token.employeeId, token.employeeName);
        if (account.accountTypeCode === MemberType.ABO) {
            const abo = new Account();
            abo.setAbo = new AccountInfo(cartInfo.user.uid, cartInfo.user.name);
            orderInfo.setAccount = abo;
        } else {
            const member = new Account();
            member.setAbo = new AccountInfo(cartInfo.user.uid, cartInfo.user.name);
            orderInfo.setAccount = member;
        }

        if (groupInfo) {
            orderInfo.setGroupInfo = groupInfo;
        }

        orderInfo.setType = type || this.message.get('default.order.type'); // '현장구매';
        orderInfo.setDate = Utils.convertDateToString(new Date());
        // orderSummary - END

        // macAndCoNum - START
        if (macAndCoNum) {
            orderInfo.setMacAndCoNum = macAndCoNum;
        } else {
            if (order.deductionNumber) { // order.deductionNumber
                orderInfo.setMacAndCoNum = Utils.isEmpty(order.deductionNumber) ? this.message.get('deduction.msg') : order.deductionNumber;
            } else {
                orderInfo.setMacAndCoNum = this.message.get('deduction.msg'); // '공제조합홈페이지 확인';
            }
        }
        // macAndCoNum - END

        // 영수증 취소 플래그 - START
        if (cancelFlag === 'Y') {
            orderInfo.setCancelFlag = cancelFlag;
        }
        // 영수증 취소 플래그 - END

        // productList - START
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
        }
        if (cartInfo.value) { // 합계 PV BV
            sumPV = cartInfo.value.pointValue ? cartInfo.value.pointValue : 0;
            sumBV = cartInfo.value.businessVolume ? cartInfo.value.businessVolume : 0;
            bonus.setSum = new Bonus(String(sumPV), String(sumBV));
        }
        if (cartInfo.volumeABOAccount) { // 그룹 PV BV
            groupPV = cartInfo.volumeABOAccount.totalPV ? cartInfo.volumeABOAccount.totalPV : 0;
            groupBV = cartInfo.volumeABOAccount.totalBV ? cartInfo.volumeABOAccount.totalBV : 0;
            bonus.setGroup = new Bonus(String(groupPV), String(groupBV));
        }
        const point = pointValue ? pointValue : 0; // 포인트
        if (account.accountTypeCode === MemberType.ABO) {
            if (point > 0) {
                bonus.setAPoint = String(point);
            }
        } else if (account.accountTypeCode === MemberType.MEMBER) {
            if (point > 0) {
                bonus.setMemberPoint = String(point);
            }
        }
        // bonus - END

        // payments - START
        let isOnlyCash = true;
        const payment = new PaymentInfo();
        if (paymentCapture.getCcPaymentInfo) { // Credit Card
            const ccpinfo = paymentCapture.getCcPaymentInfo;
            const ccard = new CreditCard(ccpinfo.getAmount, ccpinfo.getCardNumber, ccpinfo.getInstallmentPlan, ccpinfo.getCardAuthNumber);
            payment.setCreditCard = ccard;
            isOnlyCash = false; // 카드와 현금 복합결제 시 출력부에 내신금액 거스름돈 제외
        }
        if (paymentCapture.getIcCardPaymentInfo) { // IC Card
            const icinfo = paymentCapture.getIcCardPaymentInfo;
            const iccard = new ICCard(icinfo.amount, icinfo.getCardNumber, icinfo.getCardAuthNumber);
            payment.setICCard = iccard;
        }
        if (paymentCapture.getCashPaymentInfo) { // 현금 결제
            const cainfo = paymentCapture.getCashPaymentInfo;
            const cash = new Cash(cainfo.amount, cainfo.getReceived, cainfo.getChange, isOnlyCash);
            payment.setCash = cash;
        }
        // payments - END

        // prices - START
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
        if (cartInfo.totalPrice) { // 결제금액
            totalAmount = cartInfo.totalPrice.value ? cartInfo.totalPrice.value : 0;
        }
        //                          상품수량   과세 물품          부가세     합계       결제금액       할인금액         할인금액정보
        //                          totalQty  amountWithoutVAT  amountVAT  sumAmount  totalAmount   totalDiscount    discount
        const price = new PriceInfo(totalQty, amountWithoutVAT, amountVAT, sumAmount, totalAmount);
        if (cartInfo.totalDiscounts) { // 할인금액
            totalDiscount = cartInfo.totalDiscounts.value ? cartInfo.totalDiscounts.value : 0;
        }
        if (totalDiscount > 0) { // 할인금액 있을 경우만 출력
            price.setTotalDiscount = totalDiscount; // 할인금액
            // 할인금액정보 - START
            const discount = new Discount();
            if (order.appliedVouchers) { // 1. 쿠폰
                order.appliedVouchers.forEach(voucher => {
                    if (voucher.appliedValue) {
                        if (voucher.appliedValue.value > 0) {
                            discount.setCoupon = new DiscountInfo(voucher.name, voucher.appliedValue.value);
                        }
                    }
                });
            }
            if (paymentCapture.getPointPaymentInfo) { // 2. 포인트
                const pointinfo = paymentCapture.getPointPaymentInfo;
                let pointname = this.message.get('receipt.apoint.label'); // '포인트차감(A포인트)';
                if (account.accountTypeCode === MemberType.MEMBER) {
                    pointname = this.message.get('receipt.mpoint.label'); // '포인트차감(멤버포인트)';
                }
                discount.setPoint = new DiscountInfo(pointname, pointinfo.getAmount);
            }
            if (paymentCapture.getMonetaryPaymentInfo) { // 3. Re-Cash
                const recash = paymentCapture.getMonetaryPaymentInfo;
                discount.setRecash = new DiscountInfo('Recash', recash.amount);
            }
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
            text = this.aboNormal(receiptInfo);
        } else if (account.accountTypeCode === MemberType.MEMBER) {
            text = this.memberNormal(receiptInfo);
        } else {
            text = this.consumerNormal(receiptInfo);
        }
        // 최종 영수증 데이터 구성 - END

        // 영수증 출력 - START
        try {
            this.printer.printText(text);
        } catch (e) {
            this.logger.set('receipt.service', `${e.description}`).error();
            rtn = false;
        }
        // 영수증 출력 - END
        return rtn;
    }

    /**
     * 그룹주문 요약 영수증 출력
     *
     * @param orderEntry 주문 엔트리 정보
     * @param type 주문유형 정보
     */
    makeTextAndGroupSummaryPrint(orderEntry: Array<OrderEntry>, type: string): boolean {
        let rtn = true;
        // 영수증 출력 파라미터 설정 - START
        const posId: string = this.storage.getTerminalInfo().id;
        // 영수증 출력 파라미터 설정 - END

        // orderSummery - START
        const orderInfo = new OrderInfo(posId, '0', type);
        orderInfo.setDate = Utils.convertDateToString(new Date());
        // orderSummary - END

        // productList - START
        const productList = Array<any>();
        let totalQty = 0;
        let totalPrice = 0;
        orderEntry.forEach((entry, index) => {
            productList.push({
                'idx': (index + 1).toString(),
                'skuCode': entry.product.code,
                'productName': entry.product.name,
                'price': entry.basePrice.value.toString(),
                'qty': entry.quantity.toString(),
                'totalPrice': entry.totalPrice.value.toString()
            });
            totalQty = totalQty + entry.quantity;
            totalPrice = totalPrice + (entry.basePrice.value * entry.quantity);
        });
        const productEntryList = new Array<ProductsEntryInfo>();
        const data = productList;
        Object.assign(productEntryList, data);
        // productList - END

        // prices - START
        const sumAmount = 0; // 합계
        const totalAmount = totalPrice; // 결제금액
        const amountVAT = 0; // 부가세
        const amountWithoutVAT = 0; // 과세 물품

        //                          상품수량   과세 물품          부가세     합계       결제금액       할인금액         할인금액정보
        //                          totalQty  amountWithoutVAT  amountVAT  sumAmount  totalAmount   totalDiscount    discount
        const price = new PriceInfo(totalQty, amountWithoutVAT, amountVAT, sumAmount, totalAmount);
        // prices - END

        // 최종 영수증 데이터 구성 - START
        const receiptInfo = new ReceiptInfo();
        receiptInfo.setOrderInfo = orderInfo;
        receiptInfo.setPrice = price;
        receiptInfo.setProductList = productEntryList;
        const text = this.groupOrderSummary(receiptInfo);
        // 최종 영수증 데이터 구성 - END

        // 영수증 출력 - START
        try {
            this.printer.printText(text);
        } catch (e) {
            this.logger.set('receipt.service', `${e.description}`).error();
            rtn = false;
        }
        // 영수증 출력 - END
        return rtn;
    }
}
