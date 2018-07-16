export class ResponseData {
    result: string;
}

export class ResponseMessage {
    code: string;
    returnMessage: string;
}

export class SerialEntries {
    orderEntries: Array<SerialEntry>;
}

export class SerialEntry {
    entryNumber: number;
    RFID: string;
    SERIAL_NUMBER: string;
}
