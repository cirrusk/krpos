import { OrderEntries } from './order-entries';

export class OrderParams {
    orderEntries: OrderEntries[];
    constructor(orderEntries?: OrderEntries[]) {
        this.orderEntries = orderEntries;
    }
}
