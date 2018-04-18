import { Accounts } from './accounts';

export class AccountList {
    accounts: Accounts[];
    constructor(_accounts?: Accounts[]) {
        this.accounts = _accounts;
    }
}
