export class Accounts {
    accountType: string;
    name: string;
    status: string;
    totalBV: number;
    totalPV: number;
    uid: string;
    primaryParty: any; // CustomerWsDTO
    parties: any; // Set<CustomerWsDTO>

    constructor() {}
}

