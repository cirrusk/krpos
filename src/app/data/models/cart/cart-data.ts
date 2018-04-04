import { AmwayValue } from './amway-value';
import { BasePrice } from './base-price';

/**
 * Add to Cart Response 객체 - CartModificationWsDTO
 *
 * null 로 되어 있어서 type을 알기 어려운 변수가 많음.
 */
export class CartData {
    statusCode: string;
    quantityAdded: number; // integer(int64)
    quantity: number;
    entry: Entry;
    deliveryModeChanged: boolean;
    statusMessage: string;
}

/**
 * Order Entry - OrderEntryWsDTO
 */
export class Entry {
    entryNumber: number; // integer(int32)
    quantity: number; // integer(int64)
    basePrice: BasePrice;
    totalPrice: TotalPrice;
    product: Product;
    updateable: boolean;
    deliveryMode: null; // DeliveryModeWsDTO
    deliveryPointOfService: null; // PointOfServiceWsDTO
    retailPrice: RetailPrice;
    pickupDateTime: string;
    aboBasePrice: number;
    retailBasePrice: number;
    proRatedPrice: number;
    margin: number;
    value: Value;
    skuversion: string;
    tes: string;
    kitEntryCode: string;
}

export class TotalPrice extends BasePrice { }

export class Value extends AmwayValue { }

/**
 * ProductWsDTO
 */
export class Product {
    code: string;
    name: string;
    url: string;
    description: string;
    purchasable: boolean;
    stock: Stock;
    futureStocks: null; // < FutureStockWsDTO > array
    availableForPickup: boolean;
    averageRating: number; // double
    numberOfReviews: number; // integer(int32)
    summary: string;
    manufacturer: string;
    variantType: string;
    price: Price;
    baseProduct: string;
    images: null; // < ImageWsDTO > array
    categories: null; // < CategoryWsDTO > array
    reviews: null; // < ReviewWsDTO > array
    classifications: null; // < ClassificationWsDTO > array
    potentialPromotions: null; // < PromotionWsDTO > array
    variantOptions: null; // < VariantOptionWsDTO > array
    baseOptions: null; // < BaseOptionWsDTO > array
    volumePricesFlag: boolean;
    volumePrices: null; // < PriceWsDTO > array
    productReferences: null; // < ProductReferenceWsDTO > array
    variantMatrix: string;
    priceRange: null; // PriceRangeWsDTO
    multidimensional: boolean;
    alias: string;
    weight: number; // double
    dimensions: null; // AmwayDimensionWsDTO
    productAttributes: string; // Map<String,String>
    onlineSince: string; // Date
    kitEntry: string; // Set<AmwayKitEntryProductWsDTO>
    kitPrice: number; // double
    retailPrice: RetailPrice; // PriceWsDTO
    deliveryModes: null; // List<DeliveryModeWsDTO>
}

export class Stock {
    stockLevelStatus: string;
    stockLevel: number; // integer(int64)
}

export class Price extends BasePrice { }

export class RetailPrice extends BasePrice { }
