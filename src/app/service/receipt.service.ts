import { Injectable, OnDestroy } from '@angular/core';
import { Subscription } from 'rxjs/Subscription';
import { Observable } from 'rxjs/Observable';
import 'rxjs/add/observable/forkJoin';
// import 'rxjs/add/operator/zip';
import 'rxjs/add/observable/of';
import 'rxjs/add/observable/zip';
import 'rxjs/add/operator/toPromise';

import { ReceiptDataProvider, EscPos, StorageService, PrinterService, Logger } from '../core';
import { ReceiptTypeEnum } from '../data/receipt/receipt.enum';
import {
    Accounts, PaymentCapture, OrderInfo, Cashier, MemberType, Account, AccountInfo,
    ProductsEntryInfo, BonusInfo, Bonus, PaymentInfo, CreditCard, Cash, PriceInfo,
    ReceiptInfo, ICCard, AccessToken, OrderEntry,
    GroupResponseData, AmwayExtendedOrdering, AmwayPaymentInfoData, PaymentModes,
    CreditCardPaymentInfo, ICCardPaymentInfo, CashPaymentInfo, DirectDebitPaymentInfo,
    PointPaymentInfo, AmwayMonetaryPaymentInfo, PointReCash, PointInfo, DirectDebit,
    EodData, EodInfo, OrderEodData, CcData, IcData, DebitData, PointData, ReCashData, CashData,
    SummaryData, CancelEodData, OrderCancel, MediateCancel, MemberCancel, SummaryCancel, Price, AmwayValue, GroupBalance
} from '../data';
import { Order, OrderList } from '../data/models/order/order';
import { Cart } from '../data/models/order/cart';
import { Utils } from '../core/utils';
import { MessageService } from '../message/message.service';
import { CartService } from './order/cart.service';
import { OrderService } from './order/order.service';
import { PaymentService } from './payment/payment.service';

/**
 * 영수증 출력 서비스
 */
@Injectable()
export class ReceiptService implements OnDestroy {

    private groupOrderTotalCount;
    private paymentsubscription: Subscription;
    private ordersubscription: Subscription;
    private groupordersubscription: Subscription;
    constructor(private receitDataProvider: ReceiptDataProvider,
        private orders: OrderService,
        private payment: PaymentService,
        private cart: CartService,
        private order: OrderService,
        private printer: PrinterService,
        private storage: StorageService,
        private message: MessageService,
        private logger: Logger) { }

    ngOnDestroy() {
        this.dispose();
    }

    /**
     * Life Cycle hook 이 Service에서 implement 되지 않아
     * Component Level 에서 처리
     * 향후 버전업 시 implement 될 수 도 있음.
     */
    dispose() {
        if (this.paymentsubscription) { this.paymentsubscription.unsubscribe(); }
        if (this.ordersubscription) { this.ordersubscription.unsubscribe(); }
        if (this.groupordersubscription) { this.groupordersubscription.unsubscribe(); }
    }

    /**
     * 일반 ABO 출력 정보
     *
     * @param {any} data 영수증 데이터
     * @returns {string} 출력 정보
     */
    public aboNormal(data: any): string {
        return this.getReceipt(data, ReceiptTypeEnum.ABONormal);
    }

    /**
     * 일반 멤버 출력 정보
     *
     * @param {any} data 영수증 데이터
     * @returns {string} 출력 정보
     */
    public memberNormal(data: any): string {
        return this.getReceipt(data, ReceiptTypeEnum.MemberNormal);
    }

    /**
     * 일반 소비자 출력 정보
     *
     * @param {any} data 영수증 데이터
     * @returns {string} 출력 정보
     */
    public consumerNormal(data: any): string {
        return this.getReceipt(data, ReceiptTypeEnum.ConsumerNormal);
    }

    /**
     * 그룹주문 요약 출력 정보
     *
     * @param {any} data 영수증 데이터
     * @returns {string} 출력 정보
     */
    public groupOrderSummary(data: any): string {
        return this.getReceipt(data, ReceiptTypeEnum.GroupSummary);
    }

    /**
     * 캐셔 EOD 출력 정보
     *
     * @param {any} data 영수증 데이터
     * @returns {string} 출력 정보
     */
    public cashierEod(data: any): string {
        return this.getReceipt(data, ReceiptTypeEnum.CashierEod);
    }

    /**
     * 영수증 출력용 데이터 생성
     *
     * @param {any} data 영수증 데이터
     * @param {ReceiptTypeEnum} format 영수증 포맷
     * @returns {string} 영수증 출력 데이터
     */
    private getReceipt(data: any, format: ReceiptTypeEnum): string {
        const templateList: Array<string> = this.receitDataProvider.getReceiptTemplates(format);
        let retText = '';
        templateList.forEach((templateName) => {
            const templateText = this.receitDataProvider.getXmlTemplate(templateName);
            const parsed = EscPos.fillData(templateText, data);
            const isCompiled = this.receitDataProvider.isPrecompiled(templateName);
            if (isCompiled) {
                retText += EscPos.unescapeNull(parsed);
            } else {
                const transformed = EscPos.escPosCommand(parsed);
                retText += transformed;
            }
        });
        return EscPos.unescapeLeadingSpace(retText);
    }

