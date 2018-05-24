import { AbstractOrder, Consignment, OrderEntry, Address, Enumeration } from '../..';

export class Order extends AbstractOrder {
    created: Date;
    status: string;
    statusDisplay: string;
    guestCustomer: boolean;
    consignments: Array<Consignment>;
    deliveryStatus: string;
    deliveryStatusDisplay: string;
    unconsignedEntries: Array<OrderEntry>;
    paymentAddress: Address;
    channel: Enumeration;
    orderPeriodStartDate: Date;
    bonusPeriodStartDate: Date;
    totalUnitCount: number;

    constructor() {
        super();
    }
}
