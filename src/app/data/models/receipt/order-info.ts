/**
 * posId : POS 아이디
 * number : 주문번호
 * type : 주문유형(default 현장구매)
 */
export class OrderInfo {
    protected posId: string;
    protected number: string; // orderCode
    protected cashier: Cashier;
    protected macAndCoNum: string;
    protected type: string;
    protected account: Account;
    protected date: string;
    protected cancelFlag: string;
    protected groupInfo: string;
    protected cashReceipt: boolean;
    protected healthFood: string;
    protected pickupDate: string;
    public set setCashier(cashier: Cashier) {
        this.cashier = cashier;
    }
    public set setMacAndCoNum(macAndCoNum: string) {
        this.macAndCoNum = macAndCoNum;
    }
    public set setType(type: string) {
        this.type = type;
    }
    public set setAccount(account: Account) {
        this.account = account;
    }
    public set setDate(date: string) {
        this.date = date;
    }
    public set setCancelFlag(_cancelFlag: string) {
        this.cancelFlag = _cancelFlag;
    }
    public set setGroupInfo(_groupInfo: string) {
        this.groupInfo = _groupInfo;
    }
    public set setCashReceipt(cashReceipt: boolean) {
        this.cashReceipt = cashReceipt;
    }
    public set setHealthFood(healthFood: string) {
        this.healthFood = healthFood;
    }
    public set setPickupDate(pickupDate: string) {
        this.pickupDate = pickupDate;
    }
    constructor(posId: string, number: string, type?: string, macAndCoNum?: string) {
        this.posId = posId;
        this.number = number;
        this.type = type || '현장구매';
        this.macAndCoNum = macAndCoNum || '';
    }
}

export class Cashier {
    ad: string;
    lastName: string;
    firstName: string;
    constructor(ad: string, firstName: string, lastName?: string) {
        this.ad = ad;
        this.firstName = firstName;
    }
}

export class Account {
    abo: AccountInfo;
    member: AccountInfo;
    public set setAbo(abo: AccountInfo) {
       this.abo = abo;
    }
    public set setMember(member: AccountInfo) {
        this.member = member;
    }
    constructor(abo?: AccountInfo, member?: AccountInfo) {
        this.abo = abo;
        this.member = member;
    }
}

export class AccountInfo {
    id: string;
    name: string;
    constructor(id: string, name: string) {
        this.id = id;
        this.name = name;
    }
}
