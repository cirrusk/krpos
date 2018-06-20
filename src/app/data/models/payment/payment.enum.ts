export enum CashType {
    CASH = 'CASH',
    CHECK = 'CHECK'
}

export enum PointType {
    BR030 = 'BR030', // 전환포인트
    BR033 = 'BR033'  // 멤버포인트
}

export enum CCPaymentType {
    GENERAL = 'GENERAL',
    SAFE = 'SAFE'
}

export enum CCMemberType {
    PERSONAL = 'PERSONAL', // 개인카드
    LEGAL = 'LEGAL', // 법인카드
}

export enum PaymentStatus {
    CANCELLED = 'CANCELLED',
    NOTPAID = 'NOTPAID',
    OVERPAID = 'OVERPAID',
    PARTPAID = 'PARTPAID',
    PAID = 'PAID'
}

export enum PaymentModes {
    ARCREDIT = 'arCredit',
    CASH = 'cash',
    POINT = 'point',
    CREDITCARD = 'creditcard',
    ICCARD = 'cashiccard',
    CHEQUE = 'cheque',
    DIRECTDEBIT = 'directdebit',
    COUPON = 'creditvoucher'
}
