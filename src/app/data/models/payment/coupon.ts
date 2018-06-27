import { ProductInfo } from '../order/product-info';

export class CouponList {
    coupons: Array<Coupon>;
}

export class Coupon {
    couponCode: string;
    couponId: string;
    name: string;
    active: boolean;
    startDate: Date;
    endDate: Date;
    code: string;
    product: ProductInfo;
    status: string;
    description: string;
    notificationOn: boolean;
    solrRootCategory: string;
    bindingAnyProduct: boolean;
}
