
/**
 * Payment Capture
 *
 * <code>
 * let pc = new PaymentCapture();
 * pc.ccPayment = {...}
 * pc.cashPayment = {...}
 * </code>
 */
export class PaymentCapture {
    ccPaymentInfo: CreditCardPaymentInfo; /** 신용카드 */
    cashPaymentInfo: CashPaymentInfo; /** 현금결제 */
    directDebitPaymentInfo: DirectDebitPaymentInfo; /** 자동이체 */
    voucherPaymentInfo: VoucherPaymentInfo; /** 쿠폰결제 */
    pointPaymentInfo: PointPaymentInfo; /** 포인트결제 */
    monetaryPaymentInfo: AmwayMonetaryPaymentInfo; /** 미수금결제(AR) */
    icCardPaymentInfo: ICCardPaymentInfo; /** 현금IC카드결제 */
    /** 체크카드결제 */

    public set ccPayment(ccPaymentInfo: CreditCardPaymentInfo) {
        this.ccPaymentInfo = ccPaymentInfo;
    }

    public set cashPayment(cashPaymentInfo: CashPaymentInfo) {
        this.cashPaymentInfo = cashPaymentInfo;
    }

    public set directDebitPayment(directDebitPaymentInfo: DirectDebitPaymentInfo) {
        this.directDebitPaymentInfo = directDebitPaymentInfo;
    }

    public set voucherPayment(voucherPaymentInfo: VoucherPaymentInfo) {
        this.voucherPaymentInfo = voucherPaymentInfo;
    }

    public set pointPayment(pointPaymentInfo: PointPaymentInfo) {
        this.pointPaymentInfo = pointPaymentInfo;
    }

    public set monetaryPayment(monetaryPaymentInfo: AmwayMonetaryPaymentInfo) {
        this.monetaryPaymentInfo = monetaryPaymentInfo;
    }

    public set icCardPayment(icCardPaymentInfo: ICCardPaymentInfo) {
        this.icCardPaymentInfo = icCardPaymentInfo;
    }
}

export class CurrencyData {
    isocode: string;
    name: string;
    active: boolean;
    symbol: string;
}

export class PaymentModeData {
    code: string;
    name: string;
    description: string;
    active: boolean;
}

/**
 * Payment Info 공통
 */
export class AmwayPaymentInfoData {
    requesttoken: string;
    transactionid: string;
    transactionCode: string;
    referenceNumber: string;
    amount: number;
    currency: CurrencyData;
    status: string;
    comments: string;
    paymentMode: PaymentModeData;
    paymentProvider: string;
    saveInAccount: boolean;
    alias: string;
    providerInterfaceIdentifier: string;
    date: Date;
    paymentInfoLine1: string;
    paymentInfoLine2: string;
    paymentInfoLine3: string;
    paymentInfoLine4: string;
}

/** 신용카드 */
export class CreditCardPaymentInfo extends AmwayPaymentInfoData {
    maskedcardnumber: string;
    validthru: string;
    validfrom: string;
    cardtype: string;
    subscriptionID: string;
    paymentType: string;
    memberType: string;
    cardCompanyCode: string;
    cardNumber: string;
    cardPassword: string;
    cardAuthNumber: string;
    validToMonth: string;
    validToYear: string;
    installmentPlan: string;
}

/** 현금결제 */
export class CashPaymentInfo extends AmwayPaymentInfoData {

}

/** 자동이체 */
export class DirectDebitPaymentInfo extends AmwayPaymentInfoData {

}

/** 쿠폰결제 */
export class VoucherPaymentInfo extends AmwayPaymentInfoData {

}

/** 포인트결제 */
export class PointPaymentInfo extends AmwayPaymentInfoData {

}

/** 미수금결제 */
export class AmwayMonetaryPaymentInfo extends AmwayPaymentInfoData {

}

/** 현금IC카드결제 */
export class ICCardPaymentInfo extends AmwayPaymentInfoData {

}