    /**
     * 영수증 재출력
     *
     * @param {OrderList} orderData 주문 정보
     * @param {boolean} cancelFlag 취소여부
     * @param {boolean} groupOrderFlag 그룹주문여부
     * @param {string} type 주문이름
     * @param {boolean} isCashReceipt 현금영수증
     */
    public reissueReceipts(orderData: OrderList, cancelFlag = false, groupOrderFlag = false, type?: string, isCashReceipt = false): Observable<boolean> {
        let rtn = true;
        let cartInfo = new Cart();
        const paymentCapture = new PaymentCapture();
        let jsonPaymentData = {};

        // 재출력의 경우 단건이기 때문에 0번째 사용
        // 그룹인 경우는 그룹주문을 조회 하여 처리
        const order = orderData.orders[0];
        const jsonCartData = {
            'user': order.user,
            'entries': order.entries,
            'totalPrice': order.totalPrice,
            'subTotal': order.subTotal,
            'totalUnitCount': order.totalUnitCount,
            'totalPriceWithTax': order.totalPriceWithTax,
            'totalTax': order.totalTax,
            'totalDiscounts': order.totalDiscounts,
            'orderDiscounts' : order.orderDiscounts,
            'orderTaxDiscount' : order.orderTaxDiscount,
            'productDiscounts' : order.productDiscounts,
            'productTaxDiscount' : order.productTaxDiscount,
            'totalDiscountWithTax' : order.totalDiscountWithTax,
            'isGroupCombinationOrder': order.isGroupCombinationOrder
        };
        cartInfo = jsonCartData as Cart;
        order.paymentDetails.paymentInfos.forEach(paymentInfo => {
            switch (paymentInfo.paymentMode.code) {
                case 'creditcard': { jsonPaymentData = { 'ccPaymentInfo': this.paymentCaptureConverter(paymentInfo) }; } break;
                case 'cashiccard': { jsonPaymentData = { 'icCardPaymentInfo': this.paymentCaptureConverter(paymentInfo) }; } break;
                case 'cash': { jsonPaymentData = { 'cashPaymentInfo': this.paymentCaptureConverter(paymentInfo) }; } break;
                case 'directdebit': { jsonPaymentData = { 'directDebitPaymentInfo': this.paymentCaptureConverter(paymentInfo) }; } break;
                case 'arCredit': { jsonPaymentData = { 'monetaryPaymentInfo': this.paymentCaptureConverter(paymentInfo) }; } break;
                case 'point': { jsonPaymentData = { 'pointPaymentInfo': this.paymentCaptureConverter(paymentInfo) }; } break;
                default: { jsonPaymentData = {}; } break;
            }
            Object.assign(paymentCapture, jsonPaymentData);
            jsonPaymentData = {};
        });

        if (groupOrderFlag) { // Sub 주문만 출력시 해당 로직 수행하여 sub 만 출력되도록 처리
            this.groupPrint(order, paymentCapture, cancelFlag, true, isCashReceipt);
            return Observable.of(true);
        } else {
            const params = {
                cancelFlag: cancelFlag ? 'Y' : 'N',
                groupInfo: null,
                type: type,
                reIssue: true,
                isGroupOrder: false,
                isCashReceipt: isCashReceipt
            };
            rtn = this.print(order.account, cartInfo, order, paymentCapture, params);
        }
        return Observable.of(rtn);
    }

    /**
     * 컨펌(픽업예약, 간편선물, 설치주문) 영수증
     *
     * @param {OrderList} orderData 주문 정보
     * @param {boolean} cancelFlag 취소여부
     * @param {string} type 주문이름
     * @param {boolean} isCashReceipt 현금영수증
     */
    public reissueReceiptsConfirm(orderData: OrderList, cancelFlag = false, type?: string, isCashReceipt = false): Observable<boolean> {
        let rtn = true;

        orderData.orders.forEach(
            order => {
                let cartInfo = new Cart();
                const paymentCapture = new PaymentCapture();
                let jsonPaymentData = {};

                const jsonCartData = {
                    'user': order.user,
                    'entries': order.entries,
                    'totalPrice': order.totalPrice,
                    'subTotal': order.subTotal,
                    'totalUnitCount': order.totalUnitCount,
                    'totalPriceWithTax': order.totalPriceWithTax,
                    'totalTax': order.totalTax,
                    'totalDiscounts': order.totalDiscounts,
                    'orderDiscounts' : order.orderDiscounts,
                    'orderTaxDiscount' : order.orderTaxDiscount,
                    'productDiscounts' : order.productDiscounts,
                    'productTaxDiscount' : order.productTaxDiscount,
                    'totalDiscountWithTax' : order.totalDiscountWithTax,
                    'isGroupCombinationOrder': order.isGroupCombinationOrder
                };
                cartInfo = jsonCartData as Cart;
                order.paymentDetails.paymentInfos.forEach(paymentInfo => {
                    switch (paymentInfo.paymentMode.code) {
                        case 'creditcard': { jsonPaymentData = { 'ccPaymentInfo': this.paymentCaptureConverter(paymentInfo) }; } break;
                        case 'cashiccard': { jsonPaymentData = { 'icCardPaymentInfo': this.paymentCaptureConverter(paymentInfo) }; } break;
                        case 'cash': { jsonPaymentData = { 'cashPaymentInfo': this.paymentCaptureConverter(paymentInfo) }; } break;
                        case 'directdebit': { jsonPaymentData = { 'directDebitPaymentInfo': this.paymentCaptureConverter(paymentInfo) }; } break;
                        case 'arCredit': { jsonPaymentData = { 'monetaryPaymentInfo': this.paymentCaptureConverter(paymentInfo) }; } break;
                        case 'point': { jsonPaymentData = { 'pointPaymentInfo': this.paymentCaptureConverter(paymentInfo) }; } break;
                        default: { jsonPaymentData = {}; } break;
                    }
                    Object.assign(paymentCapture, jsonPaymentData);
                    jsonPaymentData = {};
                });

                const params = {
                    cancelFlag: cancelFlag ? 'Y' : 'N',
                    groupInfo: null,
                    type: type,
                    reIssue: true,
                    isGroupOrder: false,
                    isCashReceipt: isCashReceipt
                };
                rtn = this.print(order.account, cartInfo, order, paymentCapture, params);
            }
        );
        return Observable.of(rtn);
    }

