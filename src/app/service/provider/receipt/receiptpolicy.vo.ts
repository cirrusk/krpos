import {ReceiptPolicy} from './receiptpolicy.interface';
import { Obj2MapConverter } from '../../common/utils/obj2map.converter';

export class ReceiptPolicyVO {

    private _templateList: Array<string>;

    private _precompile: Map<string, boolean>;

    private _downloadUriPrefix: string;
    
    private _downloadUris: Map<string, string>;
    
    private _receipts: Array<string>;
    
    private _receiptTemplates: Map<string, Array<string>>;
    
    constructor(data: ReceiptPolicy) {
        this.templateList = data.templateList;
        this.precompile = Obj2MapConverter.do<string, boolean>(data.precompile);
        this.downloadUris = Obj2MapConverter.do<string, string>(data.downloadUris);
        this.receipts = data.receipts;
        this.receiptTemplates = Obj2MapConverter.do<string, Array<string>>(data.receiptTemplates);
        this.downloadUriPrefix = data.downloadUriPrefix;
    }

	public get templateList(): Array<string> {
		return this._templateList;
	}

	public set templateList(value: Array<string>) {
		this._templateList = value;
	}

	public get precompile(): Map<string, boolean> {
		return this._precompile;
	}

	public set precompile(value: Map<string, boolean>) {
		this._precompile = value;
	}

	public get downloadUriPrefix(): string {
		return this._downloadUriPrefix;
	}

	public set downloadUriPrefix(value: string) {
		this._downloadUriPrefix = value;
	}

	public get downloadUris(): Map<string, string> {
		return this._downloadUris;
	}

	public set downloadUris(value: Map<string, string>) {
		this._downloadUris = value;
	}

	public get receipts(): Array<string> {
		return this._receipts;
	}

	public set receipts(value: Array<string>) {
		this._receipts = value;
	}

	public get receiptTemplates(): Map<string, Array<string>> {
		return this._receiptTemplates;
	}

	public set receiptTemplates(value: Map<string, Array<string>>) {
		this._receiptTemplates = value;
	}
}