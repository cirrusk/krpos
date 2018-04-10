export class CartEntry {
    code: string;
    name: string;
    qty: number;
    price: number;
    desc?: string;
    constructor(private _code?: string,
                private _name?: string,
                private _qty?: number,
                private _price?: number,
                private _desc?: string) {
    this.code = _code;
    this.name = _name;
    this.qty = _qty;
    this.price = _price;
    this.desc = _desc;
    }
}
