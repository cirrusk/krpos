import { Principal } from './principal';


export class User extends Principal {
    defaultAddress: any; // AddressWsDTO
    titleCode: string;
    title: string;
    firstName: string;
    lastName: string;
    currency: any; // CurrencyWsDTO
    language: any; // LanguageWsDTO
    displayUid: string;
    customerId: string;
    deactivationDate: Date;
    userGroups: Array<string>;
}
