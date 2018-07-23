import { OrderEntry, Accounts, Principal, Price } from '../..';
import { Voucher } from '../payment/voucher';
import { Coupon } from '../payment/coupon';
import { PaymentDetails, PaymentDetailInfo } from '../payment/payment-details';
import { AmwayValue } from '../common/amway-value';
import { PromotionList, PromotionDiscount } from './promotion';
import { Enumeration } from '../common/enumeration';
import { PointOfService } from '../common/point-of-service';

export class AbstractOrder {
    code: string;                                           // 주문번호
    net: boolean;                                           // net 여부
    totalPriceInclTax: Price;                               // 금액
    totalPriceWithTax: Price;                               // 세금 포함 총 금액
    totalPrice: Price;                                      // 총 금액
    totalTax: Price;                                        // 총 세금 금액
    subTotal: Price;                                        // 소계
    deliveryCost: Price;                                    // 배송비
    entries: Array<OrderEntry>;                             // 주문 Entries
    totalItems: number;                                     // 제품 전체 갯수
    deliveryMode: any;                                      // 배송 방법 DeliveryModeWsDTO
    deliveryAddress: any;                                   // 배송지 주소 AddressWsDTO
    paymentInfo: PaymentDetailInfo;                         // 결제 정보 PaymentDetailsWsDTO
    appliedOrderPromotions: Array<PromotionList>;           // 주문 프로모션 정보 리스트 List<PromotionResultWsDTO>
    appliedProductPromotions: Array<PromotionList>;         // 제품 프로모션 정보 리스트 List<PromotionResultWsDTO>
    productDiscounts: Price;                                // 제품 할인 금액
    orderDiscounts: Price;                                  // 주문 할인 금액
    totalDiscounts: Price;                                  // 총 할인 금액 (상품 할인 금액 + 주문 할인 금액)
    site: string;                                           // 사이트
    store: string;                                          // 스토어
    guid: string;                                           // GUID
    calculated: boolean;                                    // 계산여부
    appliedCouponData: Array<Coupon>;                       // 쿠폰
    appliedVouchers: Array<Voucher>;                        // 적용된 바우처 List<VoucherWsDTO>
    promotionDiscountsDetails: Array<PromotionDiscount>;    // 프로모션 할인 상세정보
    deliveryPointOfService: PointOfService;                 // 배송 지점
    parentOrder: string;                                    // Payment Order Code
    channel: Enumeration;                                   // 주문 채널
    user: Principal;                                        // 주문고객
    pickupOrderGroups: any;                                 // 픽업 주문 그룹 List<PickupOrderEntryGroupWsDTO>
    deliveryOrderGroups: any;                               // 배송 주문 그룹 List<DeliveryOrderEntryGroupWsDTO>
    pickupItemsQuantity: number;                            // 픽업 제품 갯수
    deliveryItemsQuantity: number;                          // 배송 제품 갯수
    account: Accounts;                                      // 암웨이 계정
    savings: Price;                                         // 할인액
    volumeABOAccount: Accounts;                             // 실적 ABO 계정
    groupOrderId: string;                                   // 그룹 오더 아이디
    combinedOrderId: string;                                // 결합 주문 아이디
    orderType: Enumeration;                                 // 주문유형 EnumerationWsDTO
    warehouse: string;                                      // 웨어하우스
    orderPeriod: OrderPeriod;                               // 주문 기간 AmwayOrderPeriodWsDTO
    bonusPeriod: BonusPeriod;                               // 보너스 기간 AmwayBonusPeriodWsDTO
    margin: OrderMargin;                                    // AmwayOrderMarginWsDTO
    value: AmwayValue;                                      // PV/BV AmwayValueWsDTO
    totalWeight: number;                                    // 무게
    paymentDetails: PaymentDetails;                         // 결제 상세 정보 AmwayPaymentDetailsWsDTO
    constructor() { }
}

export class OrderPeriod {
    startDate: Date;
    endDate: Date;
    status: string;
}

export class BonusPeriod {
    startDate: Date;
    endDate: Date;
    status: string;
}

export class OrderMargin {
    margin: number; // double
}
