import { AmwayPaymentInfoData } from './payment-capture';

export class PaymentDetails {
    paymentInfos: AmwayPaymentInfoData[];
    totalPaidAmount: number;
    balanceAmount: number;
    paymentStatusCode: string; // 결제 상태
}

export class PaymentDetailInfo {
    id: string;
    accountHolderName: string;
    cardType: any; // CardTypeWsDTO
    cardNumber: string;
    startMonth: string;
    startYear: string;
    expiryMonth: string;
    expiryYear: string;
    issueNumber: string;
    subscriptionId: string;
    saved: boolean;
    defaultPayment: boolean;
    billingAddress: any; // AddressWsDTO
    alias: string;
}
