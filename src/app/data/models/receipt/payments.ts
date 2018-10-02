export class PaymentsVO {
    creditcard: any;

    constructor(amount: number) {
        this.creditcard = {
            'amount': String(amount),
            'detail': {
                'cardnumber': '카드번호',
                'installment': '할부개월',
                'authNumber': '승인번호'
            }
        };
    }
}
