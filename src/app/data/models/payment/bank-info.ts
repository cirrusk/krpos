export class BankInfo {
    code: string;
    name: string;
    description: string;
    extraCode: string;
    bin: string;
    orgCode: string;
    summary: string;
    activeFrom: Date;
    activeTo: Date;
    installmentPlans: Array<InstallmentPlan>;
}

export class InstallmentPlan {
    code: string;
    name: string;
    period: number;
    noInterest: boolean;
    noInterestName: string;
    activeFrom: Date;
    activeTo: Date;
    displayName: string;
}
