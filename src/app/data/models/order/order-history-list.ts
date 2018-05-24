import { OrderHistory, Sort, Pagination } from '../..';

export class OrderHistoryList {
    orders: Array<OrderHistory>;
    sorts: Array<Sort>;
    pagination: Pagination;

    constructor() {}
}
