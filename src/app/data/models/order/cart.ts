import { AbstractOrder, Principal, Price } from '../..';
import { PromotionList } from './promotion';


export class Cart extends AbstractOrder {
    totalUnitCount: number;
    potentialOrderPromotions: Array<PromotionList>; // List<PromotionResultWsDTO>
    potentialProductPromotions: Array<PromotionList>; // List<PromotionResultWsDTO>
    name: string;
    description: string;
    expirationTime: Date;
    saveTime: Date;
    savedBy: Principal;
    groupOrderMainPrice: Price;                       // 그룹주문 Main 결제금액을 출력을 위해 생성
    groupTotalDiscountWithTax: Price;                 // 그룹주문 Main 할인금액을 출력을 위해 생성

    constructor() {
        super();
    }

}
