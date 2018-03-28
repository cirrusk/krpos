import { Injectable } from "@angular/core";
import { HttpClient } from "@angular/common/http";

import { Subject } from "rxjs";

import { ReceiptPolicy } from "./receiptpolicy.interface";
import { environment } from "../../../../environments/environment";
import { FileDownloader } from "../../common/file/filedownloader";
import { EscPos } from "../../common/printer/helpers/escpos";
import { ReceiptPolicyVO } from "./receiptpolicy.vo";

@Injectable()
export class ReceiptDataProvider {
    //private policy: ReceiptPolicy;
    private policy: ReceiptPolicyVO;

    private preparedData: Map<string, string>;

    constructor(private httpFileDownloader: FileDownloader) {
        // Blocking IO
        const waitDownload: Subject<any> = new Subject();

        // Policy File
        const policyUri: string = environment.occEndpointDomain + environment.receitPolicyFile;

        this.httpFileDownloader.get(policyUri)
        .subscribe(
            (res) => {
                waitDownload.next(JSON.parse(res) as ReceiptPolicy);
            }
        );

        waitDownload.subscribe(
            (msg: ReceiptPolicy) => {
                this.policy = new ReceiptPolicyVO(msg);

                this.preparedData = new Map();
                this.precompile();
            }
        );
    }

    private precompile() {
        const precompileMap: Map<string, boolean> = this.getPrecompileMap();
        const downloadUriMap: Map<string, string> = this.getDownloadUriMap();

        console.log(this.policy);

        this.getTemplateList().forEach((templateName: string) => {
            const url = environment.occEndpointDomain + this.getDownloadUriPrefix() + downloadUriMap.get(templateName);

            this.httpFileDownloader.get(url)
            .subscribe(
                (unparsedText) => {
                    const canPrecompile = precompileMap.get(templateName);

                    if (canPrecompile) {
                        // Null escape 필요
                        // ESC/POS 명령어 변환 시 명령어 조작 결과에 따라 \0 null character 가 생성됨
                        // ESC/POS 의 data populating 하는 handlebars 가 \0 을 처리 못함
                        // precompile 의 경우만 null escape 필요
                        const transformed = EscPos.getTransformed(unparsedText);
                        const nullEscaped = EscPos.escapeNull(transformed);

                        this.preparedData.set(templateName, nullEscaped);
                    } else {
                        this.preparedData.set(templateName, unparsedText);
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

    public getTemplateText(templateName: string): string {
        return this.preparedData.get(templateName);
    }
}