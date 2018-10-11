export class EodDataResult {
    countOfArCredit: number;
    countOfCash: number;
    countOfCreditCard: number;
    countOfDeposit: number;
    countOfDirectDebit: number;
    countOfICCard: number;
    countOfPoint: number;
    sumOfArCredit: number;
    sumOfCash: number;
    sumOfCreditCard: number;
    sumOfDeposit: number;
    sumOfDirectDebit: number;
    sumOfICCard: number;
    sumOfPoint: number;

    countOfArrangementOrder: number;
    countOfMemberOrder: number;
    countOfNormalOrder: number;
    sumOfArrangementOrder: number;
    sumOfMemberOrder: number;
    sumOfNormalOrder: number;

    typeOfOrder: string;
}

export class EodDataResultList {
    orderFactResults: Array<EodDataResult>; // OrderFactResultListWsDTO
}
