import { NiceConstants } from '../nice.constants';
import { CardApprovalResult } from '../vo/card.approval.result';
import { CardApprovalRequest } from '../vo/card.approval.request';
import { NiceUtils } from '../utils/nice.utils';
import { CardCancelRequest } from '../vo/card.cancel.reqeust';
import { CardCancelResult } from '../vo/card.cancel.result';

export class CardPopulator {
    public static fillApprovalReqVO(amount: string, installment: string): CardApprovalRequest {
        const reqVO: CardApprovalRequest = new CardApprovalRequest();

        // 5만원 이상인 경우 세팅해서 보낸다

        // 서명데이터가 채워져서 보내지면 잘못된 전문으로 인식 됨
        // reqVO.reqSignData = CardPopulator.isSignatureRequired(amount);

        if (!installment) {
            reqVO.installment = '00';
        } else {
            reqVO.installment = NiceUtils.padding(installment, 2);
        }

        reqVO.dutyAmount = amount;
        reqVO.totalAmount = amount;
        reqVO.vat = CardPopulator.calVat(amount);

        return reqVO;
    }

    public static generateApprovalReq(data: CardApprovalRequest): string {
        const strBuilder: Array<string> = new Array();

        // 순서/필드를 반드시 지켜야 한다.

        // 서비스코드
        strBuilder.push(data.serviceCode);
        strBuilder.push(NiceConstants.DELIMITER);
        // 서명 여부
        strBuilder.push(data.reqSignData);
        strBuilder.push(NiceConstants.DELIMITER);
        // 무카드 취소번호 (취소에서만 사용)
        strBuilder.push(data.cancelNumber);
        strBuilder.push(NiceConstants.DELIMITER);
        // 할부 개월
        strBuilder.push(data.installment);
        strBuilder.push(NiceConstants.DELIMITER);
        // 면세 금액
        strBuilder.push(data.dutyFreeAmt);
        strBuilder.push(NiceConstants.DELIMITER);
        // 과세 금액
        strBuilder.push(data.dutyAmount);
        strBuilder.push(NiceConstants.DELIMITER);
        // 판매금액
        strBuilder.push(data.totalAmount);
        strBuilder.push(NiceConstants.DELIMITER);
        // VAT
        strBuilder.push(data.vat);
        strBuilder.push(NiceConstants.DELIMITER);
        // 봉사료
        strBuilder.push(data.serviceFee);
        strBuilder.push(NiceConstants.DELIMITER);
        // CAT ID
        strBuilder.push(data.catId);
        strBuilder.push(NiceConstants.DELIMITER);
        // SignData
        strBuilder.push(data.signData);
        strBuilder.push();
        strBuilder.push(NiceConstants.DELIMITER);

        return strBuilder.join('');
    }

    private static isSignatureRequired(amount: string): string {
        const money: number = Number.parseInt(amount);

        if (money == null) {
            throw new Error('Amount is not number format.');
        }

        if (money >= NiceConstants.SIGN_AMOUNT) {
            return 'Y';
        }

        return 'N';
    }

    private static calVat(amount: string): string {
        return Math.round(Number.parseInt(amount) * 0.9).toString();
    }

    public static parseApprovalResult(raw: string): CardApprovalResult {
        const result: CardApprovalResult = new CardApprovalResult();

        console.log('Start to parse this message : ' + raw);

        const resultCode: string = NiceUtils.extractResultCode(raw);
        const resultMsg: string = NiceConstants.ERROR_MESSAGE[resultCode];

        result.code = resultCode;
        result.msg = resultMsg;

        if (resultCode === NiceConstants.REQEUST_SUCCESSFUL) {
            const tokens: Array<string> = raw.split(NiceConstants.DELIMITER);

            // if (tokens.length !== 18) {
            //     throw new Error('NICE result is malformed');
            // }

            // slice() --> 1번째 바이트 제거
            result.serviceCode = tokens[0].slice(1);
            result.approved = tokens[1] === 'A' ? true : false;
            result.resultMsg1 = tokens[2].trim();
            result.resultMsg2 = tokens[3].trim();
            result.approvalDateTime = tokens[4];
            result.totalAmount = tokens[5];
            result.vat = tokens[6];
            result.approvalNumber = tokens[7];
            result.issuerCode = tokens[8];
            result.acquireCode = tokens[9];
            result.issuerName = tokens[10];
            result.acquireName = tokens[11];
            result.merchantNumber = tokens[12];
            result.maskedCardNumber = tokens[13];
            result.installmentMonth = tokens[14];
            result.processingNumber = tokens[15]; // 단말기 처리 일련번호
            result.catId = tokens[16];
            result.signData = tokens[17];
        }

        return result;
    }

