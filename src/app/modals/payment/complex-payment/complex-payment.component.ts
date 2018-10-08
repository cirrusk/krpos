import { Component, OnInit, ViewChildren, ElementRef, QueryList, Renderer2, OnDestroy, HostListener } from '@angular/core';
import { ModalComponent, ModalService, Modal, AlertService, Logger, StorageService, CacheService, Config, SpinnerService } from '../../../core';
import { Accounts, PaymentModeListByMain, MemberType, PaymentCapture, AmwayExtendedOrdering, KeyCode, ModalIds, PaymentView, PaymentMode, PaymentModeByMain } from '../../../data';
import { Subscription } from 'rxjs/Subscription';

import { CreditCardComponent } from '../ways/credit-card/credit-card.component';
import { IcCardComponent } from '../ways/ic-card/ic-card.component';
import { CashComponent } from '../ways/cash/cash.component';
import { DirectDebitComponent } from '../ways/direct-debit/direct-debit.component';
import { ReCashComponent } from '../ways/re-cash/re-cash.component';
import { PointComponent } from '../ways/point/point.component';
import { CompletePaymentComponent } from '../complete-payment/complete-payment.component';
import { PaymentService, MessageService, CartService } from '../../../service';
import { Cart } from '../../../data/models/order/cart';
import { Utils } from '../../../core/utils';
import { InfoBroker } from '../../../broker';

@Component({
    selector: 'pos-complex-payment',
    templateUrl: './complex-payment.component.html'
})
export class ComplexPaymentComponent extends ModalComponent implements OnInit, OnDestroy {

    accountInfo: Accounts;
    enableMenu: Array<string>;
    memberType = MemberType;
    totalPrice: number;                             // 총 금액
    received: number;                               // 낸 금액
    change: number;                                 // 거스름돈
    installment: number;                            // 카드 할부
    ccamount: number;                               // 신용카드 결제금액
    cashamount: number;                             // 현금 결제금액
    pointamount: number;                            // 포인트 사용금액
    recashamount: number;                           // Recash 사용금액
    ddamount: number;                               // 자동이체 사용금액
    private isAppr: boolean;
    private point: number;
    private recash: number;
    private paymentModesSubscription: Subscription;
    private paymentSubscription: Subscription;
    private cmplsubscription: Subscription;
    private cartInfo: Cart;
    private amwayExtendedOrdering: AmwayExtendedOrdering;
    private popupList: Array<number>;
    private paymentComponent: any;
    private paymentModeListByMain: PaymentModeListByMain;
    private paymentcapture: PaymentCapture;
    private paymentModes: Map<string, string>;
    private custname: string;
    private custid: string;
    private addPopupType: string;
    private useCache = false;
    private paymentModeLog = false;
    @ViewChildren('paytypes') paytypes: QueryList<ElementRef>;

    // spinnerService 는 HostListener 사용중
    constructor(protected modalService: ModalService,
        private paymentService: PaymentService,
        private modal: Modal,
        private alert: AlertService,
        private storage: StorageService,
        private logger: Logger,
        private info: InfoBroker,
        private cache: CacheService,
        private config: Config,
        private message: MessageService,
        private cartService: CartService,
        private spinnerService: SpinnerService,
        private renderer: Renderer2) {
        super(modalService);
        this.init();
    }

    ngOnInit() {
        this.spinnerService.init();
        this.accountInfo = this.callerData.accountInfo;
        this.cartInfo = this.callerData.cartInfo;
        this.amwayExtendedOrdering = this.callerData.amwayExtendedOrdering;
        if (this.callerData.paymentCapture) {
            this.paymentcapture = this.callerData.paymentCapture;
        }
        this.addPopupType = this.callerData.addPopupType;
        if (this.accountInfo && this.accountInfo.balance) {
            this.point = this.accountInfo.balance[0].amount;
            this.recash = this.accountInfo.balance[1].amount;
        }
        this.useCache = this.config.getConfig('useCache');
        this.paymentModeLog = this.config.getConfig('paymentModeLog');
        this.logger.set('complex.payment.component', Utils.stringify(this.paymentcapture)).debug();
        this.cmplsubscription = this.info.getInfo().subscribe(
            result => {
                if (result != null) {
                    if (result.type === 'orderClear' && result.data === 'clear') { // 복합결제 완료되면 복합결제 팝업 닫기
                        this.close();
                    } else if (result.type === 'popup') {
                        const ptype = result.data;
                        this.popupPayment(ptype);
                    }
                }
            }
        );

        this.popupList.push(0);
        if (this.accountInfo.accountTypeCode === MemberType.ABO) {
            this.custid = this.accountInfo.uid;
            this.custname = this.accountInfo.name;
        } else {
            this.custid = this.accountInfo.parties[0].uid;
            this.custname = this.accountInfo.parties[0].name;
        }
        this.getPaymentModesByMain(this.cartInfo.user.uid, this.cartInfo.code);
        this.totalPrice = this.getTotalPrice();
    }

