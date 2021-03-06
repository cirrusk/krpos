export class Balance {
    type: string; /* BalanceType */
    amount: number;
    pointValue: number;
    businessVolume: number;
    customer: any;
    historyEntries: any;
}

export class PointReCash {
    point: Balance;
    recash: Balance;
    constructor(point: Balance, recash: Balance) {
        this.point = point;
        this.recash = recash;
    }
}

export class GroupBalance {
    uid: string;
    point: Balance;
    constructor(uid: string, point: Balance) {
        this.uid = uid;
        this.point = point;
    }
}
