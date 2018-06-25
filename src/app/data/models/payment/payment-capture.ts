/**
 * Payment Capture
 * 신용카드          ; creditcard         ; CreditCardPaymentInfo
 * 현금결제         ; cash               ; AmwayCashPaymentInfo
 * 자동이체          ; directdebit        ; DirectDebitPaymentInfo
 * 쿠폰결제         ; creditvoucher      ; VoucherPaymentInfo
 * 포인트            ; point              ; PointPaymentInfo
 * 미수금결제       ; arCredit           ; AmwayMonetaryPaymentInfo
 * 현금/IC카드결제  ; cashiccard         ; ICCardPaymentInfo
 *
 * <code>
 * let pc = new PaymentCapture();
 * pc.ccPayment = {...}
 * pc.cashPayment = {...}
 * </code>
 */
export class PaymentCapture {
    protected ccPaymentInfo: CreditCardPaymentInfo; /** 신용카드 */
    protected cashPaymentInfo: CashPaymentInfo; /** 현금결제 */
    protected directDebitPaymentInfo: DirectDebitPaymentInfo; /** 자동이체 */
    protected voucherPaymentInfo: VoucherPaymentInfo; /** 쿠폰결제 */
    protected pointPaymentInfo: PointPaymentInfo; /** 포인트결제 */
    protected monetaryPaymentInfo: AmwayMonetaryPaymentInfo; /** 미수금결제(AR) */
    protected icCardPaymentInfo: ICCardPaymentInfo; /** 현금IC카드결제 */

    public set setCcPaymentInfo(ccPaymentInfo: CreditCardPaymentInfo) {
        this.ccPaymentInfo = ccPaymentInfo;
    }

    public get getCcPaymentInfo(): CreditCardPaymentInfo {
        return this.ccPaymentInfo;
    }

    public set setCashPaymentInfo(cashPaymentInfo: CashPaymentInfo) {
        this.cashPaymentInfo = cashPaymentInfo;
    }

    public get getCashPaymentInfo(): CashPaymentInfo {
        return this.cashPaymentInfo;
    }

    public set setDirectDebitPaymentInfo(directDebitPaymentInfo: DirectDebitPaymentInfo) {
        this.directDebitPaymentInfo = directDebitPaymentInfo;
    }

    public get getDirectDebitPaymentInfo(): DirectDebitPaymentInfo {
        return this.directDebitPaymentInfo;
    }

    public set setVoucherPaymentInfo(voucherPaymentInfo: VoucherPaymentInfo) {
        this.voucherPaymentInfo = voucherPaymentInfo;
    }

    public get getVoucherPaymentInfo(): VoucherPaymentInfo {
        return this.voucherPaymentInfo;
    }

    public set setPointPaymentInfo(pointPaymentInfo: PointPaymentInfo) {
        this.pointPaymentInfo = pointPaymentInfo;
    }

    public get getPointPaymentInfo(): PointPaymentInfo {
        return this.pointPaymentInfo;
    }

    public set setMonetaryPaymentInfo(monetaryPaymentInfo: AmwayMonetaryPaymentInfo) {
        this.monetaryPaymentInfo = monetaryPaymentInfo;
    }

    public get getMonetaryPaymentInfo(): AmwayMonetaryPaymentInfo {
        return this.monetaryPaymentInfo;
    }

    public set setIcCardPaymentInfo(icCardPaymentInfo: ICCardPaymentInfo) {
        this.icCardPaymentInfo = icCardPaymentInfo;
    }

    public get getIcCardPaymentInfo(): ICCardPaymentInfo {
        return this.icCardPaymentInfo;
    }
}