    /**
     * 그룹주문 영수증 출력
     *
     * @param {Order} order 주문정보
     * @param {PaymentCapture} paymentCapture Payment Capture 정보
     * @param {boolean} cancelFlag 취소여부
     * @param {boolean} reIssue 재발행 여부
     * @param {boolean} isCashReceipt 현금영수증 증빙 신청 여부
     */
    public groupPrint(order: Order, paymentCapture: PaymentCapture, isCancel = false, reIssue = false, isCashReceipt = false) {

        this.groupordersubscription = this.order.groupOrder(order.user.uid, order.code).subscribe(
            result => {
                if (result) {
                    const groupOrder: AmwayExtendedOrdering = result;
                    this.groupOrderTotalCount = (groupOrder.orderList.length).toString();
                    const cancelFlag = isCancel ? 'Y' : 'N';
                    if (order.account.uid === order.volumeABOAccount.uid) {
                        const entryList = new Array<OrderEntry>();

                        // summary 에 사용될 데이터 생성
                        groupOrder.orderList.forEach((tempOrder, index) => {
                            tempOrder.entries.forEach(entry => {
                                const existedIdx = entryList.findIndex(
                                    function (obj) {
                                        return obj.product.code === entry.product.code;
                                    }
                                );
                                const tempEntry = new OrderEntry();
                                Object.assign(tempEntry, entry);

                                if (existedIdx === -1) {
                                    entryList.push(tempEntry);
                                } else {
                                    entryList[existedIdx].quantity = (entryList[existedIdx].quantity + tempEntry.quantity);
                                }
                            });
                        });

                        // Summary 출력
                        this.makeTextAndGroupSummaryPrint(entryList, '그룹주문', cancelFlag);

                        setTimeout(() => {
                            this.printByGroup(groupOrder.orderList, paymentCapture, cancelFlag, reIssue, isCashReceipt, groupOrder);
                        }, 500);
                    } else {
                        // volumeABO 가 영수증을 재출력 했을 경우
                        const volumeABOIndex = groupOrder.orderList.findIndex(
                            function (obj) {
                                return obj.volumeABOAccount.uid === order.volumeABOAccount.uid;
                            }
                        );

                        if (volumeABOIndex > -1) {
                            // Ordering ABO를 제외한 index 로 -1 처리
                            this.payment.getBalance(groupOrder.orderList[volumeABOIndex].volumeABOAccount.uid).subscribe(
                                balance => {
                                    this.printSubOrder(groupOrder.orderList[volumeABOIndex], (volumeABOIndex - 1), cancelFlag, reIssue, false, Number(balance.amount));
                                }
                            );
                        }
                    }
                }
            });
    }

    /**
     * 그룹 주문 인쇄
     *
     * @param {Array<Order>} orderList 주문정보 배열
     * @param {PaymentCapture} paymentCapture payment Capture 정보(Ordering ABO만 필요)
     * @param {boolean} cancelFlag 주문취소 여부
     * @param {boolean} reIssue 영수증 재출력 여부
     * @param {boolean} isCashReceipt 영수증 증빙 신청 여부
     */
    private printByGroup(orderList: Array<Order>, paymentCapture: PaymentCapture, cancelFlag = 'N', reIssue = false, isCashReceipt = false,
                         amwayExtendedOrdering: AmwayExtendedOrdering) {
        const orderingOrder = orderList[0];
        const ordering: GroupResponseData = this.getGroupDetailInfo(orderingOrder, 0, amwayExtendedOrdering);
        const printInfo = {
            order: ordering.order, account: ordering.account, cartInfo: ordering.cart, cancelFlag: cancelFlag,
            paymentCapture: paymentCapture, groupInfo: ordering.info, cashReceipt: isCashReceipt, reIssue: reIssue
        };

        // 그룹주문시 사용자별 포인트 조회
        const addAccount = [];
        orderList.forEach(
            order => {
                addAccount.push(this.payment.getBalanceByUid(order.volumeABOAccount.uid));
            }
        );

        Observable.forkJoin<GroupBalance>(addAccount).subscribe(gBalance => {
            const pointMap = new Map<string, object>();
            gBalance.forEach(obj => { pointMap.set(obj.uid,  obj.point); });

            const changepoint: number = pointMap.size > 0 ? Number(pointMap.get(orderList[0].account.uid)) : 0;

            this.doPrintByGroup(ordering, orderList, printInfo, changepoint, reIssue, pointMap);
          });

    }

    /**
     * 그룹 주문 인쇄 인쇄 처리부
     *
     * @param {GroupResponseData} ordering 그룹 주문 인쇄 정보 재구성
     * @param {Array<Order>} orderList 주문 정보 배열
     * @param {any} printInfo 인쇄 정보
     * @param {number} point 잔여 포인트 값
     * @param {boolean} reIssue 재발행 여부
     */
    private doPrintByGroup(ordering: GroupResponseData, orderList: Array<Order>, printInfo: any, point: number, reIssue = false, pointMap?: any) {
        this.printMainOrder(ordering, printInfo, point, reIssue).subscribe(
            () => {
                setTimeout(() => {
                    const subOrderList: Array<Order> = orderList.filter((o, index) => index !== 0).map(o => o);
                    subOrderList.forEach((order, index) => {
                        setTimeout(() => {
                            this.printSubOrder(order, index, printInfo.cancelFlag, reIssue, false, Number(pointMap.get(order.volumeABOAccount.uid)));
                        }, 500);
                    });
                }, 1000);
            }
        );
    }

