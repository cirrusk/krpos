import { Product } from './../cart/cart-data';
import { Price } from './price';

export class PromotionList {
    description: string;
    promotion: Promotion;
    consumedEntries: any; // List<PromotionOrderEntryConsumedWsDTO>
}

export class Promotion {
    code: string;
    title: string;
    promotionType: string;
    startDate: Date;
    endDate: Date;
    description: string;
    couldFireMessages: Array<string>;
    firedMessages: Array<string>;
    productBanner: any; // ImageWsDTO
    enabled: boolean;
    priority: number;
    promotionGroup: string;
    restrictions: Array<PromotionRestriction>; // Collection<PromotionRestrictionWsDTO>
    name: string;
    promotionPrice: Price;
    totalPrice: Price;
    premiumItemSet: Array<PromotionPremiumItemSet>; // List<AmwayPromotionPremiumItemSetWsDTO>
}

export class PromotionRestriction {
    restrictionType: string;
    description: string;
}

export class PromotionPremiumItemSet {
    code: string;
    premiumItems: Array<PromotionPremiumItem>;
}

export class PromotionPremiumItem {
    product: Product;
    formattedTargetPrice: string;
    targetPV: number; // double
    targetBV: number; // double
}
