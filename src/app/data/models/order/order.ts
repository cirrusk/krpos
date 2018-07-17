import { AbstractOrder, Consignment, OrderEntry, Address, Enumeration } from '../..';
import { Price } from './price';
import { PaymentDetails } from '../payment/payment-details';
import { PointOfService } from '../common/point-of-service';

export class Order extends AbstractOrder {
    created: Date;
    date: Date;
    status: string;
    statusDisplay: string;
    guestCustomer: boolean;
    consignments: Array<Consignment>;
    deliveryStatus: string;
    deliveryStatusDisplay: string;
    unconsignedEntries: Array<OrderEntry>;
    paymentAddress: Address;
    channel: Enumeration;
    orderPeriodStartDate: Date;
    bonusPeriodStartDate: Date;
    totalUnitCount: number;

    constructor() {
        super();
    }
}

export class OrderList {
    orders: Array<Order>;
}

/**
 * AmwayExtendedOrderingWsDTO
 */
export class GroupOrder {
    orders: Array<AbstractOrder>;
    primaryOrder: string;
    totalValue: Price; // PriceWsDTO
    shippingFee: Price;
    shippingFeeTax: Price;
    savings: Price;
    subtotal: Price;
    totalUnitCount: number;
    isPickUpCart: boolean;
    paymentDetails: PaymentDetails; // AmwayPaymentDetailsWsDTO
    deliveryPointOfService: PointOfService; // PointOfServiceWsDTO
}
