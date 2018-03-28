//import { TextEncoder, TextDecoder } from '';

import { TextEncoder, TextDecoder } from 'text-encoding';

export class UTF8ArrayConverter {

    private static encoder = new TextEncoder('utf-8');

    private static decoder = new TextDecoder('utf-8');

    public static encode(data: string): Uint8Array {
        return this.encoder.encode(data);
    }

    public static decode(array: Uint8Array) {
        return this.decoder.decode(array);
    }
}