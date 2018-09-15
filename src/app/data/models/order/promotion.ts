import { Product } from '../cart/cart-data';
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

export class PromotionDiscount {
    promotionCode: string;
    promotionDescription: string;
    quantity: number;
    discount: number; // BigDecimal
    entryNumber: number;
    freeGift: boolean;
    taxDiscount: number; // BigDecimal
}

export class PromotionViews {
    promotionItems: Array<PromotionItems>;
    constructor(promotionItems?: Array<PromotionItems>) {
        this.promotionItems = promotionItems;
    }
}

export class PromotionItems {
    promotion1: PromotionData;
    promotion2: PromotionData;
    constructor(promotion1: PromotionData, promotion2: PromotionData) {
        this.promotion1 = promotion1;
        this.promotion2 = promotion2;
    }
}

export class PromotionData {
    name: string;
    desc: string;
    constructor(name: string, desc: string) {
        this.name = name;
        this.desc = desc;
    }
}
