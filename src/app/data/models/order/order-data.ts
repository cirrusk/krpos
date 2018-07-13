export class OrderData {
    orderingABOId: string;
    phoneNumber: string;
    amwayBusinessNature: string;
    orderTypes: Array<string>; // NORMAL_ORDER
    salesChannels: Array<string>; // Web,WebMobile
    deliveryModes: Array<string>; // delivery,install
    statuses: Array<string>; // COMPLETE..
    confirm: boolean;
    currentPage: number;
    pageSize: number;
    orderCode: string;

    constructor(_orderTypes?: Array<string>,
                _salesChannels?: Array<string>,
                _deliveryModes?: Array<string>,
                _statuses?: Array<string>,
                _amwayBusinessNature?: string,
                _confirm?: boolean,
                _currentPage?: number,
                _pageSize?: number) {
        this.orderTypes = _orderTypes;
        this.salesChannels = _salesChannels;
        this.deliveryModes = _deliveryModes;
        this.statuses = _statuses;
        this.amwayBusinessNature = _amwayBusinessNature;
        this.confirm = _confirm;
        this.currentPage = _currentPage;
        this.pageSize = _pageSize;
    }
}
