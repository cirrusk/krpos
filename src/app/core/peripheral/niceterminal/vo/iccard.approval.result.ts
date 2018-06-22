import { WebsocketResult } from "./result.common";

export class ICCardApprovalResult extends WebsocketResult {
    // 서비스 코드
    private _serviceCode: string;

    // 승인 여부
    private _isApproved: boolean;

    // 거절 시 메시지 1
    private _rejectMsg1: string;

    // 거절 시 메시지 2
    private _rejectMsg2: string;

    // 승인 일시(YYMMDDhhmmss)
    private _approvalDateTime: string;

    // 판매 금액
    private _amount: string;

    // 부가세
    private _vat: string;

    // 봉사료
    private _serviceFee: string;

    // 승인번호
    private _approvalNumber: string;

    // 발급사 코드 (사용 X)
    private _issuerCode: string;

    // 매입사 코드 (사용 X)
    private _merchantCode: string;

    // 발급사명 (사용 X)
    private _issuerName: string;

    // 매입사명 (사용 X)
    private _merchantName: string;

    // 가맹점 번호 (사용 X)
    private _salerNumber: string;

    // 마스킹된 카드 번호
    private _maskedCardNumber: string;

    // 할부 (사용 X)
    private _installment: string;

    // 처리번호
    private _processingNumber: string;

    // CAT ID
    private _catId: string;

    // 발급기관명
    private _issuerOrgName: string;

    // 매입기관명
    private _merchantOrgName: string;

    // 발급기관코드
    private _issuerOrgCode: string;

    // 매입기관코드
    private _merchantOrgCode: string;

    // 시스템 구분코드
    private _distinguishCode: string;

    // 거래 고유번호
    private _trxNumber: string;

    // 트랙3 정보
    private _track3Info: string;

    // IC 카드 일련번호
    private _iccardSerialNumber: string;

    // 잔액
    private _accountBalance: string;

    // 마스킹 된 출금계좌 번호
    private _maskedBankAccount: string;

    // 거래일자 (YYYYmmdd)
    private _trxDate: string;

    // 수취조회 거래고유번호
    private _inquiryTrxNumber: string;

    // 서명 정보 (사용 X)
    private _signData: string;
    
    constructor() {
        super();
    }

    /**
     * Getter serviceCode
     * @return {string}
     */
	public get serviceCode(): string {
		return this._serviceCode;
	}

    /**
     * Getter isApproved
     * @return {boolean}
     */
	public get isApproved(): boolean {
		return this._isApproved;
	}

    /**
     * Getter rejectMsg1
     * @return {string}
     */
	public get rejectMsg1(): string {
		return this._rejectMsg1;
	}

    /**
     * Getter rejectMsg2
     * @return {string}
     */
	public get rejectMsg2(): string {
		return this._rejectMsg2;
	}

    /**
     * Getter approvalDateTime
     * @return {string}
     */
	public get approvalDateTime(): string {
		return this._approvalDateTime;
	}

    /**
     * Getter amount
     * @return {string}
     */
	public get amount(): string {
		return this._amount;
	}

    /**
     * Getter vat
     * @return {string}
     */
	public get vat(): string {
		return this._vat;
	}

    /**
     * Getter serviceFee
     * @return {string}
     */
	public get serviceFee(): string {
		return this._serviceFee;
	}

    /**
     * Getter approvalNumber
     * @return {string}
     */
	public get approvalNumber(): string {
		return this._approvalNumber;
	}

    /**
     * Getter issuerCode
     * @return {string}
     * @deprecated
     */
	public get issuerCode(): string {
		return this._issuerCode;
	}

    /**
     * Getter merchantCode
     * @return {string}
     * @deprecated
     */
	public get merchantCode(): string {
		return this._merchantCode;
	}

    /**
     * Getter issuerName
     * @return {string}
     * @deprecated
     */
	public get issuerName(): string {
		return this._issuerName;
	}

    /**
     * Getter merchantName
     * @return {string}
     * @deprecated
     */
	public get merchantName(): string {
		return this._merchantName;
	}

    /**
     * Getter salerNumber
     * @return {string}
     * @deprecated
     */
	public get salerNumber(): string {
		return this._salerNumber;
	}

    /**
     * Getter installment
     * @return {string}
     * @deprecated
     */
	public get installment(): string {
		return this._installment;
	}

    /**
     * Getter catId
     * @return {string}
     */
	public get catId(): string {
		return this._catId;
	}

    /**
     * Getter issuerOrgName
     * @return {string}
     */
	public get issuerOrgName(): string {
		return this._issuerOrgName;
	}

    /**
     * Getter merchantOrgName
     * @return {string}
     */
	public get merchantOrgName(): string {
		return this._merchantOrgName;
	}

    /**
     * Getter distinguishCode
     * @return {string}
     */
	public get distinguishCode(): string {
		return this._distinguishCode;
	}

    /**
     * Getter trxNumber
     * @return {string}
     */
	public get trxNumber(): string {
		return this._trxNumber;
	}

    /**
     * Getter track3Info
     * @return {string}
     */
	public get track3Info(): string {
		return this._track3Info;
	}

    /**
     * Getter iccardSerialNumber
     * @return {string}
     */
	public get iccardSerialNumber(): string {
		return this._iccardSerialNumber;
	}

    /**
     * Getter accountBalance
     * @return {string}
     */
	public get accountBalance(): string {
		return this._accountBalance;
	}


    /**
     * Getter trxDate
     * @return {string}
     */
	public get trxDate(): string {
		return this._trxDate;
	}

    /**
     * Getter inquiryTrxNumber
     * @return {string}
     */
	public get inquiryTrxNumber(): string {
		return this._inquiryTrxNumber;
	}

