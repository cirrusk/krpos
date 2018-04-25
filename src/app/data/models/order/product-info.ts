import { Price, Stock } from '../..';

export class ProductInfo {
    code: string;
    name: string;
    url: string;
    description: string;
    purchasable: boolean;
    stock: Stock;
    futureStocks: any; // List<FutureStockWsDTO>
    availableForPickup: boolean;
    averageRating: number;
    numberOfReviews: number;
    summary: string;
    manufacturer: string;
    variantType: string;
    price: Price;
    baseProduct: string;
    images: any; // Collection<ImageWsDTO>
    categories: any; // Collection<CategoryWsDTO>
    reviews: any; // Collection<ReviewWsDTO>
    classifications: any; // Collection<ClassificationWsDTO>
    potentialPromotions: any; // Collection<PromotionWsDTO>
    variantOptions: any; // List<VariantOptionWsDTO>
    baseOptions: any; // List<BaseOptionWsDTO>
    volumePricesFlag: boolean;
    volumePrices: Array<Price>; // List<PriceWsDTO>
    productReferences: any; // List<ProductReferenceWsDTO>
    variantMatrix: any; // List<VariantMatrixElementWsDTO>
    priceRange: any; // PriceRangeWsDTO
    multidimensional: boolean;
    alias: string;
    weight: number;
    dimensions: any; // AmwayDimensionWsDTO
    productAttributes: any; // Map<String,String>
    onlineSince: Date;
    kitEntry: any; // Set<AmwayKitEntryProductWsDTO>
    kitPrice: number;
    retailPrice: Price;
    deliveryModes: any; // List<DeliveryModeWsDTO>
    vpsCode: string;

    constructor() {
    }
}