export class CurrencyData {
    protected isocode: string;
    protected name: string;
    protected active: boolean;
    protected symbol: string;
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
    protected code: string;
    protected name: string;
    protected description: string;
    protected active: boolean;
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
    protected requesttoken: string;
    protected transactionid: string; // 거래 번호
    protected transactionCode: string;
    protected referenceNumber: string;
    protected amount: number; // 지불금액
    protected currency: CurrencyData;
    protected status: string;
    protected comments: string;
    protected paymentMode: PaymentModeData;
    protected paymentProvider: string;
    protected saveInAccount: boolean;
    protected alias: string;
    protected providerInterfaceIdentifier: string;
    protected date: Date;
    protected paymentInfoLine1: string;
    protected paymentInfoLine2: string;
    protected paymentInfoLine3: string;
    protected paymentInfoLine4: string;
    protected issuer: string; // 은행/카드사 BankInfoModel 은행코드
    public set setAmount(amount: number) {
        this.amount = amount;
    }
    public get getAmount(): number {
        return this.amount;
    }
    public set setPaymentModeData(paymentMode: PaymentModeData) {
        this.paymentMode = paymentMode;
    }
    public set setCurrencyData(currency: CurrencyData) {
        this.currency = currency;
    }
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
    protected maskedcardnumber: string;
    protected validthru: string;
    protected validfrom: string;
    protected cardtype: string;
    protected subscriptionID: string;
    protected paymentType: string; // 카드 결제 유형 CreditCardPaymentType GENERAL, SAFE
    protected memberType: string; // 카드 회원 유형 CreditCardMemberType(일반결제인 경우만 생성) PERSONAL, LEGAL
    protected cardNumber: string;
    protected cardAuthNumber: string;
    protected validToMonth: string; // 유효기간 종료 월 필수값 임의설정
    protected validToYear: string; // 유효기간 종료 년 필수값 임의설정
    protected cardCompanyCode: string;
    protected cardPassword: string;
    protected installmentPlan: string; // 할부기간 InstallmentPlanModel 0 - 일시불
    protected cardTransactionId: string;
    protected cardAcquirerCode: string;
    protected cardApprovalNumber: string;
    protected cardMerchantNumber: string;
    protected cardRequestDate: Date;
    protected ccOwner: string; // 신용 카드 소유자
    protected number: string; // 카드번호(필수값(카드번호 뒤 4자리))
    protected type: string; // 카드 타입 CreditCardType없는 경우 임의설정(필수값)
    protected validFromMonth: string; // 유효기간 시작 월 필수값 임의설정
    protected validFromYear: string; // 유효기간 시작 년 필수값 임의설정
    protected xPayResponseData: any; // 안심결제
    public set setPaymentType(paymentType: string) {
        this.paymentType = paymentType;
    }
    public set setCardCompayCode(cardCompanyCode: string) {
        this.cardCompanyCode = cardCompanyCode;
    }
    public set setInstallmentPlan(installmentPlan: string) {
        this.installmentPlan = installmentPlan;
    }
    public get getInstallmentPlan(): string {
        return this.installmentPlan;
    }
    public set setMemberType(memberType: string) {
        this.memberType = memberType;
    }
    public set setCardNumber(cardNumber: string) {
        this.cardNumber = cardNumber;
    }
    public get getCardNumber(): string {
        return this.cardNumber;
    }
    public set setCardPassword(cardPassword: string) {
        this.cardPassword = cardPassword;
    }
    public set setCardAuthNumber(cardAuthNumber: string) {
        this.cardAuthNumber = cardAuthNumber;
    }
    public get getCardAuthNumber(): string {
        return this.cardAuthNumber;
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
    protected cashType: string; // 현금유형 CashType (CASH, CHECK)
    protected received: string; // 받은금액
    protected change: string;   // 거스름돈
    protected cashreceipt: boolean; // 현금영수증 출력여부
    public set setCashType(cashType: string) {
        this.cashType = cashType;
    }
    public set setReceived(received: number) {
        this.received = String(received);
    }
    public get getReceived(): string {
        return this.received;
    }
    public set setChange(change: number) {
        this.change = String(change);
    }
    public get getChange(): string {
        return this.change;
    }
    public set setCashReceipt(cashreceipt: boolean) {
        this.cashreceipt = cashreceipt;
    }
    public get getCashReceipt(): boolean {
        return this.cashreceipt;
    }
    constructor(amount: number, cashType?: string, paymentProvider?: string, status?: string) {
        super(amount, 'cash', paymentProvider, status);
        this.cashType = cashType;
    }
}

/** 자동이체 */
export class DirectDebitPaymentInfo extends AmwayPaymentInfoData {
    protected accountNumber: string; // 계좌번호
    protected baOwner: string; // 예금주명
    protected bankIDNumber: string;
    protected bank: string; // 은행 명
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
    constructor(amount: number, accountNumber?: string, baOwner?: string, bankIDNumber?: string, bank?: string) {
        super(amount, 'directdebit');
        this.accountNumber = accountNumber;
        this.baOwner = baOwner;
        this.bankIDNumber = bankIDNumber;
        this.bank = bank;
    }
}

/** 포인트결제 */
export class PointPaymentInfo extends AmwayPaymentInfoData {
    protected pointType: string; // BalanceReferenceTypeModel (BR030 - 전환포인트, BR033 - 멤버포인트)
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
    protected accountNumber: string; // 계좌번호
    protected baOwner: string; // 예금주명
    protected bankIDNumber: string;
    protected bank: string; // 은행 명
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
    constructor(amount: number, accountNumber?: string, baOwner?: string, bankIDNumber?: string, bank?: string) {
        super(amount, 'cashiccard');
        this.accountNumber = accountNumber;
        this.baOwner = baOwner;
        this.bankIDNumber = bankIDNumber;
        this.bank = bank;
    }
}

/** 쿠폰결제 */
export class VoucherPaymentInfo extends AmwayPaymentInfoData {
    name: string;
    public set setName(name: string) {
        this.name = name;
    }
    public get getName(): string {
        return this.name;
    }
    constructor(amount: number) {
        super(amount, 'creditvoucher');
    }
}



