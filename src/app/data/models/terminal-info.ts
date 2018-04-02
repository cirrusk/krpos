import { PointOfService } from './point-of-service';
export class TerminalInfo {
    id: string;
    location: string;
    pointOfService: PointOfService;

    static convert(json: any): TerminalInfo {
        const t = Object.create(TerminalInfo.prototype);
        return Object.assign(t, json);
    }
}
