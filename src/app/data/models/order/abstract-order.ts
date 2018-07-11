import { OrderEntry, Accounts, Principal, Price } from '../..';
import { Voucher } from '../payment/voucher';
import { Coupon } from '../payment/coupon';
import { PaymentDetails, PaymentDetailInfo } from '../payment/payment-details';
import { AmwayValue } from '../common/amway-value';
import { PromotionList, PromotionDiscount } from './promotion';
import { Enumeration } from '../common/enumeration';
import { PointOfService } from '../common/point-of-service';

export class AbstractOrder {
    code: string;
    net: boolean;
    totalPriceWithTax: Price;
    totalPrice: Price;
    totalTax: Price;
    subTotal: Price;
    deliveryCost: Price;
    entries: Array<OrderEntry>;
    totalItems: number;
    deliveryMode: any; // DeliveryModeWsDTO
    deliveryAddress: any; // AddressWsDTO
    paymentInfo: PaymentDetailInfo; // PaymentDetailsWsDTO
    appliedOrderPromotions: Array<PromotionList>; // List<PromotionResultWsDTO>
    appliedProductPromotions: Array<PromotionList>; // List<PromotionResultWsDTO>
    productDiscounts: Price;
    orderDiscounts: Price;
    totalDiscounts: Price;
    site: string;
    store: string;
    guid: string;
    calculated: boolean;
    appliedCouponData: Array<Coupon>;
    appliedVouchers: Array<Voucher>; // List<VoucherWsDTO>
    promotionDiscountsDetails: Array<PromotionDiscount>;
    deliveryPointOfService: PointOfService;
    parentOrder: string;
    channel: Enumeration;
    orderPeriodStartDate: Date;
    bonusPeriodStartDate: Date;
    user: Principal;
    pickupOrderGroups: any; // List<PickupOrderEntryGroupWsDTO>
    deliveryOrderGroups: any; // List<DeliveryOrderEntryGroupWsDTO>
    pickupItemsQuantity: number;
    deliveryItemsQuantity: number;
    account: Accounts;
    savings: Price;
    volumeABOAccount: Accounts;
    groupOrderId: string;
    combinedOrderId: string;
    orderType: Enumeration; // EnumerationWsDTO
    warehouse: string;
    orderPeriod: OrderPeriod; // AmwayOrderPeriodWsDTO
    bonusPeriod: BonusPeriod; // AmwayBonusPeriodWsDTO
    margin: OrderMargin; // AmwayOrderMarginWsDTO
    value: AmwayValue; // AmwayValueWsDTO
    totalWeight: number;
    paymentDetails: PaymentDetails; // AmwayPaymentDetailsWsDTO
    deductionNumber: string; // Mac&Co
    constructor() { }
}

export class OrderPeriod {
    startDate: Date;
    endDate: Date;
    status: string;
}

export class BonusPeriod {
    startDate: Date;
    endDate: Date;
    status: string;
}

export class OrderMargin {
    margin: number; // double
}
