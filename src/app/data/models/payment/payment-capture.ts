import { CCMemberType, CCPaymentType } from './payment.enum';

export class CapturePaymentInfo {
    paymentModeCode: string;
    capturePaymentInfoData: PaymentCapture;
    receiptInfoData: ReceiptInfoData;
    public set setPaymentModeCode(paymentModeCode: string) {
        this.paymentModeCode = paymentModeCode;
    }
    public get getPaymentModeCode(): string {
        return this.paymentModeCode;
    }
    public set setCapturePaymentInfoData(capturePaymentInfoData: PaymentCapture) {
        this.capturePaymentInfoData = capturePaymentInfoData;
    }
    public get getCapturePaymentInfoData(): PaymentCapture {
        return this.capturePaymentInfoData;
    }
    public set setReceiptInfoData(receiptInfoData: ReceiptInfoData) {
        this.receiptInfoData = receiptInfoData;
    }
}

/**
 * Payment Capture
 * 신용카드          ; creditcard         ; CreditCardPaymentInfo
 * 현금결제         ; cash               ; AmwayCashPaymentInfo
 * 자동이체          ; directdebit        ; DirectDebitPaymentInfo
 * 쿠폰결제(price 영역에 포함)         ; creditvoucher      ; VoucherPaymentInfo
 * 포인트(price 영역에 포함)            ; point              ; PointPaymentInfo
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

    public get getCode(): string {
        return this.code;
    }

    public get getName(): string {
        return this.name;
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
    protected referenceNumber: string;
    amount: number; // 지불금액, double
    currency: CurrencyData;
    protected status: string;
    protected comments: string;
    paymentMode: PaymentModeData;
    protected paymentProvider: string;
    protected saveInAccount: boolean;
    protected alias: string;
    protected transactionCode: string;
    protected providerInterfaceIdentifier: string;
    protected date: Date;
    paymentInfoLine1: string;
    paymentInfoLine2: string;
    paymentInfoLine3: string;
    paymentInfoLine4: string;
    protected issuer: string; // 은행/카드사 BankInfoModel 은행코드
    abstractOrderCode: string;
    paymentStatusCode: string;
    mainPayment: boolean;
    statusDetails: string;
    statusCode: string;
    referenceItem: string;
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

    public set setPaymentInfoLine1(paymentInfoLine1: string) {
        this.paymentInfoLine1 = paymentInfoLine1;
    }
    public set setPaymentInfoLine2(paymentInfoLine2: string) {
        this.paymentInfoLine2 = paymentInfoLine2;
    }
    public set setPaymentInfoLine3(paymentInfoLine3: string) {
        this.paymentInfoLine3 = paymentInfoLine3;
    }
    public set setPaymentInfoLine4(paymentInfoLine4: string) {
        this.paymentInfoLine4 = paymentInfoLine4;
    }

    public get getPaymentInfoLine1(): string {
        return this.paymentInfoLine1;
    }
    public get getPaymentInfoLine2(): string {
        return this.paymentInfoLine2;
    }
    public get getPaymentInfoLine3(): string {
        return this.paymentInfoLine3;
    }
    public get getPaymentInfoLine4(): string {
        return this.paymentInfoLine4;
    }
    public get getPaymentMode(): PaymentModeData {
        return this.paymentMode;
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
    maskedcardnumber: string;
    protected validthru: string;
    protected validfrom: string;
    cardtype: string;
    protected subscriptionID: string;
    paymentType: string; // 카드 결제 유형 CreditCardPaymentType GENERAL, SAFE
    memberType: string; // 카드 회원 유형 CreditCardMemberType(일반결제인 경우만 생성) PERSONAL, LEGAL
    cardNumber: string;
    cardAuthNumber: string;
    protected validToMonth: string; // 유효기간 종료 월 필수값 임의설정
    protected validToYear: string; // 유효기간 종료 년 필수값 임의설정
    cardCompanyCode: string;
    cardPassword: string;
    installmentPlan: string; // 할부기간 InstallmentPlanModel 0 - 일시불
    transactionId: string;
    cardTransactionId: string;
    cardAcquirerCode: string;
    cardApprovalNumber: string;
    cardMerchantNumber: string;
    cardRequestDate: string; // Date; // 기존에 Date 형이었으나 Hybris 존송 시 ConvertException 발생으로 문자열로 바꿈.
    ccOwner: string; // 신용 카드 소유자
    number: string; // 카드번호(필수값(카드번호 뒤 4자리))
    paymentSignature: string; // 5만원 이상 결제 시 sign data
    protected type: string; // 카드 타입 CreditCardType없는 경우 임의설정(필수값)
    protected validFromMonth: string; // 유효기간 시작 월 필수값 임의설정
    protected validFromYear: string; // 유효기간 시작 년 필수값 임의설정
    protected xPayResponseData: any; // 안심결제
    vanType: string; // VanType

    public set setCardAcquirerCode(cardAcquirerCode: string) {
        this.cardAcquirerCode = cardAcquirerCode;
    }
    public set setCardMerchantNumber(cardMerchantNumber: string) {
        this.cardMerchantNumber = cardMerchantNumber;
    }
    public set setNumber(number: string) {
        this.number = number;
    }
    public set setTransactionId(transactionId: string) {
        this.transactionId = transactionId;
        this.transactionid = transactionId;
    }
    public set setCardType(cardtype: string) {
        this.cardtype = cardtype;
    }
    public set setPaymentType(paymentType: string) {
        this.paymentType = paymentType || CCPaymentType.GENERAL;
    }
    public set setCardCompanyCode(cardCompanyCode: string) {
        this.cardCompanyCode = cardCompanyCode;
    }
    public set setInstallmentPlan(installmentPlan: string) {
        this.installmentPlan = installmentPlan;
    }
    public get getInstallmentPlan(): string {
        return this.installmentPlan;
    }
    public set setMemberType(memberType: string) {
        this.memberType = memberType || CCMemberType.PERSONAL;
    }
    public set setCardNumber(cardNumber: string) {
        this.cardNumber = cardNumber;
    }
    public set setVanType(vanType: string) {
        this.vanType = vanType;
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
    public set setCardApprovalNumber(cardApprovalNumber: string) {
        this.cardApprovalNumber = cardApprovalNumber;
    }
    public get getCardApprovalNumber(): string {
        return this.cardApprovalNumber;
    }
    public set setCardRequestDate(cardRequestDate: string) { // Hybris에 맞는 포맷으로 전송위해 string 변환
        this.cardRequestDate = cardRequestDate;
    }
    public get getCardRequestDate(): string {
        return this.cardRequestDate;
    }
    public set setCardTransactionId(cardTransactionId: string) {
        this.cardTransactionId = cardTransactionId;
    }
    public set setPaymentSignature(paymentSignature: string) {
        this.paymentSignature = paymentSignature;
    }
    public get getPaymentSignature(): string {
        return this.paymentSignature;
    }
    constructor(amount: number, paymentType?: string, cardCompanyCode?: string, installmentPlan?: string,
        memberType?: string, cardNumber?: string, cardPassword?: string, cardAuthNumber?: string,
        validToMonth?: string, validToYear?: string, vanType?: string) {
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
        this.vanType = vanType;
    }
}

/** 현금/수표 결제 */
export class CashPaymentInfo extends AmwayPaymentInfoData {
    cashType: string; // 현금유형 CashType (CASH, CHECK)
    received: string; // 받은금액
    change: string;   // 거스름돈
    cashreceipt: boolean; // 현금영수증 출력여부
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
export class ICCardPaymentInfo extends CreditCardPaymentInfo {
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

export class ReceiptInfoData {
    receiptTypeCode: string;
    receiptNumberType: string;
    businessEntityRegistrationInfoData: BusinessEntityRegistrationInfoData;
    constructor(number: string, receiptTypeCode = 'TAX', receiptNumberType = 'BRN') {
        this.receiptTypeCode = receiptTypeCode;
        this.receiptNumberType = receiptNumberType;
        this.businessEntityRegistrationInfoData = new BusinessEntityRegistrationInfoData(number);
    }
}

export class BusinessEntityRegistrationInfoData {
    number: string;
    constructor(number: string) {
        this.number = number;
    }
}

export class PaymentView {
    cardamount: number;
    cardinstallment: string;
    cashamount: number;
    cashchange: number;
    pointamount: number;
    recashamount: number;
    receivedamount: number;
    directdebitamount: number;
    discount: number;
    pv: number;
    bv: number;
    pvsum: number;
    bvsum: number;
    pvgroup: number;
    bvgroup: number;
    totalprice: number;
    public set setCardamount(cardamount: number) {
        this.cardamount = cardamount;
    }
    public set setCardInstallment(cardinstallment: string) {
        this.cardinstallment = cardinstallment;
    }
    public set setCashamount(cashamount: number) {
        this.cashamount = cashamount;
    }
    public set setCashchange(cashchange: number) {
        this.cashchange = cashchange;
    }
    public set setPointamount(pointamount: number) {
        this.pointamount = pointamount;
    }
    public set setRecashamount(recashamount: number) {
        this.recashamount = recashamount;
    }
    public set setReceivedamount(receivedamount: number) {
        this.receivedamount = receivedamount;
    }
    public set setDirectdebitamount(directdebitamount: number) {
        this.directdebitamount = directdebitamount;
    }
    public set setDiscount(discount: number) {
        this.discount = discount;
    }
    public set setPv(pv: number) {
        this.pv = pv;
    }
    public set setBv(bv: number) {
        this.bv = bv;
    }
    public set setPvsum(pvsum: number) {
        this.pvsum = pvsum;
    }
    public set setBvsum(bvsum: number) {
        this.bvsum = bvsum;
    }
    public set setPvgroup(pvgroup: number) {
        this.pvgroup = pvgroup;
    }
    public set setBvgroup(bvgroup: number) {
        this.bvgroup = bvgroup;
    }
    public set setTotalprice(totalprice: number) {
        this.totalprice = totalprice;
    }
}