    ngOnDestroy() {
        if (this.paymentSubscription) { this.paymentSubscription.unsubscribe(); }
        if (this.cmplsubscription) { this.cmplsubscription.unsubscribe(); }
        if (this.paymentModesSubscription) { this.paymentModesSubscription.unsubscribe(); }
    }

    init() {
        this.storage.removePaymentModeCode(); // 주결제 수단 세션 정보 초기화
        this.storage.removePay(); // 복합결제 남은 금액 정보 초기화
        this.popupList = new Array<number>();
        this.enableMenu = new Array<string>();
        this.paymentcapture = new PaymentCapture();
        this.paymentModes = new Map<string, string>();
        this.totalPrice = 0;         // 총 금액
        this.received = 0;           // 낸 금액
        this.change = 0;             // 거스름돈
        this.installment = -1;       // 카드 할부
        this.ccamount = 0;           // 신용카드 결제금액
        this.cashamount = 0;         // 현금 결제금액
        this.pointamount = 0;        // 포인트 사용금액
        this.recashamount = 0;       // Recash 사용금액
        this.ddamount = 0;           // 자동이체 사용금액
    }

    /**
     * 결제 내역 설정
     * 결제금액 : 전체금액 - 프로모션 금액
     * 받은금액 : 모든 결제 수단 금액 합
     * 거스름돈 : 거스름돈
     *
     * @param {PaymentCapture} paymentcapture Payment Capture 정보
     */
    private retreiveInfo(paymentcapture: PaymentCapture) {
        if (paymentcapture) {
            const pay: PaymentView = this.paymentService.viewPayment(paymentcapture, null);
            this.ccamount = pay.cardamount ? pay.cardamount : 0;
            this.installment = pay.cardinstallment ? pay.cardinstallment : -1;
            this.cashamount = pay.cashamount ? pay.cashamount : 0;
            this.change = pay.cashchange ? pay.cashchange : 0;
            this.pointamount = pay.pointamount ? pay.pointamount : 0;
            this.recashamount = pay.recashamount ? pay.recashamount : 0;
            this.received = pay.receivedamount ? pay.receivedamount : 0;
            this.ddamount = pay.directdebitamount ? pay.directdebitamount : 0;
            this.totalPrice = this.getTotalPrice();
        }
    }

    /**
     * 결제금액 계산 : 총 금액 - 프로모션 금액
     */
    private getTotalPrice(): number {
        if (this.cartInfo) { // 프로모션 금액이 있을 경우 프로모션 금액을 차감해야함.
            return this.cartService.getTotalPriceWithTax(this.cartInfo); //  this.cartInfo.totalPrice.value : 0;
        }
        return 0;
    }

    reset() {
        this.paymentcapture = new PaymentCapture();
        this.storage.removePaymentModeCode(); // 금액 잘못 입력등으로 결제창 빠져나올 경우 주결재수단은 초기화!
        // this.storage.removePaymentCapture();
        // this.storage.removePay();
        this.resetSelected();
    }

    creditCard(evt: any) { // creditcard
        if (this.addPopupType === 'card') {
            this.setSelectedById(this.addPopupType, 0, 'creditcard');
        } else {
            this.setSelected(evt, 0, 'creditcard');
        }
        if (this.enableMenu.indexOf('creditcard') > -1) {
            this.selectPopup(ModalIds.CREDIT, CreditCardComponent, null, 'creditcard');
        }
    }

    icCard(evt: any) { // cashiccard
        if (this.addPopupType === 'ic') {
            this.setSelectedById(this.addPopupType, 1, 'cashiccard');
        } else {
            this.setSelected(evt, 1, 'cashiccard');
        }
        if (this.enableMenu.indexOf('cashiccard') > -1) {
            this.selectPopup(ModalIds.IC, IcCardComponent, null, 'cashiccard');
        }
    }

