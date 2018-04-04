import { AmwayValue } from './amway-value';
import { BasePrice } from './base-price';

export class CartData {
    statusCode: string;
    quantityAdded: number;
    quantity: number;
    entry: Entry;
    deliveryModeChanged: boolean;
    statusMessage: string;
}

export class Entry {
    entryNumber: number;
    quantity: number;
    basePrice: BasePrice;
    totalPrice: TotalPrice;
    product: Product;
    updateable: boolean;
    deliveryMode: string;
    deliveryPointOfService: string;
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

export class Product {
    code: string;
    name: string;
    url: string;
    description: string;
    purchasable: boolean;
    stock: Stock;
    futureStocks: number; // null,
    availableForPickup: boolean;
    averageRating: number; // null,
    numberOfReviews: number; // null,
    summary: string;
    manufacturer: string;
    variantType: string;
    price: Price;
    baseProduct: string;
    images: string;
    categories: string;
    reviews: string;
    classifications: string;
    potentialPromotions: string;
    variantOptions: string;
    baseOptions: string;
    volumePricesFlag: boolean;
    volumePrices: number;
    productReferences: string;
    variantMatrix: string;
    priceRange: number;
    multidimensional: string;
    alias: string;
    weight: number;
    dimensions: number;
    productAttributes: string;
    onlineSince: string;
    kitEntry: string;
    kitPrice: number;
    retailPrice: number;
    deliveryModes: string;
}

export class Stock {
    stockLevelStatus: string;
    stockLevel: number; // null
}

export class Price extends BasePrice { }

export class RetailPrice extends BasePrice { }
