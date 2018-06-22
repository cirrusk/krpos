import { Injectable } from "@angular/core";
import { CardApprovalResult } from "./vo/card.approval.result";

@Injectable()
export class NiceMockedPaymentService {
    constructor() {

    }

    public cardApproval(amount: string, installment: string) {
        let result: CardApprovalResult = new CardApprovalResult();

        result.code = "1";
        result.msg = "NORMAL";
        result.serviceCode = "136PCAT00000124\u0002D1";
        result.approved = true;
        result.resultMsg1 = "";
        result.resultMsg2 = "";
        result.approvalDateTime = "180622122020";
        result.totalAmount = amount;
        result.vat = "0";
        result.approvalNumber = "12208603";
        result.issuerCode = "02";
        result.merchantCode = "02";
        result.issuerName = "KB국민실버카드";
        result.merchantName = "KB국민카드";
        result.salerNumber = "00023451613";
        result.maskedCardNumber = "457972******8003";
        result.installmentMonth = "00";
        result.processingNumber = "0029";
        result.catId = "2393300001";
        result.signData = "";

        return result;
    }

    public cardCancel(amount: string, installment: string) {

    }
}