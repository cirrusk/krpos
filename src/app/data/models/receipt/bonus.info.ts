export class BonusInfoVO {
    ordering: any;
    sum: any;
    group: any;

    constructor(pv: number, bv: number) {
        this.ordering = {
            'PV': String(pv),
            'BV': String(bv)
        };
        this.sum = {
            'PV': '개인 PV 합',
            'BV': '개인 BV 합'
        };
        this.group = {
            'PV': '그룹 PV 합',
            'BV': '그룹 BV 합'
        }; 
    }
}