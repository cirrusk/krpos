// export class OrderData {
//     orderingABOId: string;
//     phoneNumber: string;
//     amwayBusinessNature: string;
//     orderTypes: Array<string>; // NORMAL_ORDER
//     salesChannels: Array<string>; // Web,WebMobile
//     deliveryModes: Array<string>; // delivery,install
//     statuses: Array<string>; // COMPLETE..
//     confirm: boolean;
//     currentPage: number;
//     pageSize: number;
//     orderCode: string;

//     constructor(_orderTypes?: Array<string>,
//         _salesChannels?: Array<string>,
//         _deliveryModes?: Array<string>,
//         _statuses?: Array<string>,
//         _amwayBusinessNature?: string,
//         _confirm?: boolean,
//         _currentPage?: number,
//         _pageSize?: number) {
//         this.orderTypes = _orderTypes;
//         this.salesChannels = _salesChannels;
//         this.deliveryModes = _deliveryModes;
//         this.statuses = _statuses;
//         this.amwayBusinessNature = _amwayBusinessNature;
//         this.confirm = _confirm;
//         this.currentPage = _currentPage;
//         this.pageSize = _pageSize;
//     }
// }


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
    sorts: string | Array<SortData>; // List<SortData>
    constructor(amwayBusinessNature: string, salesChannels?: Array<string>, orderTypes?: Array<string>,
        deliveryModes?: Array<string>, statuses?: Array<string>, confirm?: boolean, sorts?: string | Array<SortData>
    ) {
        this.amwayBusinessNature = amwayBusinessNature;
        this.salesChannels = salesChannels;
        this.orderTypes = orderTypes;
        this.deliveryModes = deliveryModes;
        this.statuses = statuses;
        this.confirm = confirm;
        if (Array.isArray(sorts)) {
            this.sorts = sorts;
        } else {
            const s: Array<SortData> = new Array<SortData>();
            s.push(new SortData(sorts, false));
            this.sorts = s;
        }
    }
    public set setOrderingABOId(orderingABOId: string) {
        this.orderingABOId = orderingABOId;
    }
    public set setOrderCode(orderCode: string) {
        this.orderCode = orderCode;
    }
    public set setPhoneNumber(phoneNumber: string) {
        this.phoneNumber = phoneNumber;
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
