import { AbstractOrder, Price, PaymentDetails } from '../..';
import { PointOfService } from '../common/point-of-service';

export class AmwayExtendedOrdering {
    orders: Array<AbstractOrder>;
    primaryOrder: string;
    totalValue: Price;
    shippingFee: Price;
    shippingFeeTax: Price;
    savings: Price;
    subtotal: Price;
    totalUnitCount: number;
    isPickUpCart: boolean;
    paymentDetails: PaymentDetails;
    deliveryPointOfService: PointOfService;
}
