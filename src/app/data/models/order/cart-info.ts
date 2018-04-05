import { Price } from './price';
import { Principal } from './principal';
import { Accounts } from './accounts';

export class CartInfo {
    type: string;
    code: string;
    totalWeight: number;
    totalPrice: Price;
    user: Principal;
    guid: string;
    volumeABOAccount: Accounts;

    constructor( _type?: string,
        _code?: string,
        _totalWeight?: number,
        _totalPrice?: Price,
        _user?: Principal,
        _guid?: string,
        _volumeABOAccount?: Accounts) {
        this.type = _type;
        this.code = _code;
        this.totalWeight = _totalWeight;
        this.totalPrice = _totalPrice;
        this.user = _user;
        this.guid = _guid;
        this.volumeABOAccount = _volumeABOAccount;
    }
}
