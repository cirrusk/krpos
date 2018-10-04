/**
 * 주문 상태 정보
 * 주문 생성 시점에만 사용
 * */
export enum StatusDisplay {
    CREATED = 'created',               // 주문 생성
    PROCESSING = 'processing',         // 주문 프로세스 진행 중
    COMPLETED = 'completed',           // 주문 완료
    ERROR = 'ERROR',                   // 주문 오류
    PAID = 'paid',                     // 결제 완료
    CANCELLED = 'cancelled',           // 주문 취소 완료
    CANCELLING = 'cancelling',         // 주문 취소 진행
    PAYMENTFAILED = 'paymentFailed',   // 결제 처리 오류 – 주문 생성시 결제 캡처 오류, Cart는 삭제 되지 않은 상태
    ORDERFAILED = 'orderFailed',       // 주문 생성 오류 – 주문 생성시 오류, Cart는 삭제 되지 않은 상태,
    PAYMENTNOTCAPTURED = 'PAYMENT_NOT_CAPTURED',
    PAYMENTCAPTURED = 'PAYMENT_CAPTURED'
}

export enum ErrorType {
    RECART = 'recart',
    FAIL = 'fail',
    CARDFAIL = 'cardfail',
    NOORDER = 'noorder',
    API = 'api',
    RESTRICT = 'restrict'
}

/**
 * 현금 타입
 */
export enum CashType {
    CASH = 'CASH',
    CHECK = 'CHECK'
}

/**
 * 포인트 타입
 */
export enum PointType {
    BR022 = 'BR022', // 주문
    BR030 = 'BR030', // 전환포인트
    BR033 = 'BR033'  // 멤버포인트
}

/**
 * 신용카드 지불 타입
 */
export enum CCPaymentType {
    GENERAL = 'GENERAL',
    SAFE = 'SAFE'
}

/**
 * 신용카드 유형 타입
 */
export enum CCMemberType {
    PERSONAL = 'PERSONAL', // 개인카드
    LEGAL = 'LEGAL', // 법인카드
}

/**
 * 지불 결제 처리 상태
 */
export enum PaymentStatus {
    CANCELLED = 'CANCELLED',
    NOTPAID = 'NOTPAID',
    OVERPAID = 'OVERPAID',
    PARTPAID = 'PARTPAID',
    PAID = 'PAID'
}

/**
 * 지불 모드
 */
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

/**
 * 계좌 유형
 */
export enum BankTypes {
    DIRECT_DEBIT = 'DIRECT_DEBIT',
    BONUS = 'BONUS'
}

/**
 * 매입사 유형
 */
export enum VanTypes {
    NICE = 'NICE',
    LGU = 'LGU'
}

/**
 * 제품 스캔 타입
 */
export enum ProductScanTypes {
    SERIALNUMBER = 'SERIAL_NUMBER',
    RFID = 'RFID'
}