    /**
     * 그룹 주문 메인 Order 인쇄
     *
     * @param {GroupResponseData} ordering 그룹 주문 인쇄 정보 재구성
     * @param {any} printInfo 인쇄 정보
     * @param {number} point 잔여 포인트 값
     * @param {boolean} reIssue 재발행 여부
     */
    private printMainOrder(ordering: GroupResponseData, printInfo: any, point: number, reIssue = false): Observable<boolean> {
        Object.assign(printInfo, { point: point ? point : 0 });
        const rtn = this.makeTextAndPrint(printInfo);
        if (rtn && reIssue) { this.issueReceipt(ordering.account, ordering.order); }
        return Observable.of(rtn);
    }

    /**
     * 그룹 주문 서브 주문 인쇄
     *
     * @param {Order} order 주문 정보
     * @param {number} index 인덱스 정보
     * @param {boolean} cancelFlag 취소 여부
     * @param {boolean} reIssue 재출력 여부
     * @param {boolean} isCashReceipt 현금 영수증 증빙여부
     */
    private printSubOrder(order: Order, index: number, cancelFlag = 'N', reIssue = false, isCashReceipt = false, point = 0): Observable<boolean> {
        const sub: GroupResponseData = this.getGroupDetailInfo(order, index + 1);

        const params = {
            cancelFlag: cancelFlag,
            groupInfo: sub.info,
            reIssue: reIssue,
            isGroupOrder: true, // balance 조회 없이 print
            isCashReceipt: isCashReceipt,
            type: this.message.get('group.order.type'),
            groupSubPoint: point
        };
        const rtn = this.print(sub.account, sub.cart, sub.order, new PaymentCapture(), params);
        return Observable.of(rtn);
    }

    /**
     * 그룹주문 인쇄 정보 재구성
     *
     * @param {Order} order 주문정보
     * @param {number} index 인쇄 페이지 인덱스
     * @returns {GroupResponseData} 그룹주문 데이터
     */
    private getGroupDetailInfo(order: Order, index: number, amwayExtendedOrdering?: AmwayExtendedOrdering): GroupResponseData {
        let groupTotalDiscountWithTax;
        let groupOrderMainPrice;
        if (amwayExtendedOrdering) {
            let totalDiscount = 0;
            let totalBV = 0;
            let totalPV = 0;
            amwayExtendedOrdering.orderList.forEach(
                gOrder => {
                totalDiscount += gOrder.totalDiscountWithTax.value;
                totalPV += gOrder.totalPriceWithTax.amwayValue.pointValue;
                totalBV += gOrder.totalPriceWithTax.amwayValue.businessVolume;
            });
            const discountPrice = new Price();
            const amwayValue = new AmwayValue();
            amwayValue.businessVolume = totalBV;
            amwayValue.pointValue = totalPV;
            discountPrice.value = totalDiscount;
            // discountPrice.amwayValue = amwayValue;
            groupTotalDiscountWithTax = discountPrice;
            groupOrderMainPrice = amwayExtendedOrdering.totalValue;
        }
        const gJsonCartData = {
            'user': { 'uid': order.volumeABOAccount.uid, 'name': order.volumeABOAccount.name },
            'entries': order.entries,
            'totalPrice': order.totalPrice,
            'subTotal': order.subTotal,
            'totalUnitCount': order.totalUnitCount,
            'totalPriceWithTax': order.totalPriceWithTax,
            'totalTax': order.totalTax,
            'totalDiscounts': order.totalDiscounts,
            'isGroupCombinationOrder': order.isGroupCombinationOrder,
            'orderDiscounts' : order.orderDiscounts,
            'orderTaxDiscount' : order.orderTaxDiscount,
            'productDiscounts' : order.productDiscounts,
            'productTaxDiscount' : order.productTaxDiscount,
            'totalDiscountWithTax' : order.totalDiscountWithTax,
            'groupOrderMainPrice' : groupOrderMainPrice,
            'groupTotalDiscountWithTax' : groupTotalDiscountWithTax
        };

        const groupCart = gJsonCartData as Cart;
        const groupOrder = order as Order;
        const groupAccount = order.volumeABOAccount;
        const jsonData = { 'parties': [{ 'uid': order.volumeABOAccount.uid, 'name': order.volumeABOAccount.name }] };
        Object.assign(groupAccount, jsonData);
        const groupInfo = (index + 1).toString() + '/' + this.groupOrderTotalCount;
        return new GroupResponseData(groupOrder, groupCart, groupAccount, groupInfo);
    }

