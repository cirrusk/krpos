export class Errors {
    type: string;
    message: string;
    reason?: string;
    subject?: string;
    subjectType?: string;
    constructor(type: string, message: string, reason?: string, subject?: string, subjectType?: string) {
        this.type = type;
        this.message = message;
        this.reason = reason;
        this.subject = subject;
        this.subjectType = subjectType;
    }
}
