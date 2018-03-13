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
}