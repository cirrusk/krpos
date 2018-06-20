
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
    constructor(isocode?: string, name?: string, active?: boolean, symbol?: string) {
        this.isocode = isocode || 'KRW';
        this.name = name;
        this.active = active || false;
        this.symbol = symbol;
    }
}

export class PaymentModeData {
    code: string;
    name: string;
    description: string;
    active: boolean;
    constructor(code: string, name?: string, description?: string, active?: boolean) {
        this.code = code;
        this.name = name;
        this.description = description;
        this.active = active || false;
    }
}

/**
 * Payment Info 공통
 */
export class AmwayPaymentInfoData {
    requesttoken: string;
    transactionid: string; // 거래 번호
    transactionCode: string;
    referenceNumber: string;
    amount: number; // 지불금액
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
    issuer: any; // 은행/카드사 BankInfoModel 은행코드
    constructor(amount: number, paymentProvider?: string, status?: string) {
        this.amount = amount;
        this.paymentProvider = paymentProvider || 'akl';
        this.status = status || 'ACCEPTED';
    }
}

/** 신용카드 */
export class CreditCardPaymentInfo extends AmwayPaymentInfoData {
    maskedcardnumber: string;
    validthru: string;
    validfrom: string;
    cardtype: string;
    subscriptionID: string;
    paymentType: string; // 카드 결제 유형 CreditCardPaymentType GENERAL, SAFE
    memberType: string; // 카드 회원 유형 CreditCardMemberType(일반결제인 경우만 생성) PERSONAL, LEGAL
    cardCompanyCode: string;
    cardNumber: string;
    cardPassword: string;
    cardAuthNumber: string;
    installmentPlan: string; // 할부기간 InstallmentPlanModel 0 - 일시불
    cardTransactionId: string;
    cardAcquirerCode: string;
    cardApprovalNumber: string;
    cardMerchantNumber: string;
    cardRequestDate: Date;
    ccOwner: string; // 신용 카드 소유자
    number: string; // 카드번호(필수값(카드번호 뒤 4자리))
    type: string; // 카드 타입 CreditCardType없는 경우 임의설정(필수값)
    validFromMonth: string; // 유효기간 시작 월 필수값 임의설정
    validFromYear: string; // 유효기간 시작 년 필수값 임의설정
    validToMonth: string; // 유효기간 종료 월 필수값 임의설정
    validToYear: string; // 유효기간 종료 년 필수값 임의설정
    constructor(amount: number, transactionid: string, ccOwner: string, issuer: string, number: string,
        paymentType?: string, memberType?: string, type?: string, installmentPlan?: string) {
        super(amount);
        this.transactionid = transactionid;
        this.ccOwner = ccOwner;
        this.issuer = issuer; // 은행/카드사 B - 국민카드
        this.number = number;
        this.paymentType = paymentType || 'GENERAL';
        this.memberType = memberType || 'PERSONAL';
        this.type = type || 'visa';
        this.installmentPlan = installmentPlan || '0';
    }
}

/** 현금결제 */
export class CashPaymentInfo extends AmwayPaymentInfoData {
    cashType: string; // 현금유형 CashType (CASH, CHECK)
    constructor(cashType: string, amount: number, paymentProvider?: string, status?: string) {
        super(amount, paymentProvider, status);
        this.cashType = cashType;
    }
}

/** 자동이체 */
export class DirectDebitPaymentInfo extends AmwayPaymentInfoData {
    accountNumber: string; // 계좌번호
    baOwner: string; // 예금주명
    bankIDNumber: string;
    bank: string; // 은행 명
    constructor(amount: number, accountNumber: string, baOwner: string, bank: string) {
        super(amount);
        this.accountNumber = accountNumber;
        this.baOwner = baOwner;
        this.bank = bank;
    }
}

/** 쿠폰결제 */
export class VoucherPaymentInfo extends AmwayPaymentInfoData {
    constructor(amount: number) {
        super(amount);
    }
}

/** 포인트결제 */
export class PointPaymentInfo extends AmwayPaymentInfoData {
    pointType: string; // BalanceReferenceTypeModel (BR030 - 전환포인트, BR033 - 멤버포인트)
    constructor(pointType: string, amount: number) {
        super(amount);
        this.pointType = pointType;
    }
}

/** 미수금결제 */
export class AmwayMonetaryPaymentInfo extends AmwayPaymentInfoData {
    constructor(amount: number) {
        super(amount);
    }
}

/** 현금IC카드결제 */
export class ICCardPaymentInfo extends AmwayPaymentInfoData {
    accountNumber: string; // 계좌번호
    baOwner: string; // 예금주명
    bankIDNumber: string;
    bank: string; // 은행 명
    constructor(amount: number, accountNumber: string, baOwner: string, bank: string) {
        super(amount);
        this.accountNumber = accountNumber;
        this.baOwner = baOwner;
        this.bank = bank;
    }
}

