export interface ReceiptProductFieldInterface {
    idx: string;
    skuCode: string;
    productName: string;
    price: string;
    qty: string;
    totalPrice: string;
    giveAway: string;
}

export interface DiscountFieldInterface {
    name: string;
    price: string;
}

export interface EodFieldInterface {
    name: string;
    quantity: string;
    price: string;
}
