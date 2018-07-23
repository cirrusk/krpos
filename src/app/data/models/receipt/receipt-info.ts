import { OrderInfo } from './order-info';
import { BonusInfo } from './bonus-info';
import { PaymentInfo } from './payment-info';
import { PriceInfo } from './price-info';
import { ProductsEntryInfo } from './products-entry-info';
import { Enumeration } from '../common/enumeration';
import { Customer } from '../order/customer';

export class ReceiptInfo {
    orderInfo: OrderInfo;
    bonus: BonusInfo;
    payments: PaymentInfo;
    price: PriceInfo;
    productList: Array<ProductsEntryInfo>;
    public set setOrderInfo(orderInfo: OrderInfo) {
        this.orderInfo = orderInfo;
    }
    public set setBonus(bonus: BonusInfo) {
        this.bonus = bonus;
    }
    public set setPayments(payments: PaymentInfo) {
        this.payments = payments;
    }
    public set setPrice(price: PriceInfo) {
        this.price = price;
    }
    public set setProductList(productList: Array<ProductsEntryInfo>) {
        this.productList = productList;
    }

    constructor(orderInfo?: OrderInfo, bonus?: BonusInfo, payments?: PaymentInfo, price?: PriceInfo, productList?: Array<ProductsEntryInfo>) {
        this.orderInfo = orderInfo;
        this.bonus = bonus;
        this.payments = payments;
        this.price = price;
        this.productList = productList;
    }
}

export class Receipt {
    receiptType: string; // ReceiptType //NO, TAX, CASH
    receiptTypeData: Enumeration; // EnumerationWsDTO
    receiptIssuanceType: string; // ReceiptIssuanceType // INCOME_DEDUCTION, EXPENDITURE_PROOF
    receiptNumberType: string; // ReceiptNumberType // CPN, CDN, BRN
    receiptIssuanceNumber: string;
    receiptNumber: string;
    businessEntityRegistration: BusinessEntry; // BusinessEntityRegistrationWsDTO
    printInvoicePrice: boolean;
    printInvoicePvBv: boolean;
}

export class BusinessEntry {
    code: string;
    company: string;
    number: string;
    name: string;
    creationtime: Date;
    addressText: string;
    businessType: string;
    businessItem: string;
    recipient: string;
    recipientMobile: string;
    recipientAgreeSms: boolean;
    recipientEmail: string;
    sellerMobile: string;
    sellerAgreeSms: boolean;
    sellerEmail: string;
    customer: Customer; // CustomerWsDTO
}
