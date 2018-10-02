import { AbstractOrder, Consignment, OrderEntry, Address, Enumeration, CartModification } from '../..';
import { Price } from './price';
import { PaymentDetails } from '../payment/payment-details';
import { PointOfService } from '../common/point-of-service';
import { Receipt } from '../receipt/receipt-info';

export class Order extends AbstractOrder {
    created: Date;
    status: string;
    statusDisplay: string;
    guestCustomer: boolean;
    consignments: Array<Consignment>;
    deliveryStatus: string;
    deliveryStatusDisplay: string;
    unconsignedEntries: Array<OrderEntry>;
    paymentAddress: Address;
    totalUnitCount: number;
    deductionNumber: string;                // Mac&Co
    receiptInfo: Receipt;                   // ReceiptWsDTO
    cartModifications: Array<CartModification>;
    promotionResultActions: Array<PromotionResultAction>; // 프로모션 할인 정보
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

export class PromotionResultAction {
    code: string;
    name: string;
    amount: number;
    bonusPointValue: number;
    bonusBusinessVolume: number;
    totalExtraPrice: number;
    orderEntryQuantity: number;
    isProductPromotion: boolean;
}
