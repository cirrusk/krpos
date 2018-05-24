import { ConsignmentEntry, Address, PointOfService, DeliveryMode, PackagingInfo } from '../..';

export class Consignment {
    code: string;
    trackingID: string;
    status: string;
    statusDate: Date;
    entries: Array<ConsignmentEntry>;
    shippingAddress: Address;
    deliveryPointOfService: PointOfService;
    orderCode: string;
    shippingDate: Date;
    deliveryMode: DeliveryMode;
    warehouseCode: string;
    packagingInfo: PackagingInfo;

    constructor() {}
}
