import { NiceConstants } from "../nice.constants";

export class CardCancelRequest {
    // 서비스 코드
    private _serviceCode: string;
    // 서명 데이터 요청
    private _reqSignData: string;
    // 무카드 취소번호 (취소만)
    private _cancelNumber: string;
    // 할부 개월
    private _installment: string;
    // 면세 금액
    private _dutyFreeAmt: string;
    // 과세 금액
    private _dutyAmount: string;
    // 판매 금액
    private _totalAmount: string;
    // 승인번호
    private _approvalNumber: string;
    // 승인 일자 (YYmmdd)
    private _approvalDate: string
    // CAT ID
    private _catId: string;
    // Sign Data (사용하지 않음)
    private _signData: string;

    constructor() {
        this._serviceCode = NiceConstants.CODE.CARD_CANCCEL;
        this._installment = '00';
        this._reqSignData = '';
        this._dutyFreeAmt = '0';
        this._signData = '';
        this._catId = '';
    }

    /**
     * Getter serviceCode
     * @return {string}
     */
	public get serviceCode(): string {
		return this._serviceCode;
	}

    /**
     * Getter reqSignData
     * @return {string}
     */
	public get reqSignData(): string {
		return this._reqSignData;
	}

    /**
     * Getter cancelNumber
     * @return {string}
     */
	public get cancelNumber(): string {
		return this._cancelNumber;
	}

    /**
     * Getter installment
     * @return {string}
     */
	public get installment(): string {
		return this._installment;
	}

    /**
     * Getter dutyFreeAmt
     * @return {string}
     */
	public get dutyFreeAmt(): string {
		return this._dutyFreeAmt;
	}

    /**
     * Getter dutyAmount
     * @return {string}
     */
	public get dutyAmount(): string {
		return this._dutyAmount;
	}

    /**
     * Getter totalAmount
     * @return {string}
     */
	public get totalAmount(): string {
		return this._totalAmount;
	}

    /**
     * Getter approvalNumber
     * @return {string}
     */
	public get approvalNumber(): string {
		return this._approvalNumber;
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
     * Setter cancelNumber
     * @param {string} value
     */
	public set cancelNumber(value: string) {
		this._cancelNumber = value;
	}

    /**
     * Setter dutyAmount
     * @param {string} value
     */
	public set dutyAmount(value: string) {
		this._dutyAmount = value;
	}

    /**
     * Setter totalAmount
     * @param {string} value
     */
	public set totalAmount(value: string) {
		this._totalAmount = value;
	}

    /**
     * Setter approvalNumber
     * @param {string} value
     */
	public set approvalNumber(value: string) {
		this._approvalNumber = value;
    }

    /**
     * Setter approvalDate
     * @param {string} value
     */
	public set approvalDate(value: string) {
		this._approvalDate = value;
    }
    
    public stringify(): string {
        return JSON.stringify(this);
    }
}