    /**
     * 영수증 출력
     *
     * @param {Accounts} account 회원정보
     * @param {Cart} cartInfo 카트정보
     * @param {Order} order 주문정보
     * @param {PaymentCapture} paymentCapture 결제캡쳐 정보
     * @param {boolean} cancelFlag 취소 문구 삽입 (Y : 취소, N : 승인)
     * @param {string} groupInfo 그룹주문 페이지 정보
     * @param {string} type 주문형태(default, 현장구매)
     * @param {string} macAndCoNum 공제번호
     * @param {boolean} reIssue 영수증 재발행 여부
     * @param {boolean} isGroupOrder 그룹주문 여부
     * @param {boolean} isCashReceipt 현금영수증(소득공제) 여부
     * @returns {boolean} 성공/실패 여부
     */
    public print(account: Accounts, cartInfo: Cart, order: Order, paymentCapture: PaymentCapture,
        { cancelFlag = 'N', groupInfo = null, type = null, macAndCoNum = null, reIssue = false, isGroupOrder = false, isCashReceipt = false, groupSubPoint = 0}:
        { cancelFlag?: string, groupInfo?: string, type?: string, macAndCoNum?: string, reIssue?: boolean, isGroupOrder?: boolean, isCashReceipt?: boolean, groupSubPoint?: number}
    ): boolean {
        let rtn = true;
        type = type && type.length > 0 ? type : null;

        const printInfo = {
            order: order, account: account, cartInfo: cartInfo, type: type,
            macAndCoNum: macAndCoNum, cancelFlag: cancelFlag,
            paymentCapture: paymentCapture, groupInfo: groupInfo, cashReceipt: isCashReceipt, reIssue: reIssue
        };
        // 현재 포인트를 조회 후에 프린트 정보 설정
        const uid = account.parties ? account.parties[0].uid : account.uid;
        if (isGroupOrder) {
            // sub 포인트
            Object.assign(printInfo, { point: groupSubPoint });
            rtn = this.makeTextAndPrint(printInfo);
            if (rtn && reIssue) { this.issueReceipt(account, order); }
        } else {
            // 잔여 포인트 표시
            const pointrecash: PointReCash = this.storage.getPointReCash();
            if (pointrecash && pointrecash.point) { // 포인트가 세션에 있으면 그 정보로 인쇄
                let changepoint: number = pointrecash.point ? pointrecash.point.amount : 0;
                if (changepoint > 0) {
                    if (paymentCapture && paymentCapture.pointPaymentInfo) {
                        changepoint = changepoint - paymentCapture.pointPaymentInfo.amount;
                    }
                }
                Object.assign(printInfo, { point: changepoint });
                rtn = this.makeTextAndPrint(printInfo);
                if (rtn && reIssue) { this.issueReceipt(account, order); }
            } else {
                this.paymentsubscription = this.payment.getBalance(uid).subscribe(
                    result => {
                        const changepoint: number = result ? result.amount : 0;

                        Object.assign(printInfo, { point: changepoint });
                        rtn = this.makeTextAndPrint(printInfo);
                        if (rtn && reIssue) { this.issueReceipt(account, order); }
                    },
                    error => { // 포인트 조회 에러 발생 시 정상적으로 출력해야 함.
                        this.logger.set('receipt.service', `${error}`).error();
                        Object.assign(printInfo, { point: 0 });
                        rtn = this.makeTextAndPrint(printInfo);
                        if (rtn && reIssue) { this.issueReceipt(account, order); }
                    });
            }
        }
        return rtn;
    }

    /**
     * 영수증 출력 정보를 기록
     *
     * @param {Accounts} account 회원정보
     * @param {Order} order 주문정보
     */
    private issueReceipt(account: Accounts, order: Order) {
        const uid = account.parties ? account.parties[0].uid : account.uid;
        this.ordersubscription = this.orders.issueReceipt(uid, order.code).subscribe(receipt => {
            this.logger.set('receipt.service', `receipt issued invoice number : ${receipt.result}`).debug();
        }, error => {
            this.logger.set('receipt.service', `receipt issued : ${error}`).error();
        });
    }

