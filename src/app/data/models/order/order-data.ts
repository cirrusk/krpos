export class OrderData {
    orderTypes: Array<string>; // NORMAL_ORDER
    channels: Array<string>; // Web,WebMobile
    deliveryModes: Array<string>; // delivery,install
    currentPage: number;
    pageSize: number;

    constructor(_orderTypes?: Array<string>,
                _channels?: Array<string>,
                _deliveryModes?: Array<string>,
                _currentPage?: number,
                _pageSize?: number) {
        this.orderTypes = _orderTypes;
        this.channels = _channels;
        this.deliveryModes = _deliveryModes;
        this.currentPage = _currentPage;
        this.pageSize = _pageSize;
    }
}
