import { Customer } from './customer';
import { Balance } from '../payment/balance';

export class Accounts {
    accountType: string;
    accountTypeCode: string;
    name: string;
    status: string;
    totalBV: number;
    totalPV: number;
    uid: string;
    primaryParty: Customer; // CustomerWsDTO
    parties: Set<Customer>; // Set<CustomerWsDTO>
    balance: Array<Balance>; // 2018.06.21 사용자 balance 정보 추가

    constructor() {}
}
