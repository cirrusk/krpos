export class OrderData {
    orderingABOId: string;
    phoneNumber: string;
    amwayBusinessNature: string;
    orderTypes: Array<string>; // NORMAL_ORDER
    salesChannels: Array<string>; // Web,WebMobile
    deliveryModes: Array<string>; // delivery,install
    confirm: boolean;
    currentPage: number;
    pageSize: number;

    constructor(_orderTypes?: Array<string>,
                _salesChannels?: Array<string>,
                _deliveryModes?: Array<string>,
                _amwayBusinessNature?: string,
                _confirm?: boolean,
                _currentPage?: number,
                _pageSize?: number) {
        this.orderTypes = _orderTypes;
        this.salesChannels = _salesChannels;
        this.deliveryModes = _deliveryModes;
        this.amwayBusinessNature = _amwayBusinessNature;
        this.confirm = _confirm;
        this.currentPage = _currentPage;
        this.pageSize = _pageSize;
    }
}
