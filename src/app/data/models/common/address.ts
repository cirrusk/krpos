import { Region, Country } from '../..';

export class Address {
    id: string;
    title: string;
    titleCode: string;
    firstName: string;
    lastName: string;
    companyName: string;
    line1: string;
    line2: string;
    town: string;
    region: Region;
    postalCode: string;
    phone: string;
    email: string;
    country: Country;
    shippingAddress: boolean;
    defaultAddress: boolean;
    visibleInAddressBook: boolean;
    formattedAddress: string;
    line3: string;
    landmark: string;
    county: string;

    constructor() {}
}
