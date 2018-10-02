import { PromotionResultAction } from '../order/order';

export class PriceInfo {
    protected totalQty: string;          // 상품수량
    protected amountWithoutVAT: string;  // 과세 물품
    protected amountVAT: string;         // 부가세
    protected sumAmount: string;         // 합계
    protected totalDiscount: string;     // 할인금액
    protected discount: Discount;        // 할인금액정보
    protected totalAmount: string;       // 결제금액
    protected point: PointInfo;          // 포인트
    protected recash: string;            // Re-Cash
    protected promotion: string;         // 프로모션
    protected coupon: string;            // 쿠폰
    protected promotionDiscountInfo: Array<PromotionResultAction>; // 프로모션 할인 정보

    public set setPointInfo(point: PointInfo) {
        this.point = point;
    }
    public set setRecash(recash: number) {
        this.recash = String(recash);
    }
    public set setDiscount(discount: Discount) {
        this.discount = discount;
    }
    public set setTotalDiscount(totalDiscount: number) {
        this.totalDiscount = String(totalDiscount);
    }
    public set setPromotion(promotion: number) {
        this.promotion = String(promotion);
    }
    public set setCoupon(coupon: number) {
        this.coupon = String(coupon);
    }

    public set setPromotionDiscountInfo(promotionDiscountInfo: Array<PromotionResultAction>) {
        this.promotionDiscountInfo = promotionDiscountInfo;
    }
    constructor(totalQty: number, amountWithoutVAT: number, amountVAT: number, sumAmount: number, totalAmount: number, totalDiscount?: number, discount?: Discount) {
        this.totalQty = String(totalQty);
        this.amountWithoutVAT = String(amountWithoutVAT);
        this.amountVAT = String(amountVAT);
        this.sumAmount = String(sumAmount);
        if (totalDiscount) { // 0일 경우 용지 아끼기 위해 출력에서 제외
            this.totalDiscount = String(totalDiscount);
        }
        this.totalAmount = String(totalAmount);
        if (discount) { // totalDiscount 0 이거나 값이 없을 경우 용지 아끼기 위해 출력에서 제외
            this.discount = discount;
        }
    }
}

export class Discount {
    protected amount: string;               // 할인금액(전체 할인 금액계산하고 - 붙힘)
    protected discountList: Array<DiscountInfo>;  // 할인항목
    protected coupon: DiscountInfo;
    protected point: DiscountInfo;
    protected recash: DiscountInfo;

    public set setDiscountList(discountList: Array<DiscountInfo>) {
        this.discountList = discountList;
    }

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
    price: string;
    constructor(name: string, price: number) {
        this.name = name;
        this.price = String(price);
    }
}

export class PointInfo {
    name: string;
    amount: string;
    constructor(name: string, amount: number) {
        this.name = name;
        this.amount = String(amount);
    }
}