    /**
     * Getter signData
     * @return {string}
     * @deprecated
     */
	public get signData(): string {
		return this._signData;
	}

    /**
     * Setter serviceCode
     * @param {string} value
     */
	public set serviceCode(value: string) {
		this._serviceCode = value;
	}

    /**
     * Setter isApproved
     * @param {boolean} value
     */
	public set isApproved(value: boolean) {
		this._isApproved = value;
	}

    /**
     * Setter rejectMsg1
     * @param {string} value
     */
	public set rejectMsg1(value: string) {
		this._rejectMsg1 = value;
	}

    /**
     * Setter rejectMsg2
     * @param {string} value
     */
	public set rejectMsg2(value: string) {
		this._rejectMsg2 = value;
	}

    /**
     * Setter approvalDateTime
     * @param {string} value
     */
	public set approvalDateTime(value: string) {
		this._approvalDateTime = value;
	}

    /**
     * Setter amount
     * @param {string} value
     */
	public set amount(value: string) {
		this._amount = value;
	}

    /**
     * Setter vat
     * @param {string} value
     */
	public set vat(value: string) {
		this._vat = value;
	}

    /**
     * Setter serviceFee
     * @param {string} value
     */
	public set serviceFee(value: string) {
		this._serviceFee = value;
	}

    /**
     * Setter approvalNumber
     * @param {string} value
     */
	public set approvalNumber(value: string) {
		this._approvalNumber = value;
	}

    /**
     * Setter issuerCode
     * @param {string} value
     * @deprecated
     */
	public set issuerCode(value: string) {
		this._issuerCode = value;
	}

    /**
     * Setter merchantCode
     * @param {string} value
     * @deprecated
     */
	public set merchantCode(value: string) {
		this._merchantCode = value;
	}

    /**
     * Setter issuerName
     * @param {string} value
     * @deprecated
     */
	public set issuerName(value: string) {
		this._issuerName = value;
	}

    /**
     * Setter merchantName
     * @param {string} value
     * @deprecated
     */
	public set merchantName(value: string) {
		this._merchantName = value;
	}

    /**
     * Setter salerNumber
     * @param {string} value
     * @deprecated
     */
	public set salerNumber(value: string) {
		this._salerNumber = value;
	}

    /**
     * Setter installment
     * @param {string} value
     * @deprecated
     */
	public set installment(value: string) {
		this._installment = value;
	}

    /**
     * Setter catId
     * @param {string} value
     */
	public set catId(value: string) {
		this._catId = value;
	}

    /**
     * Setter issuerOrgName
     * @param {string} value
     */
	public set issuerOrgName(value: string) {
		this._issuerOrgName = value;
	}

    /**
     * Setter merchantOrgName
     * @param {string} value
     */
	public set merchantOrgName(value: string) {
		this._merchantOrgName = value;
	}

    /**
     * Setter distinguishCode
     * @param {string} value
     */
	public set distinguishCode(value: string) {
		this._distinguishCode = value;
	}

    /**
     * Setter trxNumber
     * @param {string} value
     */
	public set trxNumber(value: string) {
		this._trxNumber = value;
	}

    /**
     * Setter track3Info
     * @param {string} value
     */
	public set track3Info(value: string) {
		this._track3Info = value;
	}

    /**
     * Setter iccardSerialNumber
     * @param {string} value
     */
	public set iccardSerialNumber(value: string) {
		this._iccardSerialNumber = value;
	}

    /**
     * Setter accountBalance
     * @param {string} value
     */
	public set accountBalance(value: string) {
		this._accountBalance = value;
	}

    /**
     * Setter trxDate
     * @param {string} value
     */
	public set trxDate(value: string) {
		this._trxDate = value;
	}

    /**
     * Setter inquiryTrxNumber
     * @param {string} value
     */
	public set inquiryTrxNumber(value: string) {
		this._inquiryTrxNumber = value;
	}

    /**
     * Setter signData
     * @param {string} value
     * @deprecated
     */
	public set signData(value: string) {
		this._signData = value;
    }

    /**
     * Getter issuerOrgCode
     * @return {string}
     */
	public get issuerOrgCode(): string {
		return this._issuerOrgCode;
	}

    /**
     * Getter merchantOrgCode
     * @return {string}
     */
	public get merchantOrgCode(): string {
		return this._merchantOrgCode;
	}

    /**
     * Setter issuerOrgCode
     * @param {string} value
     */
	public set issuerOrgCode(value: string) {
		this._issuerOrgCode = value;
	}

    /**
     * Setter merchantOrgCode
     * @param {string} value
     */
	public set merchantOrgCode(value: string) {
		this._merchantOrgCode = value;
    }

    /**
     * Getter maskedCardNumber
     * @return {string}
     */
	public get maskedCardNumber(): string {
		return this._maskedCardNumber;
	}

    /**
     * Getter maskedBankAccount
     * @return {string}
     */
	public get maskedBankAccount(): string {
		return this._maskedBankAccount;
	}

    /**
     * Setter maskedCardNumber
     * @param {string} value
     */
	public set maskedCardNumber(value: string) {
		this._maskedCardNumber = value;
	}

    /**
     * Setter maskedBankAccount
     * @param {string} value
     */
	public set maskedBankAccount(value: string) {
		this._maskedBankAccount = value;
	}

    /**
     * Getter processingNumber
     * @return {string}
     */
	public get processingNumber(): string {
		return this._processingNumber;
	}

    /**
     * Setter processingNumber
     * @param {string} value
     */
	public set processingNumber(value: string) {
		this._processingNumber = value;
	}

    public stringify() {
        return JSON.stringify(this);
    }
}