    /**
     * 영수증 출력 정보를 이용하여 영수증 문구를 생성하고 출력
     *
     * @param {any} printInfo 영수증 출력 정보
     * @returns {boolean} 성공/실패 여부
     */
    private makeTextAndPrint(printInfo: any): boolean {
        let rtn = true;
        // 영수증 출력 파라미터 설정 - START
        const order: Order = printInfo.order;
        const account: Accounts = printInfo.account;
        const cartInfo: Cart = printInfo.cartInfo;
        const type: string = printInfo.type;
        const macAndCoNum: string = printInfo.macAndCoNum;
        const cancelFlag: string = printInfo.cancelFlag;
        const paymentCapture: PaymentCapture = printInfo.paymentCapture;
        const pointValue: number = printInfo.point;
        const posId: string = this.storage.getTerminalInfo().id;
        const token: AccessToken = this.storage.getTokenInfo();
        const groupInfo: string = printInfo.groupInfo;
        const cashReceipt: boolean = printInfo.cashReceipt;
        // 영수증 출력 파라미터 설정 - END

        // orderSummery - START
        const orderInfo = new OrderInfo(posId, order.code);
        orderInfo.setCashier = new Cashier(token.employeeId, token.employeeName);
        if (account.accountTypeCode === MemberType.ABO) {
            const abo = new Account();
            abo.setAbo = new AccountInfo(cartInfo.user.uid, cartInfo.user.name);
            orderInfo.setAccount = abo;
        } else {
            const member = new Account();
            member.setAbo = new AccountInfo(cartInfo.user.uid, cartInfo.user.name);
            orderInfo.setAccount = member;
        }

        if (groupInfo) {
            orderInfo.setGroupInfo = groupInfo;
        }

        orderInfo.setType = type || this.message.get('default.order.type'); // '현장구매';
        orderInfo.setDate = printInfo.reIssue ? Utils.convertDateToString(order.created) : Utils.convertDateToString(new Date());
        // confirm일 경우 출력일자 추가
        if (order.channel.code !== 'pos') {
            orderInfo.setPickupDate = Utils.convertDateToString(new Date());
        }
        // orderSummary - END

        // macAndCoNum - START
        if (macAndCoNum) {
            orderInfo.setMacAndCoNum = macAndCoNum;
        } else {
            if (order.deductionNumber) {
                orderInfo.setMacAndCoNum = Utils.isEmpty(order.deductionNumber) ? this.message.get('deduction.msg') : order.deductionNumber;
            } else {
                orderInfo.setMacAndCoNum = this.message.get('deduction.msg'); // '공제조합홈페이지 확인';
            }
        }
        // macAndCoNum - END

        // 영수증 취소 플래그 - START
        if (cancelFlag === 'Y') {
            orderInfo.setCancelFlag = cancelFlag;
        }
        // 영수증 취소 플래그 - END

        // Additional Info - START
        orderInfo.setCashReceipt = cashReceipt; // 현금 영수증 소득공제
        // Additional Info - END

        // productList - START(Add healthFood)
        const productList = Array<any>();
        cartInfo.entries.forEach(entry => {
            productList.push({
                'idx': (entry.displayEntryNumber + 1).toString(),
                'skuCode': entry.product.code,
                'productName': entry.product.name,
                'price': entry.product.price.value.toString(),
                'qty': entry.quantity.toString(),
                'totalPrice': entry.totalPriceInclTax.value.toString(),
                'giveAway': entry.giveAway.toString()
            });
        });
        const productEntryList = new Array<ProductsEntryInfo>();
        const data = productList;
        Object.assign(productEntryList, data);

        const healthFoodIdx = cartInfo.entries.findIndex(entry => entry.product.healthFood === true);
        if (healthFoodIdx > -1) {
            orderInfo.setHealthFood = 'Y';
        } else {
            orderInfo.setHealthFood = 'N';
        }
        // productList - END(Add healthFood)

        // bonus - START
        let totalPV = 0;
        let totalBV = 0;
        let sumPV = 0;
        let sumBV = 0;
        let groupPV = 0;
        let groupBV = 0;
        const bonus = new BonusInfo();
        if (cartInfo.totalPrice && cartInfo.totalPrice.amwayValue) { // 장바구니 PV BV
            totalPV = cartInfo.totalPrice.amwayValue.pointValue ? cartInfo.totalPrice.amwayValue.pointValue : 0;
            totalBV = cartInfo.totalPrice.amwayValue.businessVolume ? cartInfo.totalPrice.amwayValue.businessVolume : 0;
            bonus.setOrdering = new Bonus(String(totalPV), String(totalBV));
        } else {
            bonus.setOrdering = new Bonus('0', '0');
        }
        if (order.value) { // 합계 PV BV,  // 그룹 PV BV
            if (cancelFlag === 'Y') {
                sumPV = order.value.personalPointValue ? order.value.personalPointValue : 0;
                sumBV = order.value.personalBusinessVolume ? order.value.personalBusinessVolume : 0;
                groupPV = order.value.groupPointValue ? order.value.groupPointValue : 0;
                groupBV = order.value.groupBusinessVolume ? order.value.groupBusinessVolume : 0;
            } else {
                sumPV = order.value.personalPointValue ? order.value.personalPointValue + totalPV : 0 + totalPV;
                sumBV = order.value.personalBusinessVolume ? order.value.personalBusinessVolume + totalBV : 0 + totalBV;
                groupPV = order.value.groupPointValue ? order.value.groupPointValue + totalPV : 0 + totalPV;
                groupBV = order.value.groupBusinessVolume ? order.value.groupBusinessVolume + totalBV : 0 + totalBV;
            }
            bonus.setSum = new Bonus(String(sumPV), String(sumBV));
            bonus.setGroup = new Bonus(String(groupPV), String(groupBV));
        } else {
            bonus.setSum = new Bonus('0', '0');
            bonus.setGroup = new Bonus('0', '0');
        }
        const point = pointValue ? pointValue : 0; // 포인트
        if (account.accountTypeCode === MemberType.ABO) {
            if (point > 0) {
                bonus.setAPoint = String(point);
            }
        } else if (account.accountTypeCode === MemberType.MEMBER) { // 멤버인 경우 보너스를 보여주지 않으므로 무의미함.
            if (point > 0) {
                bonus.setMemberPoint = String(point);
            }
        }
        // bonus - END

        // payments - START
        const payment = new PaymentInfo();
        if (paymentCapture.getCcPaymentInfo) { // Credit Card
            const ccpinfo = paymentCapture.getCcPaymentInfo;
            const ccard = new CreditCard(ccpinfo.amount, ccpinfo.cardNumber, ccpinfo.issuer, ccpinfo.installmentPlan, ccpinfo.cardAuthNumber);
            payment.setCreditCard = ccard;
        }
        if (paymentCapture.getIcCardPaymentInfo) { // IC Card
            const icinfo = paymentCapture.getIcCardPaymentInfo;
            const iccard = new ICCard(icinfo.amount, icinfo.cardNumber, icinfo.issuer, icinfo.cardAuthNumber);
            payment.setICCard = iccard;
        }
        if (paymentCapture.getCashPaymentInfo) { // 현금 결제
            const cainfo = paymentCapture.getCashPaymentInfo;
            const cash = new Cash(cainfo.amount, cainfo.getReceived, cainfo.getChange, true); // 거스름돈은 보여주도록 수정
            payment.setCash = cash;
        }
        if (paymentCapture.getDirectDebitPaymentInfo) { // 자동이체
            const debitinfo = paymentCapture.getDirectDebitPaymentInfo;
            const directdebit = new DirectDebit(debitinfo.amount);
            payment.setDirectDebit = directdebit;
        }
        // payments - END

        // prices - START
        const totalQty = cartInfo.totalUnitCount; // 상품수량
        const amountWithoutVAT = this.cart.getTaxablePrice(cartInfo); // 과세 물품
        const amountVAT = this.cart.getTaxPrice(cartInfo); // 부가세
        const sumAmount = this.cart.getTotalPriceWithTax(cartInfo) + this.cart.getDiscountPrice(cartInfo); // 합계
        const totalAmount = this.cart.getPaymentPrice(cartInfo, paymentCapture); // 결제금액
        //                          상품수량  과세 물품         부가세     합계       결제금액      할인금액         할인금액정보
        //                          totalQty  amountWithoutVAT  amountVAT  sumAmount  totalAmount   totalDiscount    discount
        const price = new PriceInfo(totalQty, amountWithoutVAT, amountVAT, sumAmount, totalAmount);
        if (paymentCapture.getPointPaymentInfo) { // 2. 포인트
            const pointinfo = paymentCapture.getPointPaymentInfo;
            let pointname = this.message.get('receipt.apoint.label'); // '포인트차감(A포인트)';
            if (account.accountTypeCode === MemberType.MEMBER) {
                pointname = this.message.get('receipt.mpoint.label'); // '포인트차감(멤버포인트)';
            }
            price.setPointInfo = new PointInfo(pointname, pointinfo.amount);
        }
        if (paymentCapture.getMonetaryPaymentInfo) { // 3. Re-Cash
            const recash = paymentCapture.getMonetaryPaymentInfo;
            price.setRecash = recash.amount;
        }

        if (cartInfo.totalDiscountWithTax) { // 할인금액
            if (cartInfo.groupTotalDiscountWithTax) {
                price.setTotalDiscount = cartInfo.groupTotalDiscountWithTax ? cartInfo.groupTotalDiscountWithTax.value : 0;
            } else {
                price.setTotalDiscount = cartInfo.totalDiscountWithTax ? cartInfo.totalDiscountWithTax.value : 0;
            }
        }
        // 사용하지 않음(추후 삭제)
        // let promotion = 0;
        // if (cartInfo.appliedOrderPromotions) { // 4-1. 주문 프로모션
        //     promotion += 0;
        // }

        // if (cartInfo.appliedProductPromotions) { // 4-2. 상품 프로모션
        //     promotion += 0;
        // }
        // if (promotion > 0) {
        //     price.setPromotion = promotion;
        // }

        // 프로모션 할인금액
        if (order.promotionResultActions) {
            price.setPromotionDiscountInfo = this.order.getPromotionDiscountInfo(order.promotionResultActions);
        }

        if (cartInfo.appliedCouponData) { // 5. 쿠폰
            const coupon = 0;
            if (coupon > 0) {
                price.setCoupon = coupon;
            }
        }
        // prices - END

        // 최종 영수증 데이터 구성 - START
        const receiptInfo = new ReceiptInfo();
        receiptInfo.setOrderInfo = orderInfo;
        receiptInfo.setBonus = bonus;
        receiptInfo.setPayments = payment;
        receiptInfo.setPrice = price;
        receiptInfo.setProductList = productEntryList;
        let text = '';
        if (account.accountTypeCode === MemberType.ABO) { // ABO
            text = this.aboNormal(receiptInfo);
        } else if (account.accountTypeCode === MemberType.MEMBER) {
            text = this.memberNormal(receiptInfo);
        } else {
            text = this.consumerNormal(receiptInfo);
        }
        // 최종 영수증 데이터 구성 - END

        // 영수증 출력 - START
        try {
            this.printer.printText(text);
        } catch (e) {
            this.logger.set('receipt.service', `${e.description}`).error();
            rtn = false;
        }
        // 영수증 출력 - END
        return rtn;
    }

