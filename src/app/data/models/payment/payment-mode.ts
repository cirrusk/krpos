export class PaymentModeList {
    paymentModes: PaymentMode[];
}

export class PaymentMode {
    allowOverpay: boolean;
    amount: number;
    code: string;
    name: string;
    repeatableCount: number;
    usedCount: number;
}
