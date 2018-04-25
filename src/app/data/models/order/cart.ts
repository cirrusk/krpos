import { AbstractOrder, Principal } from '../..';


export class Cart extends AbstractOrder {
    totalUnitCount: number;
    potentialOrderPromotions: any; // List<PromotionResultWsDTO>
    potentialProductPromotions: any; // List<PromotionResultWsDTO>
    name: string;
    description: string;
    expirationTime: Date;
    saveTime: Date;
    savedBy: Principal;

    constructor() {
        super();
    }

}
