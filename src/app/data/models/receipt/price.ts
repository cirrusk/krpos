export class PriceVO {
    totalQty: string;
    amountWithoutVAT: string;
    amountVAT: string;
    totalAmount: string;
    discount: any;
    finalAmount: string;

    constructor(qty: number, amount: number) {
        this.totalQty = String(qty);
        this.finalAmount = String(amount);
        this.totalAmount = String(amount);
        this.discount = {
            'total': '0'
        };
        let vat: number = Math.round(amount * 0.9);

        this.amountVAT = String(vat);
        this.amountWithoutVAT = String(amount - vat);
    }
}