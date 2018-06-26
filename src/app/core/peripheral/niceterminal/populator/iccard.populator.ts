import { ICCardApprovalRequest } from '../vo/iccard.approval.request';
import { NiceConstants } from '../nice.constants';
import { ICCardApprovalResult } from '../vo/iccard.approval.result';
import { NiceUtils } from '../utils/nice.utils';
import { ICCardCancelRequest } from '../vo/iccard.cancel.request';
import { ICCardCancelResult } from '../vo/iccard.cancel.result';

export class ICCardPopulator {
    public static fillApprovalReqVO(amount: string): ICCardApprovalRequest {
        const req: ICCardApprovalRequest = new ICCardApprovalRequest();

        req.amount = amount;

        return req;
    }

    public static generateApprovalReq(data: ICCardApprovalRequest): string {
        const strBuilder: Array<string> = new Array();

        // 서비스 코드
        strBuilder.push(data.serviceCode);
        strBuilder.push(NiceConstants.DELIMITER);

        // 할부
        strBuilder.push(data.installment);
        strBuilder.push(NiceConstants.DELIMITER);

        // 금액
        strBuilder.push(data.amount);
        strBuilder.push(NiceConstants.DELIMITER);

        // 승인번호
        strBuilder.push(data.approvalNumber);
        strBuilder.push(NiceConstants.DELIMITER);

        // 거래일자
        strBuilder.push(data.approvalDate);
        strBuilder.push(NiceConstants.DELIMITER);

        // CAT ID
        strBuilder.push(data.catId);
        strBuilder.push(NiceConstants.DELIMITER);

        // 서명
        strBuilder.push(data.signData);
        strBuilder.push(NiceConstants.DELIMITER);

        return strBuilder.join('');
    }

    public static parseApprovalResult(raw: string): ICCardApprovalResult {
        const result: ICCardApprovalResult = new ICCardApprovalResult();

        const resultCode: string = NiceUtils.extractResultCode(raw);
        const resultMsg: string = NiceConstants.ERROR_MESSAGE[resultCode];

        result.code = resultCode;
        result.msg = resultMsg;

        if (resultCode === NiceConstants.REQEUST_SUCCESSFUL) {
            const tokens: Array<string> = raw.split(NiceConstants.DELIMITER);

            // if (tokens.length !== 31) {
            //     throw new Error('NICE result is malformed');
            // }

            result.serviceCode = tokens[0];
            result.approved = tokens[1] === 'A' ? true : false;
            result.resultMsg1 = tokens[2].trim();
            result.resultMsg2 = tokens[3].trim();
            result.approvalDateTime = tokens[4];
            result.amount = tokens[5];
            result.vat = tokens[6];
            result.serviceFee = tokens[7];
            result.approvalNumber = tokens[8];
            result.issuerCode = tokens[9];
            result.merchantCode = tokens[10];
            result.issuerName = tokens[11];
            result.merchantName = tokens[12];
            result.salerNumber = tokens[13];
            result.maskedCardNumber = tokens[14];
            result.installment = tokens[15];
            result.processingNumber = tokens[16];
            result.catId = tokens[17];
            result.issuerOrgName = tokens[18];
            result.merchantOrgName = tokens[19];
            result.distinguishCode = tokens[20];
            result.trxNumber = tokens[21];
            result.issuerOrgCode = tokens[22];
            result.merchantOrgCode = tokens[23];
            result.track3Info = tokens[24];
            result.iccardSerialNumber = tokens[25];
            result.accountBalance = tokens[26];
            result.maskedBankAccount = tokens[27];
            result.trxDate = tokens[28];
            result.inquiryTrxNumber = tokens[29];
            result.signData = tokens[30];
        }

        return result;
    }

    public static fillCancenReqVO(amount: string, approvalNumber: string, approvalDate: string): ICCardCancelRequest {
        const req: ICCardCancelRequest = new ICCardCancelRequest();

        req.approvalNumber = approvalNumber;
        req.approvalDate = approvalDate;
        req.amount = amount;

        return req;
    }

    public static generateCancelReq(reqVO: ICCardCancelRequest): string {
        const strBuilder: Array<string> = new Array();

        // 순서/필드를 반드시 지켜야 한다.

        // 서비스 코드
        strBuilder.push(reqVO.serviceCode);
        strBuilder.push(NiceConstants.DELIMITER);

        // 할부
        strBuilder.push(reqVO.installment);
        strBuilder.push(NiceConstants.DELIMITER);

        // 금액
        strBuilder.push(reqVO.amount);
        strBuilder.push(NiceConstants.DELIMITER);

        // 승인번호
        strBuilder.push(reqVO.approvalNumber);
        strBuilder.push(NiceConstants.DELIMITER);

        // 거래일자(승인일자)
        strBuilder.push(reqVO.approvalDate);
        strBuilder.push(NiceConstants.DELIMITER);

        // CAT ID
        strBuilder.push(reqVO.catId);
        strBuilder.push(NiceConstants.DELIMITER);

        // Sign Data
        strBuilder.push(reqVO.signData);
        strBuilder.push(NiceConstants.DELIMITER);

        return strBuilder.join('');
    }

    public static parseCancelResult(raw: string): ICCardCancelResult {
        const result: ICCardCancelResult = new ICCardCancelResult();

        const resultCode: string = NiceUtils.extractResultCode(raw);
        const resultMsg: string = NiceConstants.ERROR_MESSAGE[resultCode];

        result.code = resultCode;
        result.msg = resultMsg;

        if (resultCode === NiceConstants.REQEUST_SUCCESSFUL) {
            const tokens: Array<string> = raw.split(NiceConstants.DELIMITER);

            // if (tokens.length !== 31) {
            //     throw new Error('NICE result is malformed');
            // }

            result.serviceCode = tokens[0];
            result.approved = tokens[1] === 'A' ? true : false;
            result.resultMsg1 = tokens[2].trim();
            result.resultMsg2 = tokens[3].trim();
            result.approvalDateTime = tokens[4];
            result.amount = tokens[5];
            result.vat = tokens[6];
            result.serviceFee = tokens[7];
            result.approvalNumber = tokens[8];
            result.issuerCode = tokens[9];
            result.merchantCode = tokens[10];
            result.issuerName = tokens[11];
            result.merchantName = tokens[12];
            result.salerNumber = tokens[13];
            result.maskedCardNumber = tokens[14];
            result.installment = tokens[15];
            result.processingNumber = tokens[16];
            result.catId = tokens[17];
            result.issuerOrgName = tokens[18];
            result.merchantOrgName = tokens[19];
            result.distinguishCode = tokens[20];
            result.trxNumber = tokens[21];
            result.issuerOrgCode = tokens[22];
            result.merchantOrgCode = tokens[23];
            result.track3Info = tokens[24];
            result.iccardSerialNumber = tokens[25];
            result.accountBalance = tokens[26];
            result.maskedBankAccount = tokens[27];
            result.trxDate = tokens[28];
            result.inquiryTrxNumber = tokens[29];
            result.signData = tokens[30];
        }

        return result;
    }
}
