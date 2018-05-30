import { Injectable } from '@angular/core';
import { ReceiptDataProvider, EscPos } from '../core';
import { ReceiptTypeEnum } from '../data/receipt/receipt.enum';

@Injectable()
export class ReceiptService {

    constructor(private receitDataProvider: ReceiptDataProvider) { }

    public aboNormal(data: any): string {
        return this.getReceipt(data, ReceiptTypeEnum.ABONormal);
    }

    public memberNormal(data: any): string {
        return this.getReceipt(data, ReceiptTypeEnum.MemberNormal);
    }

    public consumerNormal(data: any): string {
        return this.getReceipt(data, ReceiptTypeEnum.ConsumerNormal);
    }

    private getReceipt(data: any, format: ReceiptTypeEnum): string {
        const templateList: Array<string> = this.receitDataProvider.getReceiptTemplates(format);

        let retText = '';

        templateList.forEach((templateName) => {
            const templateText = this.receitDataProvider.getTemplateText(templateName);
            const parsed = EscPos.getParsed(templateText, data);

            const isCompiled = this.receitDataProvider.isPrecompiled(templateName);

            if (isCompiled) {
                retText += EscPos.unescapeNull(parsed);
            } else {
                const transformed = EscPos.getTransformed(parsed);
                retText += transformed;
            }

        });

        return EscPos.unescapeLeadingSpace(retText);
    }
}
