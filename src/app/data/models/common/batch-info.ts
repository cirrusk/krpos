import { TerminalInfo } from '../../model';

export class BatchInfo {
    batchNo: string;
    cashier: string;
    dateOfBatchOpen: string;
    dateOfBatchClosed: string;
    endingBalance: number;
    startingBalance: number;
    terminal: TerminalInfo;
}
