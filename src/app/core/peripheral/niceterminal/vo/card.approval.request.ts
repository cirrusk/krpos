import { NiceConstants } from '../nice.constants';

export class CardApprovalRequest {
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
    // VAT
    private _vat: string;
    // 봉사료
    private _serviceFee: string;
    // CAT ID
    private _catId: string;
    // Sign Data (사용하지 않음)
    private _signData: string;

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
     * Setter reqSignData
     * @param {string} value
     */
    public set reqSignData(value: string) {
        this._reqSignData = value;
    }

    /**
     * Setter installment
     * @param {string} value
     */
    public set installment(value: string) {
        this._installment = value;
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
     * Setter vat
     * @param {string} value
     */
    public set vat(value: string) {
        this._vat = value;
    }

    constructor() {
        this._serviceCode = NiceConstants.CODE.CARD_APPROVAL;
        this._cancelNumber = '';
        this._dutyFreeAmt = '0';
        this._serviceFee = '0';
        this._catId = '';
        this._signData = '';
    }

    public stringify(): string {
        return JSON.stringify(this);
    }
}
