import { BasePrice } from './base-price';
import { Pagination } from '../common/pagination';
import { AmwayValue } from '../common/amway-value';

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
    deliveryMode: any; // DeliveryModeWsDTO
    deliveryPointOfService: any; // PointOfServiceWsDTO
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

export class Products {
    pagination: Pagination;
    products: Product[];
}

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
    futureStocks: any; // < FutureStockWsDTO > array
    availableForPickup: boolean;
    averageRating: number; // double
    numberOfReviews: number; // integer(int32)
    summary: string;
    vpsCode: string; // add 2018.04.20
    manufacturer: string;
    variantType: string;
    price: Price;
    baseProduct: string;
    images: any; // < ImageWsDTO > array
    categories: any; // < CategoryWsDTO > array
    reviews: any; // < ReviewWsDTO > array
    classifications: any; // < ClassificationWsDTO > array
    potentialPromotions: any; // < PromotionWsDTO > array
    variantOptions: any; // < VariantOptionWsDTO > array
    baseOptions: any; // < BaseOptionWsDTO > array
    volumePricesFlag: boolean;
    volumePrices: any; // < PriceWsDTO > array
    productReferences: any; // < ProductReferenceWsDTO > array
    variantMatrix: string;
    priceRange: any; // PriceRangeWsDTO
    multidimensional: boolean;
    alias: string;
    weight: number; // double
    dimensions: any; // AmwayDimensionWsDTO
    productAttributes: string; // Map<String,String>
    onlineSince: string; // Date
    kitEntry: string; // Set<AmwayKitEntryProductWsDTO>
    kitPrice: number; // double
    retailPrice: RetailPrice; // PriceWsDTO
    deliveryModes: any; // List<DeliveryModeWsDTO>
    sellableStatus: string;
}

export class Stock {
    stockLevelStatus: string;
    stockLevel: number; // integer(int64)
}

export class Price extends BasePrice { }

export class RetailPrice extends BasePrice { }
