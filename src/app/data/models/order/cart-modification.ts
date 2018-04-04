import { OrderEntry } from './order-entry';
export class CartModification {
    statusCode: string;
    quantityAdded: number;
    quantity: number;
    entry: OrderEntry;

    constructor() {

    }
}
