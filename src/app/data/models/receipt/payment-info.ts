export class PaymentInfo {
    protected cash: Cash;
    protected creditcard: CreditCard;
    protected iccard: ICCard;
    protected directdebit: DirectDebit;
    public set setCash(cash: Cash) {
        this.cash = cash;
    }
    public set setCreditCard(creditcard: CreditCard) {
        this.creditcard = creditcard;
    }
    public set setICCard(iccard: ICCard) {
        this.iccard = iccard;
    }
    public set setDirectDebit(directdebit: DirectDebit) {
        this.directdebit = directdebit;
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
    protected installmentDesc: string; // 할부개월 명
    protected authnumber: string;  // 승인번호
    constructor(amount: number, cardnumber: string, installment: string, authnumber: string) {
        super(amount);
        this.cardnumber = cardnumber;
        this.installment = installment;
        if (installment === '00' || installment === '0' || installment === '1') {
            this.installmentDesc = '일시불';
        } else {
            this.installmentDesc = installment + '개월';
        }
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
// 현금/IC카드 결제
export class ICCard extends CreditCard {
    constructor(amount: number, cardnumber: string, authnumber: string) {
        super(amount, cardnumber, '0', authnumber);
    }
}

// 자동이체
export class DirectDebit extends PaymnetDefault {
    constructor(amount) {
        super(amount);
    }
}
// 미수금 결제
