export class BankAccount {
    accountNumber: string;
    typeCode: string;
    depositor: string;
    bankInfo: BankInfo;
}

export class BankInfo {
    bin: string;
    code: string;
    extraCode: string;
    name: string;
    orgCode: string;
}
