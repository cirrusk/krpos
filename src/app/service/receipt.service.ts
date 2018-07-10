import { Injectable } from '@angular/core';
import { ReceiptDataProvider, EscPos, StorageService, PrinterService, Logger } from '../core';
import { ReceiptTypeEnum } from '../data/receipt/receipt.enum';
import {
    Accounts, PaymentCapture, OrderInfo, Cashier, MemberType, Account, AccountInfo,
    ProductsEntryInfo, BonusInfo, Bonus, PaymentInfo, CreditCard, Cash, PriceInfo, Discount, DiscountInfo, ReceiptInfo, CreditCardPaymentInfo, AmwayPaymentInfoData
} from '../data';
import { Order, OrderList } from '../data/models/order/order';
import { Cart } from '../data/models/order/cart';
import { Utils } from '../core/utils';

@Injectable()
export class ReceiptService {

    constructor(private receitDataProvider: ReceiptDataProvider,
        private printer: PrinterService,
        private storage: StorageService,
        private logger: Logger) { }

    public aboNormal(data: any): string {
        return this.getReceipt(data, ReceiptTypeEnum.ABONormal);
    }

    public memberNormal(data: any): string {
        return this.getReceipt(data, ReceiptTypeEnum.MemberNormal);
    }

    public consumerNormal(data: any): string {
        return this.getReceipt(data, ReceiptTypeEnum.ConsumerNormal);
    }

