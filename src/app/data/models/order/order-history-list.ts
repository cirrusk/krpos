import { OrderHistory, Sort, Pagination } from '../..';

export class OrderHistoryList {
    orders: Array<OrderHistory>;
    sorts: Array<Sort>;
    pagination: Pagination;

    constructor(_orders?: Array<OrderHistory>) {
        this.orders = _orders;
    }
}
