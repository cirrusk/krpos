import { AmwayValue, Price, ProductInfo, DeliveryMode, PointOfService } from '../..';
import { KitProductChildOrderEntry } from './cart-modification';

export class OrderEntry {
    entryNumber: number;
    quantity: number;
    basePrice: Price;
    totalPrice: Price;
    product: ProductInfo;
    updateable: boolean;
    deliveryMode: DeliveryMode; // DeliveryModeWsDTO
    deliveryPointOfService: PointOfService; // PointOfServiceWsDTO
    url: string;
    retailPrice: Price;
    pickupDateTime: Date;
    kitEntryCode: string;
    dispositionCode: any; // AmwayEnumData
    totalPriceInclTax: Price;
    isKitProductOrderEntry: boolean;
    totalTax: Price;
    bundleDescription: Array<KitProductChildOrderEntry>; // AmwayKitProductChildOrderEntryWsDTO
    kitEntryNumber: number;
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
    ecpConfirmQty: any; // Ecp 컨펌 (숫자, true='완료')
    rfids: Array<string>;
    serialNumbers: Array<string>;

    constructor(_product?: ProductInfo) {
        this.product = _product;
        this.ecpConfirmQty = '';
    }

    public set setEcpConfirmQty(data: any) {
        this.ecpConfirmQty = data;
    }

    public set setRfids(rfids: Array<string>) {
        this.rfids = rfids;
    }

    public set setSerialNumbers(serialNumbers: Array<string>) {
        this.serialNumbers = serialNumbers;
    }
}
