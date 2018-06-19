/** 결제 방법 : store 기준 결제 방법 */
export class PaymentModeList {
    paymentModes: PaymentMode[];
}

/** 결제 방법 : cart 주결제 방법 기준 사용 가능한 결제 방법  */
export class PaymentModeListByMain {
    paymentModes: PaymentModeByMain[];
}

export class PaymentMode {
    allowOverpay: boolean;
    amount: number;
    code: string;
    name: string;
    paymentInfoType: string;
    repeatableCount: number;
    overpaymentThreshold: number;
    usedCount: number;
}

export class PaymentModeByMain {
    code: string;
    paymentModes: PaymentModeList;
}
