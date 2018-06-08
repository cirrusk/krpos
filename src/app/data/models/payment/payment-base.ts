import { PaymentMode } from './payment-mode';

export class PaymentModeList {
    paymentModes: PaymentModeBase[];
}

export class PaymentModeBase {
    code: string;
    paymentModes: PaymentMode[];
}
