import { OrderEntry } from '../..';

export class ConsignmentEntry {
    orderEntry: OrderEntry;
    quantity: number;
    shippedQuantity: number;
    quantityDeclined: number;
    quantityPending: number;
    quantityShipped: number;

    constructor() {}
}
