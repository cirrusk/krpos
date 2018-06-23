
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

    public set setCcPaymentInfo(ccPaymentInfo: CreditCardPaymentInfo) {
        this.ccPaymentInfo = ccPaymentInfo;
    }

    public set setCashPaymentInfo(cashPaymentInfo: CashPaymentInfo) {
        this.cashPaymentInfo = cashPaymentInfo;
    }

    public set setDirectDebitPaymentInfo(directDebitPaymentInfo: DirectDebitPaymentInfo) {
        this.directDebitPaymentInfo = directDebitPaymentInfo;
    }

    public set setVoucherPaymentInfo(voucherPaymentInfo: VoucherPaymentInfo) {
        this.voucherPaymentInfo = voucherPaymentInfo;
    }

    public set setPointPaymentInfo(pointPaymentInfo: PointPaymentInfo) {
        this.pointPaymentInfo = pointPaymentInfo;
    }

    public set setMonetaryPaymentInfo(monetaryPaymentInfo: AmwayMonetaryPaymentInfo) {
        this.monetaryPaymentInfo = monetaryPaymentInfo;
    }

    public set setIcCardPaymentInfo(icCardPaymentInfo: ICCardPaymentInfo) {
        this.icCardPaymentInfo = icCardPaymentInfo;
    }
}

export class CurrencyData {
    isocode: string;
    name: string;
    active: boolean;
    symbol: string;
    public set setIsoCode(isocode: string) {
        this.isocode = isocode;
    }
    public set setActive(active: boolean) {
        this.active = active;
    }
    public set setSymbol(symbol: string) {
        this.symbol = symbol;
    }
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
    public set setCode(code: string) {
        this.code = code;
    }
    public set setDiscription(description: string) {
        this.description = description;
    }
    public set setActive(active: boolean) {
        this.active = active;
    }
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
    issuer: string; // 은행/카드사 BankInfoModel 은행코드
    constructor(amount: number, paymentmodecode: string, paymentProvider?: string, status?: string) {
        this.amount = amount;
        this.paymentProvider = paymentProvider || 'akl';
        this.status = status || 'ACCEPTED';
        if (paymentmodecode) {
            this.paymentMode = new PaymentModeData(paymentmodecode);
        }
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
    cardNumber: string;
    cardAuthNumber: string;
    validToMonth: string; // 유효기간 종료 월 필수값 임의설정
    validToYear: string; // 유효기간 종료 년 필수값 임의설정
    cardCompanyCode: string;
    cardPassword: string;
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
    xPayResponseData: any; // 안심결제
    public set setPaymentType(paymentType: string) {
        this.paymentType = paymentType;
    }
    public set setCardCompayCode(cardCompanyCode: string) {
        this.cardCompanyCode = cardCompanyCode;
    }
    public set setInstallmentPlan(installmentPlan: string) {
        this.installmentPlan = installmentPlan;
    }
    public set setMemberType(memberType: string) {
        this.memberType = memberType;
    }
    public set setCardNumber(cardNumber: string) {
        this.cardNumber = cardNumber;
    }
    public set setCardPassword(cardPassword: string) {
        this.cardPassword = cardPassword;
    }
    public set setCardAuthNumber(cardAuthNumber: string) {
        this.cardAuthNumber = cardAuthNumber;
    }
    public set setValidToMonth(validToMonth: string) {
        this.validToMonth = validToMonth;
    }
    public set setValidToYear(validToYear: string) {
        this.validToYear = validToYear;
    }
    constructor(amount: number, paymentType?: string, cardCompanyCode?: string, installmentPlan?: string,
        memberType?: string, cardNumber?: string, cardPassword?: string, cardAuthNumber?: string,
        validToMonth?: string, validToYear?: string) {
        super(amount, 'creditcard');
        this.paymentType = paymentType || 'GENERAL';
        this.cardCompanyCode = cardCompanyCode;
        this.installmentPlan = installmentPlan || '0';
        this.memberType = memberType || 'PERSONAL';
        this.cardNumber = cardNumber;
        this.cardPassword = cardPassword;
        this.cardAuthNumber = cardAuthNumber;
        this.validToMonth = validToMonth;
        this.validToYear = validToYear;
    }
}

/** 현금/수표 결제 */
export class CashPaymentInfo extends AmwayPaymentInfoData {
    cashType: string; // 현금유형 CashType (CASH, CHECK)
    public set setCashType(cashType: string) {
        this.cashType = cashType;
    }
    constructor(amount: number, cashType: string, paymentProvider?: string, status?: string) {
        super(amount, 'cash', paymentProvider, status);
        this.cashType = cashType;
    }
}

/** 자동이체 */
export class DirectDebitPaymentInfo extends AmwayPaymentInfoData {
    accountNumber: string; // 계좌번호
    baOwner: string; // 예금주명
    bankIDNumber: string;
    bank: string; // 은행 명
    public set setAccountNumber(accountNumber: string) {
        this.accountNumber = accountNumber;
    }
    public set setBaOwner(baOwner: string) {
        this.baOwner = baOwner;
    }
    public set setBankIDNumber(bankIDNumber: string) {
        this.bankIDNumber = bankIDNumber;
    }
    public set setBank(bank: string) {
        this.bank = bank;
    }
    constructor(amount: number, accountNumber: string, baOwner: string, bankIDNumber: string, bank: string) {
        super(amount, 'directdebit');
        this.accountNumber = accountNumber;
        this.baOwner = baOwner;
        this.bankIDNumber = bankIDNumber;
        this.bank = bank;
    }
}

/** 포인트결제 */
export class PointPaymentInfo extends AmwayPaymentInfoData {
    pointType: string; // BalanceReferenceTypeModel (BR030 - 전환포인트, BR033 - 멤버포인트)
    public set setPointType(pointType: string) {
        this.pointType = pointType;
    }
    constructor(amount: number, pointType: string) {
        super(amount, 'point');
        this.pointType = pointType;
    }
}

/** 미수금결제 */
export class AmwayMonetaryPaymentInfo extends AmwayPaymentInfoData {
    constructor(amount: number) {
        super(amount, 'arCredit');
    }
}

/** 현금IC카드결제 */
export class ICCardPaymentInfo extends AmwayPaymentInfoData {
    accountNumber: string; // 계좌번호
    baOwner: string; // 예금주명
    bankIDNumber: string;
    bank: string; // 은행 명
    public set setAccountNumber(accountNumber: string) {
        this.accountNumber = accountNumber;
    }
    public set setBaOwner(baOwner: string) {
        this.baOwner = baOwner;
    }
    public set setBankIDNumber(bankIDNumber: string) {
        this.bankIDNumber = bankIDNumber;
    }
    public set setBank(bank: string) {
        this.bank = bank;
    }
    constructor(amount: number, accountNumber: string, baOwner: string, bankIDNumber: string, bank: string) {
        super(amount, 'cashiccard');
        this.accountNumber = accountNumber;
        this.baOwner = baOwner;
        this.bankIDNumber = bankIDNumber;
        this.bank = bank;
    }
}

/** 쿠폰결제 */
export class VoucherPaymentInfo extends AmwayPaymentInfoData {
    constructor(amount: number) {
        super(amount, 'creditvoucher');
    }
}



