import { PaymentMode } from './payment-mode';

export class PaymentModeList {
    paymentModes: PaymentBase[];
}

export class PaymentBase {
    code: string;
    paymentModes: PaymentMode[];
}
