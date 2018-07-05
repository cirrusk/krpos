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

export class SerialRfid {
    productName: string;
    type: string;
    hasSerial: boolean;
    hasRfid: boolean;
    entryNumber: number;
    constructor(productName: string, type: string, hasSerial: boolean, hasRfid: boolean, entryNumber: number) {
        this.productName = productName;
        this.type = type;
        this.hasSerial = hasSerial;
        this.hasRfid = hasRfid;
        this.entryNumber = entryNumber;
    }
}
