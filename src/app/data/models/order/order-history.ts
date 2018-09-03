import { Price, Principal, Enumeration, Accounts, AmwayValue } from '../..';
export class OrderHistory {
    code: string;
    status: string;
    statusDisplay: Date;
    placed: Date;
    guid: string;
    total: Price;
    groupOrderId: string;
    combinedOrderId: string;
    user: Principal;
    deliveryMode: any; // DeliveryModeWsDTO
    orderStatus: Enumeration; // EnumerationWsDTO
    orderType: Enumeration;  // EnumerationWsDTO
    channel: Enumeration;
    amwayAccount: Accounts;
    volumeAccount: Accounts;
    amwayValue: AmwayValue;
    id: string;
    warehouseCode: string;
    invoiceNumber: string;
    cancellable: boolean;
    parentOrder: string;
    isGroupCombinationOrder: boolean;
    isArrangementSalesOrder: boolean;

    constructor() {}
}
