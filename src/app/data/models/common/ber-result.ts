export class BerResult {
    count: number;
    requestedCount: number;
    requestedStart: number;
    totalCount: number;
    result: BerData[];
}

export class BerData {
    addressText: string;
    businessItem: string;
    businessType: string;
    code: string;
    company: string;
    creationtime: string;
    name: string;
    number: string;
    recipient: string;
    recipientAgreeSms: boolean;
    recipientEmail: string;
    recipientMobile: string;
    sellerAgreeSms: boolean;
    sellerEmail: string;
    sellerMobile: string;
    constructor(number?: string) {
        this.number = number;
    }
}
