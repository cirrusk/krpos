import { OrderEntry, Accounts, Principal, Price } from '../..';
import { Voucher } from '../payment/voucher';
import { Coupon } from '../payment/coupon';
import { PaymentDetails, PaymentDetailInfo } from '../payment/payment-details';
import { AmwayValue } from '../common/amway-value';

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
    appliedOrderPromotions: any; // List<PromotionResultWsDTO>
    appliedProductPromotions: any; // List<PromotionResultWsDTO>
    productDiscounts: Price;
    orderDiscounts: Price;
    totalDiscounts: Price;
    site: string;
    store: string;
    guid: string;
    calculated: boolean;
    appliedCouponData: Array<Coupon>;
    appliedVouchers: Array<Voucher>; // List<VoucherWsDTO>
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
    orderType: any; // EnumerationWsDTO
    warehouse: string;
    orderPeriod: any; // AmwayOrderPeriodWsDTO
    bonusPeriod: any; // AmwayBonusPeriodWsDTO
    margin: any; // AmwayOrderMarginWsDTO
    value: AmwayValue; // AmwayValueWsDTO
    totalWeight: number;
    paymentDetails: PaymentDetails; // AmwayPaymentDetailsWsDTO

    constructor() {}
}
