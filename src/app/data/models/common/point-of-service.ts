import { TerminalInfo } from './terminal-info';
import { GeoPoint } from './geo-point';
import { Address } from './address';
import { Image } from './image';
export class PointOfService {
    address: Address;
    displayName: string;
    geoPoint: GeoPoint;
    name: string;
    url: string;
    description: string;
    openingHours: any;
    storeContent: string;
    features: Map<string, string>;
    formattedDistance: string;
    distanceKm: number; // Double
    mapIcon: Image;
    storeImages: Array<Image>;
    storeType: string;
    terminal: TerminalInfo;

}
