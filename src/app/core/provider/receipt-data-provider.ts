import { Injectable } from '@angular/core';
import { Subject } from 'rxjs/Subject';

import { ReceiptPolicyData } from '../../data/receipt/receipt-policy-data';
import { ReceiptPolicy } from '../../data/receipt/receipt-policy';
import { FormatReader } from '../peripheral/common/format-reader';

import { EscPos } from '../peripheral/printer/helper/escpos';
import { Config } from '../config/config';

@Injectable()
export class ReceiptDataProvider {

  private policy: ReceiptPolicyData;
  private preparedData: Map<string, string>;

  constructor(private formatReader: FormatReader, private config: Config) {
    // Blocking IO
    const waitDownload: Subject<any> = new Subject();

    // Policy File
    const policyUri: string = this.config.getConfig('receitPolicyFile');

    this.formatReader.get(policyUri)
        .subscribe(
            (res) => {
                waitDownload.next(JSON.parse(res._body) as ReceiptPolicy);
            }
        );

        waitDownload.subscribe(
          (msg: ReceiptPolicy) => {
              this.policy = new ReceiptPolicyData(msg);

              this.preparedData = new Map();
              this.precompile();
          }
      );
  }

  private precompile() {
    const precompileMap: Map<string, boolean> = this.getPrecompileMap();
    const downloadUriMap: Map<string, string> = this.getDownloadUriMap();

    this.getTemplateList().forEach((templateName: string) => {
        const url = this.getDownloadUriPrefix() + downloadUriMap.get(templateName);

        this.formatReader.get(url)
        .subscribe(
            (res) => {
                const unparsed = res._body;
                const canPrecompile = precompileMap.get(templateName);

                if (canPrecompile) {
                    // Null escape 필요
                    // ESC/POS 명령어 변환 시 명령어 조작 결과에 따라 \0 null character 가 생성됨
                    // ESC/POS 의 data populating 하는 handlebars 가 \0 을 처리 못함
                    // precompile 의 경우만 null escape 필요
                    const printText = EscPos.escPosCommand(unparsed);
                    const nullEscaped = EscPos.escapeNull(printText);

                    this.preparedData.set(templateName, nullEscaped);
                } else {
                    this.preparedData.set(templateName, unparsed);
                }
            }
        );
    });
  }

  private getTemplateList(): Array<string> {
    return this.policy.templateList;
  }

  private getPrecompileMap(): Map<string, boolean> {
    return this.policy.precompile as Map<string, boolean>;
  }

  public isPrecompiled(templateName: string): boolean {
    return this.getPrecompileMap().get(templateName);
  }

  private getDownloadUriPrefix(): string {
    return this.policy.downloadUriPrefix;
  }

  private getDownloadUriMap(): Map<string, string> {
    return this.policy.downloadUris as Map<string, string>;
  }

  public getReceipts(): Array<string> {
    return this.policy.receipts;
  }

  public getReceiptTemplateMap(): Map<string, Array<string>> {
    return this.policy.receiptTemplates;
  }

  public getReceiptTemplates(receiptName: string): Array<string> {
    return this.getReceiptTemplateMap().get(receiptName);
  }

  public getXmlTemplate(templateName: string): string {
    return this.preparedData.get(templateName);
  }

}
