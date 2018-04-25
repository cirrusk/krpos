import { CartMessage, OrderEntry } from '../../model';

export class CartModification {
    statusCode: string;
    quantityAdded: number;
    quantity: number;
    entry: OrderEntry;
    deliveryModeChanged: boolean;
    statusMessage: string;
    messages: Array<CartMessage>;
    bundleDescription: any; // List<AmwayKitProductChildOrderEntryWsDTO>

    constructor() {

    }
}
