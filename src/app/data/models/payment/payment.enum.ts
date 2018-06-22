/** 주문 생성 시점에만 사용 */
export enum StatusDisplay {
    CREATED = 'created',               // 주문 생성
    PROCESSING = 'processing',         // 주문 프로세스 진행 중
    COMPLETED = 'completed',           // 주문 완료
    ERROR = 'error',                   // 주문 오류
    PAID = 'paid',                     // 결제 완료
    CANCELLED = 'cancelled',           // 주문 취소 완료
    CANCELLING = 'cancelling',         // 주문 취소 진행
    PAYMENTFAILED = 'paymentfailed',   // 결제 처리 오류 – 주문 생성시 결제 캡처 오류, Cart는 삭제 되지 않은 상태
    ORDERFAILED = 'orderfailed'        // 주문 생성 오류 – 주문 생성시 오류, Cart는 삭제 되지 않은 상태
}

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
