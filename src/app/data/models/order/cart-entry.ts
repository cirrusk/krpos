export class CartEntry {
    entryNumber: number;
    code: string;
    name: string;
    qty: number;
    price: number;
    desc?: string;
    idx?: number;
    constructor(private _entryNumber?: number,
                private _code?: string,
                private _name?: string,
                private _qty?: number,
                private _price?: number,
                private _desc?: string) {
    this.entryNumber = _entryNumber;
    this.code = _code;
    this.name = _name;
    this.qty = _qty;
    this.price = _price;
    this.desc = _desc;
    }
}
