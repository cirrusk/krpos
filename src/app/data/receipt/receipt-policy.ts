// export interface Precompilable {
//     [key: string]: boolean
// }

// export interface DownloadUris {
//     [key: string]: string
// }

// export interface ReceiptTemplates {
//     [key: string]: Array<string>
// }

// export interface ReceiptPolicy {
//     templateList: Array<string>,
//     precompile: Array<Precompilable>,
//     downloadUriPrefix: string,
//     downloadUris: Array<DownloadUris>,
//     receipts: Array<string>,
//     receiptTemplates: Array<ReceiptTemplates>
// }
export interface ReceiptPolicy {
    templateList: Array<string>;
    precompile: Map<string, boolean>;
    downloadUriPrefix: string;
    downloadUris: Map<string, string>;
    receipts: Array<string>;
    receiptTemplates: Map<string, Array<string>>;
}
