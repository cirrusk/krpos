export class BankAccount {
    accountNumber: string;
    typeCode: string;
    depositor: string;
    bankInfo: BankInfo;
}

export class BankInfo {
    code: string;
    name: string;
}
