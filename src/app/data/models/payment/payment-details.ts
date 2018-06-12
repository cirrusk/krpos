import { AmwayPaymentInfoData } from './payment-capture';

export class PaymentDetails {
    paymentInfos: AmwayPaymentInfoData[];
    totalPaidAmount: number;
    balanceAmount: number;
}
