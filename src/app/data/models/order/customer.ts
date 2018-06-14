import { Accounts } from './accounts';
import { PhoneContactInfo } from './phone-contact-info';
import { BankAccount } from './bank-account';

export class Customer {
    account: Accounts;
    customerID: string;
    dateOfBirth: Date;
    phoneInfos: Array<PhoneContactInfo>;
    bankAccounts: Array<BankAccount>;
    constructor() {}
}