    /**
     * 포인트 결제 : 주결제 수단 아님
     * @param evt 이벤트
     */
    amwayPoint(evt: any) { // point
        if (this.accountInfo.accountTypeCode === MemberType.ABO) {
            if (this.addPopupType === 'apoint') {
                this.setSelectedById(this.addPopupType, 2, 'point');
            } else {
                this.setSelected(evt, 2, 'point');
            }
            if (this.point <= 0) {
                this.alert.warn({ message: this.message.get('no.point', this.custname, this.custid) });
                console.log('amwayPoint>>>>>>>>>>>>>>> ' + this.paymentService.isPaymentProcessing(this.paymentcapture));
                const ispay = this.paymentService.isPaymentProcessing(this.paymentcapture);
                if (!ispay) {
                    this.reset();
                    // this.storage.removePaymentCapture();
                    // this.storage.removePay();
                    // this.retreiveInfo(new PaymentCapture());
                }
                return;
            }
            if (this.enableMenu.indexOf('point') > -1) {
                this.selectPopup(ModalIds.POINT, PointComponent, 'a', 'point');
            }
        }
    }

    /**
     * 포인트 결제 : 주결제 수단 아님
     * @param evt 이벤트
     */
    memberPoint(evt: any) { // point
        if (this.accountInfo.accountTypeCode === MemberType.MEMBER) {
            if (this.addPopupType === 'mpoint') {
                this.setSelectedById(this.addPopupType, 3, 'point');
            } else {
                this.setSelected(evt, 3, 'point');
            }
            if (this.point <= 0) {
                this.alert.warn({ message: this.message.get('no.point', this.custname, this.custid) });
                console.log('memberPoint>>>>>>>>>>>>>>> ' + this.paymentService.isPaymentProcessing(this.paymentcapture));
                const ispay = this.paymentService.isPaymentProcessing(this.paymentcapture);
                if (!ispay) {
                    this.reset();
                    // this.storage.removePaymentCapture();
                    // this.storage.removePay();
                    // this.retreiveInfo(new PaymentCapture());
                }

                return;
            }
            if (this.enableMenu.indexOf('point') > -1) {
                this.selectPopup(ModalIds.POINT, PointComponent, 'm', 'point');
            }
        }
    }

    /**
     * 현금 결제
     *
     * 키이벤트로 접근시 addPopupType이 넘어옴.
     *
     * @param evt 이벤트
     */
    cashPayment(evt: any) { // cash
        if (this.addPopupType === 'cash') {
            this.setSelectedById(this.addPopupType, 4, 'cash');
        } else {
            this.setSelected(evt, 4, 'cash');
        }
        if (this.enableMenu.indexOf('cash') > -1) {
            this.selectPopup(ModalIds.CASH, CashComponent, null, 'cash');
        }
    }

    /**
     * 수표 결제(cash 에 CashType 만 CHECK)
     * @param evt 이벤트
     */
    checkPayment(evt: any) { // cheque
        const cashmodal = this.storage.getLatestModalId();
        if (cashmodal && cashmodal === ModalIds.CASH) {
            if (this.addPopupType === 'cheque') {
                this.setSelectedById(this.addPopupType, 5, 'cheque');
            } else {
                this.setSelected(evt, 5, 'cheque');
            }
            if (this.enableMenu.indexOf('cheque') > -1) {
                this.selectPopup(ModalIds.CHEQUE, CashComponent, null, 'cheque');
            }
        }
    }

    directDebitPayment(evt: any) { // directdebit
        if (this.addPopupType === 'debit') {
            this.setSelectedById(this.addPopupType, 6, 'directdebit');
        } else {
            this.setSelected(evt, 6, 'directdebit');
        }
        if (this.enableMenu.indexOf('directdebit') > -1) {
            this.selectPopup(ModalIds.DEBIT, DirectDebitComponent, null, 'directdebit');
        }
    }

    reCashPayment(evt: any) { // arCredit
        if (this.recash <= 0) {
            this.alert.warn({ message: this.message.get('no.recash', this.custname, this.custid) });
            return;
        }
        if (this.addPopupType === 'recash') {
            this.setSelectedById(this.addPopupType, 7, 'arCredit');
        } else {
            this.setSelected(evt, 7, 'arCredit');
        }

        if (this.enableMenu.indexOf('arCredit') > -1) {
            this.selectPopup(ModalIds.RECASH, ReCashComponent, null, 'arCredit');
        }
    }

