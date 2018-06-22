export class WebsocketResult {
    private _code: string;
    private _msg: string;

    constructor() {

    }

    /**
     * Getter code
     * @return {string}
     */
	public get code(): string {
		return this._code;
	}

    /**
     * Getter msg
     * @return {string}
     */
	public get msg(): string {
		return this._msg;
	}

    /**
     * Setter code
     * @param {string} value
     */
	public set code(value: string) {
		this._code = value;
	}

    /**
     * Setter msg
     * @param {string} value
     */
	public set msg(value: string) {
		this._msg = value;
	}
}