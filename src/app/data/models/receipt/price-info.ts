export class PriceInfo {
    protected totalQty: string;          // 상품수량
    protected amountWithoutVAT: string;  // 과세 물품
    protected amountVAT: string;         // 부가세
    protected totalAmount: string;       // 합계
    protected totalDiscount: string;     // 할인금액
    protected discount: Discount;        // 할인금액정보
    protected finalAmount: string;       // 결제금액
    public set setDiscount(discount: Discount) {
        this.discount = discount;
    }
    constructor(totalQty: number, amountWithoutVAT: number, amountVAT: number, totalAmount: number, totalDiscount: number, finalAmount: number, discount?: Discount) {
        this.totalQty = String(totalQty);
        this.amountWithoutVAT = String(amountWithoutVAT);
        this.totalAmount = String(totalAmount);
        this.totalDiscount = String(totalDiscount);
        this.finalAmount = String(finalAmount);
        this.discount = discount;
    }
}

export class Discount {
    protected coupon: DiscountInfo;
    protected point: DiscountInfo;
    protected recash: DiscountInfo;

    public set setCoupon(coupon: DiscountInfo) {
        this.coupon = coupon;
    }

    public set setPoint(point: DiscountInfo) {
        this.point = point;
    }

    public set setRecash(recash: DiscountInfo) {
        this.recash = recash;
    }
}

export class DiscountInfo {
    name: string;
    amount: string;
    constructor(name: string, amount: number) {
        this.name = name;
        this.amount = String(amount);
    }
}
