import { CartMessage, OrderEntry } from '../..';

export class CartModification {
    statusCode: string;
    quantityAdded: number;
    quantity: number;
    entry: OrderEntry;
    deliveryModeChanged: boolean;
    statusMessage: string;
    messages: Array<CartMessage>;
    bundleDescription: Array<KitProductChildOrderEntry>; // List<AmwayKitProductChildOrderEntryWsDTO>

    constructor() {

    }
}

export class KitProductChildOrderEntry {
    productCode: string;
    name: string;
    quantity: number;
}
