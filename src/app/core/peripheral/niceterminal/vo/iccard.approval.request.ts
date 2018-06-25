import { NiceConstants } from '../nice.constants';

export class ICCardApprovalRequest {
    // 서비스 코드
    private _serviceCode: string;

    // 할부 개월
    private _installment: string;

    // 총 판매금액
    private _amount: string;

    // 승인 번호 (승인 요청 시 사용하지 않음)
    private _approvalNumber: string;

    // 승인 일자 (승인 요청 시 사용하지 않음)
    private _approvalDate: string;

    // CAT ID
    private _catId: string;

    // 서명
    private _signData: string;

    constructor() {
        this._serviceCode = NiceConstants.CODE.CASHICCARD_APPROVAL;
        this._installment = '00';
        this._approvalNumber = '';
        this._approvalDate = '';
        this._catId = '';
        this._signData = '';
    }

    /**
     * Getter serviceCode
     * @return {string}
     */
    public get serviceCode(): string {
        return this._serviceCode;
    }

    /**
     * Getter installment
     * @return {string}
     */
    public get installment(): string {
        return this._installment;
    }

    /**
     * Getter amount
     * @return {string}
     */
    public get amount(): string {
        return this._amount;
    }

    /**
     * Getter approvalNumber
     * @return {string}
     */
    public get approvalNumber(): string {
        return this._approvalNumber;
    }

    /**
     * Getter approvalDate
     * @return {string}
     */
    public get approvalDate(): string {
        return this._approvalDate;
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
     * Setter amount
     * @param {string} value
     */
    public set amount(value: string) {
        this._amount = value;
    }

    public stringify() {
        return JSON.stringify(this);
    }
}
