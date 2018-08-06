import { Order } from '../order/order';
import { Cart } from '../order/cart';
import { Accounts } from '../order/accounts';

export class ResponseData {
    result: string;
}

export class ResponseMessage {
    code: string;
    returnMessage: string;
    constructor(code: string, returnMessage?: string) {
        this.code = code;
        this.returnMessage = returnMessage;
    }
}

export class GroupResponseData {
    order: Order;
    cart: Cart;
    account: Accounts;
    info: string;
    constructor(order: Order, cart: Cart, account: Accounts, info: string) {
        this.order = order;
        this.cart = cart;
        this.account = account;
        this.info = info;
    }
}
