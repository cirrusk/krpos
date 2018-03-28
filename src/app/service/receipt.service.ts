import { Injectable } from "@angular/core";

import { EscPos } from './common/printer/helpers/escpos/escpos';
import { ReceiptDataProvider } from "./provider/receipt/receiptdata.provider";

enum ReceiptMapper {
    order = 'ordering_1'
}

@Injectable()
export class ReceiptService {

    constructor(private receitDataProvider: ReceiptDataProvider) {

    }

    public getOrderReceipt(data: any): string {
        let templateList: Array<string> = this.receitDataProvider.getReceiptTemplates(ReceiptMapper.order);

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

        return retText;
    }
}