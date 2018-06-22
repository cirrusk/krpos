export class NiceUtils {
    public static padding(num: string, width: number): string {
        const padded: string = num.padStart(width, "0");
        return padded;
    }

    public static byteLen(data: string): number {
        let len: number = 0
        let idx: number = 0;
        let c: number = 0;

        for (len = idx = 0 ; c = data.charCodeAt(idx++) ; len += c >> 11 ? 3 : c >> 7 ? 2 : 1);

        return len;
    }

    public static extractResultCode(raw: string): string {
        const resultCode: string = raw.substr(8, 4);

        if(resultCode !== "0000") {
            const errCode: string = '-' + resultCode;
            return errCode;
        }

        return '1';
    }

    public static extractResultBody(raw: string): string {
        const bodyLen: number = Number.parseInt(raw.substr(12, 4));
        const body: string = raw.substr(16, bodyLen);
        return body;
    }
}