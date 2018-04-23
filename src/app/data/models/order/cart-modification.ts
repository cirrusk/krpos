import { OrderEntry } from './order-entry';
export class CartModification {
    statusCode: string;
    statusMessage: string;
    quantityAdded: number;
    quantity: number;
    entry: OrderEntry;
    deliveryModeChanged: boolean;

    constructor() {

    }
}