    public orderingABOGroup(data: any): string {
        return this.getReceipt(data, ReceiptTypeEnum.OrderingABOGroup);
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

    public reissueReceipts(orderData: OrderList, cancelFlag = false): void {
        const cartInfo = new Cart();
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
            Object.assign(cartInfo, jsonCartData);

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
                this.print(order.account, cartInfo, order, paymentCapture, 'Y');
            } else {
                this.print(order.account, cartInfo, order, paymentCapture);
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
     * @param type 주문형태(default, 현장구매)
     * @param macAndCoNum 공제번호
     */
    public print(account: Accounts, cartInfo: Cart, order: Order, paymentCapture: PaymentCapture, cancelFlag?: string, type?: string, macAndCoNum?: string): boolean {
        let rtn = true;
        const posId = this.storage.getTerminalInfo().id;
        const token = this.storage.getTokenInfo();

        // orderSummery - START
        // 주문형태: {{orderInfo.type}}
        // ABO정보: {{orderInfo.account.abo.id}} {{orderInfo.account.abo.name}}
        // 구매자정보: {{orderInfo.account.member.id}} {{orderInfo.account.member.name}}
        // 구매일자: {{orderInfo.date}}
        // POS번호: {{orderInfo.posId}}
        // 캐셔정보: {{orderInfo.cashier.firstName}}
        // 주문번호: {{orderInfo.number}}
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
        orderInfo.setType = type || '현장구매';
        orderInfo.setDate = Utils.convertDateToString(new Date());
        // orderSummary - END

        // macAndCoNum - START
        // 공제번호 : {{orderInfo.macAndCoNum}}
        if (macAndCoNum) {
            orderInfo.setMacAndCoNum = macAndCoNum;
        } else {
            orderInfo.setMacAndCoNum = ''; // order.deductionNumber 없을 경우 --> 공제조합홈페이지 확인
        }
        // macAndCoNum - END

        if (cancelFlag === 'Y') {
            orderInfo.setCancelFlag = cancelFlag;
        }

        // productList - START
        const productList = Array<any>();
        let totalPV = 0;
        let totalBV = 0;
        const strTotalDiscount = null;
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
        // {{bonusDataHelper 'PV:' bonus.ordering.PV 'BV:' bonus.ordering.BV}}
        // {{bonusDataHelper 'PV SUM:' bonus.sum.PV 'BV SUM:' bonus.sum.BV}}
        // {{bonusDataHelper 'GROUP PV:' bonus.group.PV 'GROUP BV:' bonus.group.BV}}
        // 잔여 A 포인트 : {{aPoint}}
        // 잔여 Member 포인트 : {{memberPoint}}
        if (cartInfo.totalPrice && cartInfo.totalPrice.amwayValue) {
            totalPV = cartInfo.totalPrice.amwayValue.pointValue;
            totalBV = cartInfo.totalPrice.amwayValue.businessVolume;
        }
        const bonus = new BonusInfo();
        bonus.setOrdering = new Bonus(String(totalPV), String(totalBV));

        bonus.setSum = new Bonus(String(totalPV), String(totalBV));
        bonus.setGroup = new Bonus('그룹 PV합', '그룹 BV합');
        const point = 0;
        if (account.accountTypeCode === MemberType.ABO) {
            bonus.setAPoint = point <= 0 ? '' : String(point);
        } else if (account.accountTypeCode === MemberType.MEMBER) {
            bonus.setMemberPoint = point <= 0 ? '' : String(point);
        }
        // bonus - END

        // payments - START
        // [현금결제] {{priceLocaleHelper payments.cash.amount}}
        // 받은금액 {{priceLocaleHelper payments.cash.detail.received}}
        // 거스름돈 {{priceLocaleHelper payments.cash.detail.changes}}
        // payments.cash.cashreceipt
        // [신용카드결제] {{priceLocaleHelper payments.creditcard.amount}}
        // 카드번호: {{payments.creditcard.detail.cardnumber}}
        // 할부: {{payments.creditcard.detail.installment}} (승인번호: {{payments.creditcard.detail.authNumber}})
        const payment = new PaymentInfo();
        if (paymentCapture.getCcPaymentInfo) {
            const ccpinfo = paymentCapture.getCcPaymentInfo;
            const ccard = new CreditCard(ccpinfo.getAmount, ccpinfo.getCardNumber, ccpinfo.getInstallmentPlan, ccpinfo.getCardAuthNumber);
            payment.setCreditCard = ccard;
        }
        if (paymentCapture.getCashPaymentInfo) {
            const cainfo = paymentCapture.getCashPaymentInfo;
            const cash = new Cash(cainfo.amount, cainfo.getReceived, cainfo.getChange, cainfo.getCashReceipt);
            payment.setCash = cash;
        }
        // payments - END

        // prices - START
        // {{priceFormatHelper '상품수량' price.totalQty}}
        // {{priceFormatHelper '과세 물품' price.amountWithoutVAT}}
        // {{priceFormatHelper '부 가 세' price.amountVAT}}
        // {{priceFormatHelper '합 계' price.totalAmount}}
        // {{priceFormatHelper '할인금액' price.discount.total}}
        // {{priceFormatHelper price.discount.detail.coupon.name price.discount.detail.coupon.amount}}
        // {{priceFormatHelper price.discount.detail.point.name price.discount.detail.point.amount}}
        // {{priceFormatHelper 'Recash' price.discount.detail.recash.amount}}
        // {{priceFormatHelper '결제금액' price.finalAmount}}
        let sumAmount = 0; // 합계
        let totalAmount = 0; // 결제금액
        let amountVAT = 0; // 부가세
        let amountWithoutVAT = 0; // 과세 물품
        let totalDiscount = 0; // 할인금액
        const totalQty = cartInfo.totalUnitCount; // 상품수량
        // if (cartInfo.totalPriceWithTax && cartInfo.totalTax) { // 과세 물품
        //     amountWithoutVAT = cartInfo.totalPriceWithTax.value - cartInfo.totalTax.value;
        // }
        if (cartInfo.subTotal && cartInfo.totalTax) { // 과세 물품
            amountWithoutVAT = cartInfo.subTotal.value - cartInfo.totalTax.value;
        }
        if (cartInfo.totalTax) { // 부가세
            amountVAT = cartInfo.totalTax.value;
        }
        // if (cartInfo.totalPriceWithTax) { // 합계
        //     sumAmount = cartInfo.totalPriceWithTax.value; // cartInfo.subTotal.value;
        // }
        if (cartInfo.subTotal) { // 합계
            sumAmount = cartInfo.subTotal.value;
        }
        if (cartInfo.totalPrice) { // 결제금액
            totalAmount = cartInfo.totalPrice.value;
        }
        //                          상품수량   과세 물품          부가세     합계       결제금액       할인금액         할인금액정보
        //                          totalQty  amountWithoutVAT  amountVAT  sumAmount  totalAmount   totalDiscount    discount
        const price = new PriceInfo(totalQty, amountWithoutVAT, amountVAT, sumAmount, totalAmount);
        if (cartInfo.totalDiscounts) { // 할인금액
            totalDiscount = cartInfo.totalDiscounts.value;
        }
        if (totalDiscount > 0) { // 할인금액 있을 경우만 출력
            price.setTotalDiscount = totalDiscount; // 할인금액
            // 할인금액정보 START
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
                let pointname = '포인트차감(A포인트)';
                if (account.accountTypeCode === MemberType.MEMBER) {
                    pointname = '포인트차감(멤버포인트)';
                }
                discount.setPoint = new DiscountInfo(pointname, pointinfo.getAmount);
            }
            if (paymentCapture.getMonetaryPaymentInfo) { // 3. Re-Cash
                const recash = paymentCapture.getMonetaryPaymentInfo;
                discount.setRecash = new DiscountInfo('Recash', recash.amount);
            }
            price.setDiscount = discount;
            // 할인금액정보 END
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
        if (account.accountTypeCode === 'group') { // Group
            text = this.orderingABOGroup(receiptInfo);
        } else if (account.accountTypeCode === MemberType.ABO) { // ABO
            text = this.aboNormal(receiptInfo);
        } else if (account.accountTypeCode === MemberType.MEMBER) {
            text = this.memberNormal(receiptInfo);
        } else {
            text = this.consumerNormal(receiptInfo);
        }
        // 최종 영수증 데이터 구성 - END

        try {
            this.printer.printText(text);
        } catch (e) {
            this.logger.set('receipt.service', `${e.description}`).error();
            rtn = false;
        }
        return rtn;
    }
}
