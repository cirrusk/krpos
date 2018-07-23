import { AbstractOrder, Principal } from '../..';
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

    constructor() {
        super();
    }

}