    openPopup() {
        this.popupList.sort();
        this.modal.openModalByComponent(CompletePaymentComponent, {
            callerData: { accountInfo: this.accountInfo, cartInfo: this.cartInfo, amwayExtendedOrdering: this.amwayExtendedOrdering },
            closeByClickOutside: false,
            closeByEscape: false,
            modalId: ModalIds.COMPLETE,
            paymentType: 'c'
        });
    }

    /**
     * 컴포넌트 모달 팝업 호출
     *
     * @param modalId 모달 아이디
     * @param component 컴포넌트
     * @param pointtype 포인트 유형(ABO, MEMBER)
     * @param payment 주결제 수단 조회 키값(Place Order 시에 주결제 수단을 PaymentMode에 설정)
     */
    selectPopup(modalId: string, component: any, pointtype?: string, payment?: string) {
        this.paymentComponent = component;
        const mainpayment = this.paymentService.getPaymentModeCode(this.paymentcapture);
        if (payment && Utils.isEmpty(mainpayment)) {
            if (this.paymentModes.has(payment)) { // 주결제 수단일 경우 선택 시 주결제 수단을 세션에 설정
                const mainpayment = this.paymentService.getPaymentModeCode(this.paymentcapture);
                if (this.paymentModeLog) {
                    const s: Array<string> = new Array<string>();
                    s.push('\n┌───────────── Select Main Payment ─────────────────');
                    s.push(`\n│    ${payment}  ====>  ${mainpayment}`);
                    s.push('\n└───────────────────────────────────────────────────');
                    this.logger.set('complex.payment.component', s.join('')).all();
                }
                if (Utils.isNotEmpty(mainpayment)) {
                    this.storage.setPaymentModeCode(mainpayment); // 주결제 수단을 세션에 설정
                } else {
                    this.storage.setPaymentModeCode(payment); // 주결제 수단을 세션에 설정
                }
            } else {
                this.logger.set('complex.payment.component', `${payment} 은(는) 주결제 수단이 아님.}`).warn();
            }
        }

        if (payment && (payment === 'creditcard' || payment === 'cashiccard')) { // 신용카드 및 IC카드인 경우 한번 하면 더 못하도록 막기
            if (this.paymentcapture.ccPaymentInfo) {
                this.alert.warn({ message: this.message.get('go.payment', '신용카드'), timer: true, interval: 1500 });
                this.enableMenu = this.enableMenu.filter(item => item !== payment);
                return;
            }
            if (this.paymentcapture.icCardPaymentInfo) {
                this.alert.warn({ message: this.message.get('go.payment', '현금IC카드'), timer: true, interval: 1500 });
                this.enableMenu = this.enableMenu.filter(item => item !== payment);
                return;
            }
        }

        this.modal.openModalByComponent(this.paymentComponent, {
            callerData: { accountInfo: this.accountInfo, cartInfo: this.cartInfo, paymentCapture: this.paymentcapture, amwayExtendedOrdering: this.amwayExtendedOrdering },
            closeByClickOutside: false,
            modalId: modalId,
            pointType: pointtype,
            paymentType: 'c'
        }).subscribe(payments => {
            if (payments) {
                this.remakePaymentCapture(payments);
                this.isAppr = true;
            } else {
                if (!this.isAppr) { // 초기화, 무조건 하나라도 결제가 이루어지면 초기화 안됨.
                    this.reset();
                }
                // this.enableMenu.push(payment); // 그냥 취소했을 경우는 다시 메뉴선택가능하도록 원복
            }
        });
    }

