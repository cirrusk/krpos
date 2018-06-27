import { ProductInfo } from '../order/product-info';
import { Pagination } from '../common/pagination';

export class CouponList {
    coupons: Array<Coupon>;
    pagination: Pagination;
}

export class Coupon {
    couponCode: string;
    couponId: string;
    name: string;
    active: boolean;
    startDate: Date;
    endDate: Date;
    product: ProductInfo;
    status: string;
    description: string;
    notificationOn: boolean;
    solrRootCategory: string;
    bindingAnyProduct: boolean;
}
