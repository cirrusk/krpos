import { AmwayValue, Price, ProductInfo, DeliveryMode, PointOfService } from '../..';
import { KitProductChildOrderEntry } from './cart-modification';

export class OrderEntry {
    entryNumber: number;
    quantity: number;
    basePrice: Price; // 단가
    totalPrice: Price; // 총 가격
    product: ProductInfo;
    updateable: boolean;
    deliveryMode: DeliveryMode; // 배송 방법
    deliveryPointOfService: PointOfService; // 배송 지점
    url: string;
    originalPrice: Price;
    originalTax: Price;
    retailPrice: Price;
    pickupDateTime: Date;
    kitEntryCode: string;
    dispositionCode: any; // AmwayEnumData
    totalPriceInclTax: Price;
    isKitProductOrderEntry: boolean;
    totalTax: Price; // 세액
    bundleDescription: Array<KitProductChildOrderEntry>; // AmwayKitProductChildOrderEntryWsDTO
    kitEntryNumber: number; // 키트 항목 번호
    aboBasePrice: number;
    retailBasePrice: number;
    proRatedPrice: number;
    margin: any; // AmwayOrderMarginWsDTO
    value: AmwayValue;   // PV/BV
    skuversion: string;
    tes: string;
    quantityAllocated: number;   // 할당 수량
    quantityUnallocated: number; // 할당되지 않은 수량
    quantityCancelled: number;   // 취소 수량
    quantityPending: number;     // 보류 수량
    quantityShipped: number;     // 배송 수량
    quantityReturned: number;    // 반품 수량
    ecpConfirmQty: any; // Ecp 컨펌 (숫자, true='완료')
    serialNumbersCodes: Array<string>; // 시리얼 넘버 (RFID 포함)

    constructor(_product?: ProductInfo) {
        this.product = _product;
        this.ecpConfirmQty = '';
    }

    public set setEcpConfirmQty(data: any) {
        this.ecpConfirmQty = data;
    }

    public set setSerialNumbersCodes(serialNumbersCodes: Array<string>) {
        this.serialNumbersCodes = serialNumbersCodes;
    }
}
