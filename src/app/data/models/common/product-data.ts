export class ProductData {
    constructor(private _code: string,
        private _name: string,
        private _price: number,
        private _qty: number,
        private _barcode: string) { }
        public get code(): string {
            return this._code;
        }

    public get name(): string {
        return this._name;
    }

    public get price(): number {
        return this._price;
    }

    public get qty(): number {
        return this._qty;
    }

    public get barcode(): string {
        return this._barcode;
    }

    public toString(): string {
        return `code: ${this.code}, name: ${this.name}, price: ${this.price}, qty: ${this.qty}, barcode: ${this.barcode}`;
    }

}
