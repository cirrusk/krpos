export class OrderData {
    orderTypes: Array<string>; // NORMAL_ORDER
    channels: Array<string>; // Web,WebMobile
    deliveryModes: Array<string>; // delivery,install
    currentPage: number;
    pageSize: number;
}
