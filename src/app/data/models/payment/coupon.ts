import { Customer } from '../order/customer';
import { Accounts } from '../order/accounts';

export class CouponList {
    coupons: Array<Coupon>;
}

export class Coupon {
    couponType: string;
    description: string;
    value: string;
    code: string;
    customer: Customer; // CustomerWsDTO
    account: Accounts; // AmwayAccountWsDTO
    startDate: Date;
    endDate: Date;
    store: string;
    redemptionCoupon: string;
    status: string;
}
