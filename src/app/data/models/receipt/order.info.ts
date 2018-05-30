export class OrderInfoVO {
    posId: string;
    number: string;
    cashier:any;
    macAndCoNum: string;
    type: string;
    account: any;
    date: string;

    constructor(posId: string,
                cashierId: string, cashierName: string,
                userId: string, userName: string) {
        this.posId = posId;
        this.number = '10000000';
        this.cashier = {
            'ad': cashierId,
            'lastName': '',
            'firstName': cashierName
        };
        this.macAndCoNum = 'MAC&CO';
        this.type = '현장구매';
        this.account = {
            'abo': {
                'id': userId,
                'name': userName
            }
        };
        this.date = (new Date()).toDateString();
    } 
}