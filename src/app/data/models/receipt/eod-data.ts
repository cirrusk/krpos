import { EodDataResult } from "../common/eod-data-result";

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
    normalOrder: OrderEodData;  // NORMAL
    mediateOrder: OrderEodData; // ARRANGEMENT
    memberOrder: OrderEodData;  // MEMBER
    summaryOrder: OrderEodData; // TOTAL
    orderCancel: CancelEodData; // CANCEL
    public set setNormalOrder(normalOrder: OrderEodData) {
        this.normalOrder = normalOrder;
    }
    public set setMediateOrder(mediateOrder: OrderEodData) {
        this.mediateOrder = mediateOrder;
    }
    public set setMemberOrder(memberOrder: OrderEodData) {
        this.memberOrder = memberOrder;
    }
    public set setSummaryOrder(summaryOrder: OrderEodData) {
        this.summaryOrder = summaryOrder;
    }
    public set setOrderCancel(orderCancel: CancelEodData) {
        this.orderCancel = orderCancel;
    }
}

export class OrderEodData {
    credit: CcData;
    iccard: IcData;
    debit: DebitData;
    point: PointData;
    recash: ReCashData;
    cash: CashData;
    summary: SummaryData;
    constructor(eodData?: EodDataResult) {
        if (eodData) {
            this.credit = new CcData(eodData.countOfCreditCard, eodData.sumOfCreditCard);
            this.iccard = new IcData(eodData.countOfICCard, eodData.sumOfICCard);
            this.debit = new DebitData(eodData.countOfDirectDebit, eodData.sumOfDirectDebit);
            this.point = new PointData(eodData.countOfPoint, eodData.sumOfPoint);
            this.recash = new ReCashData(eodData.countOfArCredit, eodData.sumOfArCredit);
            this.cash = new CashData(eodData.countOfCash, eodData.sumOfCash);
            let sumCount = 0
            let sumPrice = 0;
            Object.keys(eodData).forEach((key) => {
                if (key.startsWith('countOf')) {
                    sumCount += eodData[key];
                } else if (key.startsWith('sumOf')) {
                    sumPrice += eodData[key];
                }
            });
            this.summary = new SummaryData(sumCount, sumPrice);
        }
    }
}

export class CancelEodData {
    orderCancel: OrderCancel;
    mediateCancel: MediateCancel;
    memberCancel: MemberCancel;
    summaryCancel: SummaryCancel;
    constructor(eodData?: EodDataResult) {
        if (eodData) {
            this.orderCancel = new OrderCancel(eodData.countOfNormalOrder, eodData.sumOfNormalOrder);
            this.mediateCancel = new MediateCancel(eodData.countOfArrangementOrder, eodData.sumOfArrangementOrder);
            this.memberCancel = new MemberCancel(eodData.countOfMemberOrder, eodData.sumOfMemberOrder);
            let sumCount = 0
            let sumPrice = 0;
            Object.keys(eodData).forEach((key) => {
                if (key.startsWith('countOf')) {
                    sumCount += eodData[key];
                } else if (key.startsWith('sumOf')) {
                    sumPrice += eodData[key];
                }
            });
            this.summaryCancel = new SummaryCancel(sumCount, sumPrice);
        }
    }
}

export class BaseData {
    name: string;
    quantity: string;
    price: string;
    constructor(name: string, quantity: number, price: number) {
        this.name = name;
        this.quantity = String(quantity);
        this.price = String(price);
    }
}

export class CcData extends BaseData {
    constructor(quantity: number, price: number) {
        super('신용카드', quantity, price);
    }
}
export class IcData extends BaseData {
    constructor(quantity: number, price: number) {
        super('IC현금카드', quantity, price);
    }
}
export class DebitData extends BaseData {
    constructor(quantity: number, price: number) {
        super('자동이체', quantity, price);
    }
}
export class PointData extends BaseData {
    constructor(quantity: number, price: number) {
        super('A(M) 포인트', quantity, price);
    }
}
export class ReCashData extends BaseData {
    constructor(quantity: number, price: number) {
        super('Re-cash', quantity, price);
    }
}
export class CashData extends BaseData {
    constructor(quantity: number, price: number) {
        super('현금', quantity, price);
    }
}
export class SummaryData extends BaseData {
    constructor(quantity: number, price: number) {
        super('총', quantity, price);
    }
}
export class OrderCancel extends BaseData {
    constructor(quantity: number, price: number) {
        super('일반/그룹주문', quantity, price);
    }
}
export class MediateCancel extends BaseData {
    constructor(quantity: number, price: number) {
        super('중개주문', quantity, price);
    }
}
export class MemberCancel extends BaseData {
    constructor(quantity: number, price: number) {
        super('멤버/비회원주문', quantity, price);
    }
}
export class SummaryCancel extends BaseData {
    constructor(quantity: number, price: number) {
        super('총', quantity, price);
    }
}

