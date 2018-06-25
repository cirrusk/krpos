export class BonusInfo {
    protected ordering: Bonus;
    protected sum: Bonus;
    protected group: Bonus;
    protected aPoint: string;
    protected memberPoint: string;
    public set setOrdering(ordering: Bonus) {
        this.ordering = ordering;
    }
    public set setSum(sum: Bonus) {
        this.sum = sum;
    }
    public set setGroup(group: Bonus) {
        this.group = group;
    }
    public set setAPoint(aPoint: string) {
        this.aPoint = aPoint;
    }
    public set setMemberPoint(memberPoint: string) {
        this.memberPoint = memberPoint;
    }
}

export class Bonus {
    protected PV: string;
    protected BV: string;
    constructor(PV: string, BV: string) {
        this.PV = PV;
        this.BV = BV;
    }
}