    /**
     * 그룹주문 요약 영수증 출력
     *
     * @param {Array<OrderEntry>} orderEntry 주문 엔트리 정보
     * @param {string} type 주문유형 정보
     * @returns {boolean} 성공/실패 여부
     */
    makeTextAndGroupSummaryPrint(orderEntry: Array<OrderEntry>, type: string, cancelFlag = 'N'): boolean {
        let rtn = true;
        // 영수증 출력 파라미터 설정 - START
        const posId: string = this.storage.getTerminalInfo().id;
        // 영수증 출력 파라미터 설정 - END

        // orderSummery - START
        const orderInfo = new OrderInfo(posId, '0', type);
        orderInfo.setCancelFlag = cancelFlag;
        orderInfo.setDate = Utils.convertDateToString(new Date());
        // orderSummary - END

        // productList - START
        const productList = Array<any>();
        let totalQty = 0;
        let totalPrice = 0;
        orderEntry.forEach((entry, index) => {
            productList.push({
                'idx': (index + 1).toString(),
                'skuCode': entry.product.code,
                'productName': entry.product.name,
                'price': entry.product.price.value.toString(),
                'qty': entry.quantity.toString(),
                'totalPrice': (entry.product.price.value * entry.quantity).toString()
            });
            totalQty = totalQty + entry.quantity;
            totalPrice = totalPrice + (entry.product.price.value * entry.quantity);
        });
        const productEntryList = new Array<ProductsEntryInfo>();
        const data = productList;
        Object.assign(productEntryList, data);
        // productList - END

        // prices - START
        const sumAmount = totalPrice; // 합계
        const totalAmount = 0; // 결제금액
        const amountVAT = 0; // 부가세
        const amountWithoutVAT = 0; // 과세 물품

        //                          상품수량   과세 물품          부가세     합계       결제금액       할인금액         할인금액정보
        //                          totalQty  amountWithoutVAT  amountVAT  sumAmount  totalAmount   totalDiscount    discount
        const price = new PriceInfo(totalQty, amountWithoutVAT, amountVAT, sumAmount, totalAmount);
        // prices - END

        // 최종 영수증 데이터 구성 - START
        const receiptInfo = new ReceiptInfo();
        receiptInfo.setOrderInfo = orderInfo;
        receiptInfo.setPrice = price;
        receiptInfo.setProductList = productEntryList;
        const text = this.groupOrderSummary(receiptInfo);
        // 최종 영수증 데이터 구성 - END

        // 영수증 출력 - START
        try {
            this.printer.printText(text);
        } catch (e) {
            this.logger.set('receipt.service', `${e.description}`).error();
            rtn = false;
        }
        // 영수증 출력 - END
        return rtn;
    }

