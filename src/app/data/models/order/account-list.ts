import { Accounts } from './accounts';
import { ResponseMessage } from '../common/response-data';

export class AccountList {
    accounts: Accounts[];
    message: ResponseMessage;
    constructor(_accounts?: Accounts[]) {
        this.accounts = _accounts;
    }
}