    /**
     * 각각의 결제 Payment 를 모아서 하나의 Payment Capture 정보를 구성
     *
     * @param paymentcapture 각각의 결제창에서 전달된 Payment Capture 정보
     */
    private remakePaymentCapture(paymentcapture: PaymentCapture) {
        if (paymentcapture) {
            this.logger.set('complex.payment.component params for remake', `${Utils.stringify(paymentcapture)}`).debug();
            if (paymentcapture.ccPaymentInfo) {
                this.paymentcapture.ccPaymentInfo = paymentcapture.ccPaymentInfo;
            }
            if (paymentcapture.cashPaymentInfo) {
                this.paymentcapture.cashPaymentInfo = paymentcapture.cashPaymentInfo;
            }
            if (paymentcapture.directDebitPaymentInfo) {
                this.paymentcapture.directDebitPaymentInfo = paymentcapture.directDebitPaymentInfo;
            }
            if (paymentcapture.icCardPaymentInfo) {
                this.paymentcapture.icCardPaymentInfo = paymentcapture.icCardPaymentInfo;
            }
            if (paymentcapture.monetaryPaymentInfo) {
                this.paymentcapture.monetaryPaymentInfo = paymentcapture.monetaryPaymentInfo;
            }
            if (paymentcapture.pointPaymentInfo) {
                this.paymentcapture.pointPaymentInfo = paymentcapture.pointPaymentInfo;
            }
            if (paymentcapture.voucherPaymentInfo) {
                // this.paymentcapture.voucherPaymentInfo = paymentcapture.voucherPaymentInfo;
                this.logger.set('complex.payment.component', 'no apply voucherPaymentInfo').info();
            }
            // this.storage.setPaymentCapture(this.paymentcapture);
            this.retreiveInfo(this.paymentcapture); // 결제금액 정보를 세팅함.
        }
        this.logger.set('complex.payment.component convert for remake', `${Utils.stringify(this.paymentcapture)}`).debug();
    }

    /**
     * 쿠폰결제 시 메뉴 메뉴활성화
     */
    private setCouponEnabler() {
        if (this.paymentcapture.voucherPaymentInfo) {
            this.setEnableMenu('creditvoucher');
        }
    }

    /**
     * ABO
     *  자동이체	현금(수표)	Recash	A포인트	쿠폰
     *  현금 IC 카드
     *  현금(수표)
     *  현금(수표)	A포인트
     *  현금(수표)	A포인트	쿠폰
     *  현금(수표)	Recash
     *  현금(수표)	Recash	쿠폰
     *  현금(수표)	A포인트	Recash
     *  현금(수표)	A포인트	Recash	쿠폰
     *  Recash
     *  Recash	A포인트
     *  Recash	A포인트	쿠폰
     *  A포인트
     *  A포인트 Recash
     *  A포인트 Recash 쿠폰
     *
     * MEMBER
     *  신용카드
     *  신용카드	현금(수표)
     *  신용카드	M포인트
     *  신용카드	현금(수표)	M포인트
     *  체크카드
     *  체크카드	현금(수표)
     *  체크카드	M포인트
     *  체크카드	현금(수표)	M포인트
     *  현금(수표)
     *  현금(수표)	M포인트
     *  현금 IC 카드
     *
     * CUSTOMER
     *  신용카드
     *  신용카드	현금(수표)
     *  체크카드
     *  체크카드	현금(수표)
     *  현금 IC 카드
     *  현금(수표)
     *
     * @param {string} userId 회원 아이디
     * @param {string} cartId 카트 아이디
     */
    private getPaymentModesByMain(userId: string, cartId: string): void {
        if (this.useCache) {
            this.paymentModesSubscription = this.cache.get('PM-' + userId, this.paymentService.getPaymentModesByMain(userId, cartId)).subscribe(
                result => {
                    if (result) {
                        this.paymentModeset(result);
                    }
                },
                error => {
                    const errdata = Utils.getError(error);
                    if (errdata) {
                        this.logger.set('complex.payment.component', `${errdata.message}`).error();
                        this.alert.error({ message: this.message.get('server.error', errdata.message) });
                    }
                });
        } else {
            this.paymentModesSubscription = this.paymentService.getPaymentModesByMain(userId, cartId).subscribe(
                result => {
                    if (result) {
                        this.paymentModeset(result);
                    }
                },
                error => {
                    const errdata = Utils.getError(error);
                    if (errdata) {
                        this.logger.set('complex.payment.component', `${errdata.message}`).error();
                        this.alert.error({ message: this.message.get('server.error', errdata.message) });
                    }
                });
        }
    }

    /**
     * 결제수단별 설정
     *
     * @param {PaymentModeListByMain} result 주결제 및 결제수단 목록
     */
    private paymentModeset(result: any) {
        this.paymentModeListByMain = result;
        if (result.paymentModes && result.paymentModes.length > 0) {
            this.setCouponEnabler(); // 쿠폰결제 하고 들어오면 활성화할 메뉴 체크.
            this.paymentModeListByMain.paymentModes.forEach(paymentmode => {
                const pmc = paymentmode.code.substring(paymentmode.code.lastIndexOf('-') + 1);
                this.paymentModes.set(pmc, pmc);
                this.printPaymentModeLog(pmc, paymentmode);
            });
            this.popupPayment(this.addPopupType); // 추가 팝업이 있을경우 처리
        } else {
            this.alert.warn({ message: this.message.get('not.set.paymentmode') });
        }
    }