    /**
     * 캐셔 EOD 출력
     *
     * @param eodData EOD 데이터
     */
    printEod(eodData: EodData, mockup = false) {
        let rtn = true;
        if (Utils.isEmpty(eodData.printDate)) {
            eodData.printDate = Utils.convertDateToString(new Date());
        }
        if (Utils.isEmpty(eodData.posNo)) {
            eodData.posNo = this.storage.getTerminalInfo() ? this.storage.getTerminalInfo().id : '';
        }
        if (Utils.isEmpty(eodData.cashierName)) {
            eodData.cashierName = this.storage.getTokenInfo() ? this.storage.getTokenInfo().employeeName : '';
        }
        if (Utils.isEmpty(eodData.cashierId)) {
            eodData.cashierId = this.storage.getTokenInfo() ? this.storage.getTokenInfo().employeeId : '';
        }
        if (Utils.isEmpty(eodData.batchId)) {
            eodData.batchId = this.storage.getBatchInfo() ? this.storage.getBatchInfo().batchNo : '';
        }
        if (mockup) {
            eodData.posNo = '';
            eodData.cashierName = null;
            eodData.cashierId = '';
            eodData.batchId = '';
        }
        const eodInfo: EodInfo = new EodInfo(eodData);
        const text = this.cashierEod(eodInfo);
        // 영수증 출력 - START
        try {
            this.printer.printText(text);
        } catch (e) {
            this.logger.set('receipt.service', `${e.description}`).error();
            rtn = false;
        }
        // 영수증 출력 - END
        return rtn;
    }

    /**
     * EOD 목업 출력
     */
    printEodMockup() {
        try {
            this.printEod(this.makeEodMockupData(), true);
        } catch (e) { }
    }

    /**
     * 주문 정보의 payment 정보를 paymentcapute 정보로 전환(인쇄용)
     *
     * @param paymentinfo 주문정보에 포함되어 있는 payment 정보
     */
    private paymentCaptureConverter(paymentinfo: AmwayPaymentInfoData): any {
        if (paymentinfo.paymentMode.code === PaymentModes.CREDITCARD) {
            return new CreditCardPaymentInfo(
                paymentinfo.amount,
                paymentinfo.paymentMode.code,
                '',
                paymentinfo.paymentInfoLine3,
                '',
                paymentinfo.paymentInfoLine1,
                '',
                paymentinfo.paymentInfoLine4,
                '',
                '',
                '',
                paymentinfo.paymentInfoLine5
            );
        }
        if (paymentinfo.paymentMode.code === PaymentModes.ICCARD) {
            return new ICCardPaymentInfo(paymentinfo.amount);
        }
        if (paymentinfo.paymentMode.code === PaymentModes.CASH) {
            return new CashPaymentInfo(paymentinfo.amount);
        }
        if (paymentinfo.paymentMode.code === PaymentModes.DIRECTDEBIT) {
            return new DirectDebitPaymentInfo(paymentinfo.amount);
        }
        if (paymentinfo.paymentMode.code === PaymentModes.POINT) {
            return new PointPaymentInfo(paymentinfo.amount, '');
        }
        if (paymentinfo.paymentMode.code === PaymentModes.ARCREDIT) {
            return new AmwayMonetaryPaymentInfo(paymentinfo.amount);
        }
    }

    /**
     * EOD 목업 데이터 생성
     */
    private makeEodMockupData(): EodData {
        const eodData = new EodData();
        eodData.printDate = Utils.convertDateToString(new Date());
        eodData.posNo = '';
        eodData.cashierName = '';
        eodData.cashierId = '';
        eodData.batchId = '';
        const o = new OrderEodData();
        o.credit = new CcData(-1, -1);
        o.iccard = new IcData(-1, -1);
        o.debit = new DebitData(-1, -1);
        o.point = new PointData(-1, -1);
        o.recash = new ReCashData(-1, -1);
        o.cash = new CashData(-1, -1);
        o.summary = new SummaryData(-1, -1);
        eodData.normalOrder = o;
        eodData.mediateOrder = o;
        eodData.memberOrder = o;
        eodData.summaryOrder = o;
        const c = new CancelEodData();
        c.orderCancel = new OrderCancel(-1, -1);
        c.mediateCancel = new MediateCancel(-1, -1);
        c.memberCancel = new MemberCancel(-1, -1);
        c.summaryCancel = new SummaryCancel(-1, -1);
        eodData.orderCancel = c;
        return eodData;
    }
}
