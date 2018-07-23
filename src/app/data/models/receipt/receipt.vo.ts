import { OrderInfoVO } from './order.info';
import { BonusInfoVO } from './bonus.info';
import { PaymentsVO } from './payments';
import { PriceVO } from './price';
import { ProductEntryVO } from './product';

export class ReceiptVO {
    orderInfo: OrderInfoVO;
    bonus: BonusInfoVO;
    payments: PaymentsVO;
    price: PriceVO;
    productList: Array<ProductEntryVO>;

    constructor(orderInfo: OrderInfoVO,
                bonus: BonusInfoVO,
                payments: PaymentsVO,
                price: PriceVO,
                productList?: Array<ProductEntryVO>) {
        this.orderInfo = orderInfo;
        this.bonus = bonus;
        this.payments = payments;
        this.price = price;
        this.productList = productList;
    }

    public addProduct(product: ProductEntryVO) {
        this.productList.push(product);
    }
}