    /**
     * 결제 지불 수단 출력
     *
     * @param pmc 결제 지불 수단 코드
     * @param paymentmode 결제 지불 수단 목록
     */
    private printPaymentModeLog(pmc: string, paymentmode: PaymentModeByMain) {
        if (this.paymentModeLog) {
            const paymentmodes: PaymentMode[] = paymentmode.paymentModes;
            const s: Array<string> = new Array<string>();
            s.push('\n┌──────────── Main payment ─────────────────');
            s.push(`\n│   ${pmc} (${paymentmode.code})`);
            s.push('\n└───────────────────────────────────────────');
            s.push('\n┌───────────── Sub payment ─────────────────');
            paymentmodes.forEach((pm, idx) => {
                s.push(`\n│   [${++idx}] ${pm.name} (${pm.code})`);
            });
            s.push('\n└───────────────────────────────────────────');
            this.logger.set('complex.payment.component', s.join('')).all();
        }
    }

    private popupPayment(popupType: string) {
        const modalids = this.storage.getAllModalIds();
        if (modalids && modalids.length === 2) { // 실결제 팝업까지 떠있을 경우는 진행하지 못하도록 함.
            return;
        }
        if (popupType) {
            if (popupType === 'card') {
                this.creditCard(event);
            } else if (popupType === 'ic') {
                this.icCard(event);
            } else if (popupType === 'debit') {
                this.directDebitPayment(event);
            } else if (popupType === 'recash') {
                this.reCashPayment(event);
            } else if (popupType === 'cash') {
                this.cashPayment(event);
            } else if (popupType === 'cheque') {
                this.checkPayment(event);
            } else {
                if (popupType.endsWith('point')) {
                    if (this.accountInfo.accountTypeCode === MemberType.ABO) {
                        this.amwayPoint(event);
                    }
                    if (this.accountInfo.accountTypeCode === MemberType.MEMBER) {
                        this.memberPoint(event);
                    }
                }
            }
        }
    }

    close() {
        const p: PaymentCapture = this.storage.getPaymentCapture();
        if (p) {
            if (p.ccPaymentInfo || p.icCardPaymentInfo) {
                if (p.ccPaymentInfo) {
                    this.alert.warn({ message: this.message.get('not.yet.payment.card', '신용카드'), timer: true, interval: 1800 });
                } else if (p.icCardPaymentInfo) {
                    this.alert.warn({ message: this.message.get('not.yet.payment.card', '현금IC카드'), timer: true, interval: 1800 });
                }
                return;
            } else if (p.cashPaymentInfo
                || p.directDebitPaymentInfo
                || p.monetaryPaymentInfo
                || p.pointPaymentInfo) {
                this.modal.openConfirm({
                    title: '결제 취소',
                    message: this.message.get('init.payment'),
                    actionButtonLabel: '확인',
                    closeButtonLabel: '취소',
                    closeByClickOutside: false,
                    closeByEnter: true,
                    modalId: ModalIds.APPRCANCEL,
                    beforeCloseCallback: function () {
                        if (this.isEnter) {
                            this.result = this.isEnter;
                        }
                    }
                }).subscribe(
                    result => {
                        if (typeof result !== undefined && result === true) {
                            this.storage.removePaymentProcessing();
                            this.deleteCartCoupon();
                            this.closeModal();
                        }
                    });
            } else {
                this.closeModal();
            }
        } else {
            this.closeModal();
        }
    }

    private deleteCartCoupon() {
        if (this.cartInfo.appliedCouponData && this.cartInfo.appliedCouponData.length > 0) {
            const couponcode = this.cartInfo.appliedCouponData[0].code ? this.cartInfo.appliedCouponData[0].code : this.cartInfo.appliedCouponData[0].couponCode;
            this.paymentService.deleteCoupon(this.cartInfo.user.uid, this.cartInfo.code, couponcode).subscribe(
                result => {
                    if (result) {
                        this.info.sendInfo('cartreload', result);
                    }
                });
        }
    }

