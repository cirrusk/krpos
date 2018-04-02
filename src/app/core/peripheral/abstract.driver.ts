export abstract class AbstractDriver {

    protected _driverName: string;

    constructor(driverName: string) {
        this.setDriverName = driverName;
    }

    protected set setDriverName(name: string) {
        this._driverName = name;
    }

    protected get getDriverName(): string {
        return this._driverName;
    }

    protected errorHandler(msg: string = null): void {
        throw new Error(`${this.getDriverName} error message : ${(msg != null) ? msg : 'None'}`);
    }

    protected handleConnectionError(err: any): void {
        if (err.target !== undefined) {
            if (err.target.readyState >= 2) {
                console.error('Connection to QZ Tray was closed.');
            } else {
                console.error('A connection error occurred, check log for details.');
            }
        } else {
            console.error(`handleConnection Error : ${err}`);
        }
    }

    protected handleCloseCallback(evt: any): void {
        console.log(`qz tray close callback : ${evt}`);
    }
}
