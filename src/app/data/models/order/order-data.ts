export class OrderData {
    orderingABOId: string;
    volumeABOId: string;
    orderCode: string;
    deliveryModes: Array<string>; // delivery,install
    orderTypes: Array<string>; // NORMAL_ORDER
    statuses: Array<string>;
    salesChannels: Array<string>; // Web,WebMobile
    searchType: any; // HistorySearchType : VPS_CODE, ORDER_NUMBER,	PRODUCT_NAME, SKU_NUMBER
    phoneNumber: string;
    confirm: boolean;
    amwayBusinessNature: string;
    isEasyPickupOrder: boolean;
    sorts: string | Array<SortData>; // List<SortData>
    pickupStore: string;
    constructor(amwayBusinessNature: string, salesChannels?: Array<string>, orderTypes?: Array<string>,
        deliveryModes?: Array<string>, statuses?: Array<string>, confirm?: boolean,
        isEasyPickupOrder?: boolean, sorts?: string | Array<SortData>,
        pickupStore?: string
    ) {
        this.amwayBusinessNature = amwayBusinessNature;
        this.salesChannels = salesChannels;
        this.orderTypes = orderTypes;
        this.deliveryModes = deliveryModes;
        this.statuses = statuses;
        this.confirm = confirm;
        this.isEasyPickupOrder = isEasyPickupOrder;
        if (Array.isArray(sorts)) {
            this.sorts = sorts;
        } else {
            sorts = sorts || 'code';
            const s: Array<SortData> = new Array<SortData>();
            s.push(new SortData(sorts, false));
            this.sorts = s;
        }
        this.pickupStore = pickupStore;
    }
}

export class SortData {
    code: string;
    asc: boolean;
    constructor(code: string, asc: boolean) {
        this.code = code;
        this.asc = asc;
    }
}
