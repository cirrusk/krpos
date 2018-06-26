import { WebsocketResult } from './result.common';

export class CardApprovalResult extends WebsocketResult {
    // 서비스 코드
    private _serviceCode: string;

    // 승인거래 여부
    private _approved: boolean;

    // 결과 메시지 1 (승인: 거래 고유번호, 거절 : 거절메시지 1)
    private _resultMsg1: string;

    // 결과 메시지 2 (거절 : 거절메시지 2)
    private _resultMsg2: string;

    // 승인일시 (YYMMDDhhmmss)
    private _approvalDateTime: string;

    // 판매금액
    private _totalAmount: string;

    // 부가세
    private _vat: string;

    // 승인번호
    private _approvalNumber: string;

    // 발급사 코드 (VAN 또는 카드)
    private _issuerCode: string;

    // 발급사 명
    private _issuerName: string;

    // 매입사 코드
    private _acquireCode: string;

    // 매입사 명
    private _acquireName: string;

    // 가맹점 번호
    private _merchantNumber: string;

    // 마스킹된 카드 번호
    private _maskedCardNumber: string;

    // 할부 개월 수 (00~24, 00은 일시불)
    private _installmentMonth: string;

    // 처리 일련번호
    private _processingNumber: string;

    // CAT ID (가맹점승인 ID)
    private _catId: string;

    // 서명데이터 (2096바이트)
    private _signData: string;

    /**
     * Getter approvalNumber
     * @return {string}
     */
    public get approvalNumber(): string {
        return this._approvalNumber;
    }

    /**
     * Setter approvalNumber
     * @param {string} value
     */
    public set approvalNumber(value: string) {
        this._approvalNumber = value;
    }

    /**
     * Getter serviceCode
     * @return {string}
     */
    public get serviceCode(): string {
        return this._serviceCode;
    }

    /**
     * Getter approved
     * @return {boolean}
     */
    public get approved(): boolean {
        return this._approved;
    }

    /**
     * Getter resultMsg1
     * @return {string}
     */
    public get resultMsg1(): string {
        return this._resultMsg1;
    }

    /**
     * Getter resultMsg2
     * @return {string}
     */
    public get resultMsg2(): string {
        return this._resultMsg2;
    }

    /**
     * Getter approvalDate
     * @return {string}
     */
    public get approvalDateTime(): string {
        return this._approvalDateTime;
    }

    /**
     * Getter totalAmount
     * @return {string}
     */
    public get totalAmount(): string {
        return this._totalAmount;
    }

    /**
     * Getter vat
     * @return {string}
     */
    public get vat(): string {
        return this._vat;
    }

    /**
     * Getter issuerCode
     * @return {string}
     */
    public get issuerCode(): string {
        return this._issuerCode;
    }

    /**
     * Getter issuerName
     * @return {string}
     */
    public get issuerName(): string {
        return this._issuerName;
    }

    /**
     * Getter maskedCardNumber
     * @return {string}
     */
    public get maskedCardNumber(): string {
        return this._maskedCardNumber;
    }

    /**
     * Getter installmentMonth
     * @return {string}
     */
    public get installmentMonth(): string {
        return this._installmentMonth;
    }

    /**
     * Getter processingNumber
     * @return {string}
     */
    public get processingNumber(): string {
        return this._processingNumber;
    }

    /**
     * Getter catId
     * @return {string}
     */
    public get catId(): string {
        return this._catId;
    }

    /**
     * Getter signData
     * @return {string}
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
     * Setter approved
     * @param {boolean} value
     */
    public set approved(value: boolean) {
        this._approved = value;
    }

    /**
     * Setter resultMsg1
     * @param {string} value
     */
    public set resultMsg1(value: string) {
        this._resultMsg1 = value;
    }

    /**
     * Setter resultMsg2
     * @param {string} value
     */
    public set resultMsg2(value: string) {
        this._resultMsg2 = value;
    }

    /**
     * Setter approvalDate
     * @param {string} value
     */
    public set approvalDateTime(value: string) {
        this._approvalDateTime = value;
    }

    /**
     * Setter totalAmount
     * @param {string} value
     */
    public set totalAmount(value: string) {
        this._totalAmount = value;
    }

    /**
     * Setter vat
     * @param {string} value
     */
    public set vat(value: string) {
        this._vat = value;
    }

    /**
     * Setter issuerCode
     * @param {string} value
     */
    public set issuerCode(value: string) {
        this._issuerCode = value;
    }

    /**
     * Setter issuerName
     * @param {string} value
     */
    public set issuerName(value: string) {
        this._issuerName = value;
    }

    /**
     * Setter maskedCardNumber
     * @param {string} value
     */
    public set maskedCardNumber(value: string) {
        this._maskedCardNumber = value;
    }

    /**
     * Setter installmentMonth
     * @param {string} value
     */
    public set installmentMonth(value: string) {
        this._installmentMonth = value;
    }

    /**
     * Setter processingNumber
     * @param {string} value
     */
    public set processingNumber(value: string) {
        this._processingNumber = value;
    }

    /**
     * Setter catId
     * @param {string} value
     */
    public set catId(value: string) {
        this._catId = value;
    }

    /**
     * Setter signData
     * @param {string} value
     */
    public set signData(value: string) {
        this._signData = value;
    }

    constructor() {
        super();
    }


    /**
     * Getter acquireCode
     * @return {string}
     */
	public get acquireCode(): string {
		return this._acquireCode;
	}

    /**
     * Getter acquireName
     * @return {string}
     */
	public get acquireName(): string {
		return this._acquireName;
	}

    /**
     * Getter merchantNumber
     * @return {string}
     */
	public get merchantNumber(): string {
		return this._merchantNumber;
	}

    /**
     * Setter acquireCode
     * @param {string} value
     */
	public set acquireCode(value: string) {
		this._acquireCode = value;
	}

    /**
     * Setter acquireName
     * @param {string} value
     */
	public set acquireName(value: string) {
		this._acquireName = value;
	}

    /**
     * Setter merchantNumber
     * @param {string} value
     */
	public set merchantNumber(value: string) {
		this._merchantNumber = value;
	}


    public stringify(): string {
        return JSON.stringify(this);
    }
}
