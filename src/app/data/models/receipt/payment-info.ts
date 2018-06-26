export class PaymentInfo {
    protected cash: Cash;
    protected creditcard: CreditCard;
    public set setCash(cash: Cash) {
        this.cash = cash;
    }
    public set setCreditCard(creditcard: CreditCard) {
        this.creditcard = creditcard;
    }
}

export class PaymnetDefault {
    protected amount: string;
    constructor(amount) {
        this.amount = String(amount);
    }
}

// 신용카드
export class CreditCard extends PaymnetDefault {
    protected cardnumber: string;  // 카드번호
    protected installment: string; // 할부개월
    protected authnumber: string;  // 승인번호
    constructor(amount: number, cardnumber: string, installment: string, authnumber: string) {
        super(amount);
        this.cardnumber = cardnumber;
        this.installment = installment;
        this.authnumber = authnumber;
    }
}
// 현금결제
export class Cash extends PaymnetDefault {
    protected received: string;      // 받은금액
    protected changes: string;       // 거스름돈
    protected cashreceipt: boolean;  // 현금영수증여부
    constructor(amount: number, received: string, changes: string, cashreceipt?: boolean) {
        super(amount);
        this.received = received;
        this.changes = changes;
        this.cashreceipt = cashreceipt || false;
    }
}
// 자동이체
// 쿠폰 결제
// 포인트
// 미수금 결제
// 현금/IC카드 결제