export class HttpData {
    apikey: string;
    pathvariables: any;
    body: object;
    param: any;
    headertype?: string;
    constructor(apikey: string, pathvariables: any, body: object, param: any, headertype?: string) {
        this.apikey = apikey;
        this.pathvariables = pathvariables;
        this.body = body;
        this.param = param;
        this.headertype = headertype;
    }
}
