import { Accounts } from './accounts';
import { PhoneContactInfo } from './phone-contact-info';

export class Customer {
    account: Accounts;
    customerID: string;
    dateOfBirth: Date;
    phoneInfos: Array<PhoneContactInfo>;
    constructor() {}
}
