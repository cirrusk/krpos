import { Injectable } from '@angular/core';

import { ReceiptDataProvider } from './../core/provider/receipt-data-provider';
import { EscPos } from './../core/peripheral/model/helper/escpos/escpos';

enum ReceiptMapper {
    order = 'ordering_1'
}

@Injectable()
export class ReceiptService {

    constructor(private receitDataProvider: ReceiptDataProvider) {

    }

    public getOrderReceipt(data: any): string {
        const templateList: Array<string> = this.receitDataProvider.getReceiptTemplates(ReceiptMapper.order);

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
