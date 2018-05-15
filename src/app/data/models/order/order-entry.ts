import { AmwayValue, Price, ProductInfo } from '../..';

export class OrderEntry {
    entryNumber: number;
    quantity: number;
    basePrice: Price;
    totalPrice: Price;
    product: ProductInfo;
    updateable: boolean;
    deliveryMode: any; // DeliveryModeWsDTO
    deliveryPointOfService: any; // PointOfServiceWsDTO
    url: string;
    retailPrice: Price;
    pickupDateTime: Date;
    kitEntryCode: string;
    dispositionCode: any; // AmwayEnumData
    totalPriceInclTax: Price;
    isKitProductOrderEntry: boolean;
    totalTax: Price;
    aboBasePrice: number;
    retailBasePrice: number;
    proRatedPrice: number;
    margin: any; // AmwayOrderMarginWsDTO
    value: AmwayValue;
    skuversion: string;
    tes: string;
    quantityAllocated: number;
    quantityUnallocated: number;
    quantityCancelled: number;
    quantityPending: number;
    quantityShipped: number;
    quantityReturned: number;

    constructor(_product?: ProductInfo) {
        this.product = _product;
    }
}
