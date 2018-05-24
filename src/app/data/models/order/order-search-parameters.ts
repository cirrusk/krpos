export class OrderSearchParameters {
    orderingABOId: string;
    orderingABOName: string;
    volumeABOId: string;
    volumeABOName: string;
    orderCode: string;
    orderDateFrom: string;
    orderDateTo: string;
    orderType: string;
    salesChannel: string;
    invoiceNo: string;

    constructor() {
        this.orderingABOId = '';
        this.orderingABOName = '';
        this.volumeABOId = '';
        this.volumeABOName = '';
        this.orderCode = '';
        this.orderDateFrom = '';
        this.orderDateTo = '';
        this.orderType = '';
        this.salesChannel = '';
        this.invoiceNo = '';
    }
}
