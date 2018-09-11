export class EodInfo {
    eodData: EodData;
    constructor(eodData: EodData) {
        this.eodData = eodData;
    }
}
export class EodData {
    printDate: string;
    posNo: string;
    cashierName: string;
    cashierId: string;
    batchId: string;
    normalOrder: OrderEodData;
    mediateOrder: OrderEodData;
    memberOrder: OrderEodData;
    summaryOrder: OrderEodData;
    orderCancel: CancelEodData;
}

export class OrderEodData {
    credit: CcData;
    iccard: IcData;
    debit: DebitData;
    point: PointData;
    recash: ReCashData;
    cash: CashData;
    summary: SummaryData;
}

export class CancelEodData {
    orderCancel: OrderCancel;
    mediateCancel: MediateCancel;
    memberCancel: MemberCancel;
    summaryCancel: SummaryCancel;
}

export class BaseData {
    name: string;
    quantity: string;
    price: string;
    constructor(name: string, quantity: string, price: string) {
        this.name = name;
        this.quantity = quantity;
        this.price = price;
    }
}

export class CcData extends BaseData {
    constructor(quantity: string, price: string) {
        super('신용카드', quantity, price);
    }
}
export class IcData extends BaseData {
    constructor(quantity: string, price: string) {
        super('IC현금카드', quantity, price);
    }
}
export class DebitData extends BaseData {
    constructor(quantity: string, price: string) {
        super('자동이체', quantity, price);
    }
}
export class PointData extends BaseData {
    constructor(quantity: string, price: string) {
        super('A(M) 포인트', quantity, price);
    }
}
export class ReCashData extends BaseData {
    constructor(quantity: string, price: string) {
        super('Re-cash', quantity, price);
    }
}
export class CashData extends BaseData {
    constructor(quantity: string, price: string) {
        super('현금', quantity, price);
    }
}
export class SummaryData extends BaseData {
    constructor(quantity: string, price: string) {
        super('총', quantity, price);
    }
}
export class OrderCancel extends BaseData {
    constructor(quantity: string, price: string) {
        super('일반/그룹주문', quantity, price);
    }
}
export class MediateCancel extends BaseData {
    constructor(quantity: string, price: string) {
        super('중개주문', quantity, price);
    }
}
export class MemberCancel extends BaseData {
    constructor(quantity: string, price: string) {
        super('멤버/비회원주문', quantity, price);
    }
}
export class SummaryCancel extends BaseData {
    constructor(quantity: string, price: string) {
        super('총', quantity, price);
    }
}

