import { Customer } from './customer';

export class Accounts {
    accountType: string;
    name: string;
    status: string;
    totalBV: number;
    totalPV: number;
    uid: string;
    primaryParty: Customer; // CustomerWsDTO
    parties: Set<Customer>; // Set<CustomerWsDTO>

    constructor() {}
}