    public static fillCancelReqVO(amount: string, approvalNumber: string, approvalDate: string, installment: string): CardCancelRequest {
        const req: CardCancelRequest = new CardCancelRequest();

        req.approvalNumber = approvalNumber;
        req.approvalDate = approvalDate;
        req.cancelNumber = '';
        req.dutyAmount = amount;
        req.totalAmount = amount;

        if (!installment) {
            req.installment = '00';
        } else {
            req.installment = NiceUtils.padding(installment, 2);
        }

        return req;
    }

    public static generateCancelReq(reqVO: CardCancelRequest): string {
        const strBuilder: Array<string> = new Array();

        // 순서/필드를 반드시 지켜야 한다.

        // 서비스 코드
        strBuilder.push(reqVO.serviceCode);
        strBuilder.push(NiceConstants.DELIMITER);

        // 서명 데이터 요청 여부
        strBuilder.push(reqVO.reqSignData);
        strBuilder.push(NiceConstants.DELIMITER);

        // 무카드 취소 번호
        strBuilder.push(reqVO.cancelNumber);
        strBuilder.push(NiceConstants.DELIMITER);

        // 할부
        strBuilder.push(reqVO.installment);
        strBuilder.push(NiceConstants.DELIMITER);

        // 면세 금액
        strBuilder.push(reqVO.dutyFreeAmt);
        strBuilder.push(NiceConstants.DELIMITER);

        // 과세 금액
        strBuilder.push(reqVO.dutyAmount);
        strBuilder.push(NiceConstants.DELIMITER);

        // 총판매 금액
        strBuilder.push(reqVO.totalAmount);
        strBuilder.push(NiceConstants.DELIMITER);

        // 승인 번호
        strBuilder.push(reqVO.approvalNumber);
        strBuilder.push(NiceConstants.DELIMITER);

        // 승인 날짜
        strBuilder.push(reqVO.approvalDate);
        strBuilder.push(NiceConstants.DELIMITER);

        // CAT ID
        strBuilder.push(reqVO.catId);
        strBuilder.push(NiceConstants.DELIMITER);

        // 서명 데이터
        strBuilder.push(reqVO.signData);
        strBuilder.push(NiceConstants.DELIMITER);

        return strBuilder.join('');
    }

    public static parseCancelResult(raw: string): CardCancelResult {
        const result: CardCancelResult = new CardCancelResult();

        const resultCode: string = NiceUtils.extractResultCode(raw);
        const resultMsg: string = NiceConstants.ERROR_MESSAGE[resultCode];

        result.code = resultCode;
        result.msg = resultMsg;

        if (resultCode === NiceConstants.REQEUST_SUCCESSFUL) {
            const tokens: Array<string> = raw.split(NiceConstants.DELIMITER);

            // if (tokens.length !== 18) {
            //     throw new Error('NICE result is malformed');
            // }

            // slice() --> 1번째 바이트 제거
            result.serviceCode = tokens[0].slice(1);
            result.approved = tokens[1] === 'A' ? true : false;
            result.resultMsg1 = tokens[2].trim();
            result.resultMsg2 = tokens[3].trim();
            result.approvalDate = tokens[4];
            result.totalAmount = tokens[5];
            result.vat = tokens[6];
            result.approvalNumber = tokens[7];
            result.issuerCode = tokens[8];
            result.acquireCode = tokens[9];
            result.issuerName = tokens[10];
            result.acquireName = tokens[11];
            result.merchantNumber = tokens[12];
            result.maskedCardNumber = tokens[13];
            result.installmentMonth = tokens[14];
            result.processingNumber = tokens[15];
            result.catId = tokens[16];
            result.signData = tokens[17];
        }

        return result;
    }
}