    /**
     * Add On
     * @param evt
     * @param num
     */
    private setSelected(evt: any, num: number, type: string) {
        evt.stopPropagation();
        if (this.paymentModeListByMain.paymentModes && this.paymentModeListByMain.paymentModes.length > 0) {
            if (this.enableMenu.length === 0) {
                const chk = evt.target.classList.contains('on');
                const parent = this.renderer.parentNode(evt.target);
                if (chk) {
                    const index = this.popupList.indexOf(num);
                    this.popupList.splice(index, 1);
                    this.renderer.removeClass(parent, 'on');
                    this.renderer.removeClass(evt.target, 'on');
                } else {
                    this.popupList.push(num);
                    if (this.enableMenu.length < 1) { this.setEnableMenu(type); }
                    this.renderer.addClass(parent, 'on');
                    this.renderer.addClass(evt.target, 'on');
                }
            }
        } else {
            this.alert.warn({ message: this.message.get('not.set.paymentmode') });
        }
    }

    private setSelectedById(id: string, num: number, type: string) {
        const $this = this.paytypes.find(menu => menu.nativeElement.getAttribute('id') === id).nativeElement;
        if (this.paymentModeListByMain.paymentModes && this.paymentModeListByMain.paymentModes.length > 0) {
            if (this.enableMenu.length === 0) {
                const chk = $this.classList.contains('on');
                const parent = this.renderer.parentNode($this);
                if (chk) {
                    const index = this.popupList.indexOf(num);
                    this.popupList.splice(index, 1);
                    this.renderer.removeClass(parent, 'on');
                    this.renderer.removeClass($this, 'on');
                } else {
                    this.popupList.push(num);
                    if (this.enableMenu.length < 1) { this.setEnableMenu(type); }
                    this.renderer.addClass(parent, 'on');
                    this.renderer.addClass($this, 'on');
                }
            }
        } else {
            this.alert.warn({ message: this.message.get('not.set.paymentmode') });
        }
    }

    private resetSelected() {
        this.paytypes.forEach(paytype => {
            parent = this.renderer.parentNode(paytype.nativeElement);
            this.renderer.removeClass(parent, 'on');
            this.renderer.removeClass(paytype.nativeElement, 'on');
        });
        this.popupList = [];
        this.enableMenu = [];
    }

    setEnableMenu(type: string) {
        if (this.paymentModeListByMain.paymentModes) {
            const existedIdx: number = this.paymentModeListByMain.paymentModes.findIndex(
                function (obj) {
                    return obj.code.substring(obj.code.lastIndexOf('-') + 1) === type;
                }
            );
            if (existedIdx === -1) { return; }
            this.printPaymentEnableMenuLog(this.paymentModeListByMain.paymentModes[existedIdx].paymentModes);
            this.paymentModeListByMain.paymentModes[existedIdx].paymentModes.forEach(paymentType => {
                this.enableMenu.push(paymentType.code);
            });
        }
    }

    /**
     * 주 결제 수단 선택 시 활성화되는 지불 수단 로그 출력
     *
     * @param paymentmodes 지불 수단 목록
     */
    private printPaymentEnableMenuLog(paymentmodes: PaymentMode[]) {
        if (this.paymentModeLog) {
            const s: Array<string> = new Array<string>();
            s.push('\n┌───────────── Enable Menu ─────────────────');
            paymentmodes.forEach((paymentmode, idx) => {
                s.push(`\n│   [${++idx}] ${paymentmode.name} (${paymentmode.code})`);
            });
            s.push('\n└───────────────────────────────────────────');
            this.logger.set('complex.payment.component', s.join('')).all();
        }
    }

    // 이벤트 리스닝이므로 모달 이벤트와 쫑난다.
    // 반드시 컴포넌트의 모달 아이디 체크를 해야함.
    // 가급적 모달 컴포넌트의 모달 아이디는 변경하지 않아야함.
    @HostListener('document:keydown', ['$event', 'this.spinnerService.status()'])
    onKeyBoardDown(event: any, isSpinnerStatus: boolean) {
        event.stopPropagation();
        if (event.target.tagName === 'INPUT') { return; }
        const modals: string[] = this.storage.getAllModalIds();
        if (modals && modals.length === 1) {
            const latestmodalid = this.storage.getLatestModalId();
            if (latestmodalid === ModalIds.COMPLEX) {
                if (event.keyCode === KeyCode.ESCAPE && !isSpinnerStatus) {
                    this.close();
                }
            }
        }
    }

}
