import { Component, OnInit, OnDestroy, ElementRef, ViewChildren, QueryList, HostListener } from '@angular/core';
import { Subscription } from 'rxjs/Subscription';

import { range } from 'lodash';
import { ModalComponent, ModalService, StorageService, KeyboardService, KeyCommand, SpinnerService } from '../../../core';
import { KeyCode, StatusDisplay, OrderEntry } from '../../../data';
import { Utils } from '../../../core/utils';
import { Product } from '../../../data/models/cart/cart-data';

/**
 * Serial / RFID 입력
 *
 * 처리 절차
 *   1.	제품의 바코드를 스캔
 *   2.	POS 는 바코드 값으로 Hybris 에 제품 검색
 *   3.	검색 결과 Serial 또는 RFID 포함 제품인 경우,
 *     1)	'1 개 입력용 Serial, RFID 입력 팝업' 출력
 *         -	입력용 text 필드 있어야 함
 *         -	text 필드가 비어 있어도 닫을 수 있음 (Backoffice 를 활용해 후처리)
 *   4.	1 부터 제품 스캔을 계속 또는 아래 5번 수량변경 기능으로 이동
 *
 * 수량 변경 기능 : 상품을 클릭하여 활성화한 후 수량 변경 키보드 키를 누르고, 수량을 수정함
 *   5.	캐셔는 상품 선택 : 수량변경 키 누름 을 차례로 실행해 수량 변경 팝업 띄움
 *   6.	변경할 수량 입력 후 확인 클릭
 *     1)	해당 상품이 Serial / RFID 상품이면,
 *        -> 수량이 적어지면,
 *           'Serial / RFID 상품은 상품 삭제 후 처음부터 다시 입력하여야 합니다.' 앨러트 출력
 *           수량 변동 없이 수량변경 팝업 닫힘
 *       	-> 수량이 늘어나면,
 *           늘어난 수량 만큼 입력용 Serial, RFID 입력 팝업 출력
 *           컬럼은 순번, Serial 또는 RFID 값
 *           이미 입력된 상품의 Serial, RFID 가 상단에 출력
 *           추가할 개수만큼 빈 텍스트 필드들 출력
 *           1건을 바코드, Serial 입력하고 10으로 수량변경 한다면, 최상단 1건은 <span>1 시리얼 값</span>
 *           2행부터 10행까지는 순번 [          ] (빈 텍스트 필드) 출력
 *           text 필드가 비어 있어도 닫을 수 있음 (Backoffice 를 활용해 후처리)
 *
 * 스크롤은 vertical scrollbar (페이지 X)
 * 다음 빈 칸으로 자동 포커싱 되어야 함
 * (처음에는 2행에 포커싱, 입력 후 엔터키 치면 3행으로 포커스 이동) 스캐너에서 자동 엔터키 입력됨
 *
 * 변경사항) 2018.09.07 Serial은 100% 입력, RFID는 100% 입력이 안되더라도 넘어갈 수 있음
 *
 * 요건 중 수량 변경 시 Serial/RFID 최초 상품 1건에 대한 표기 요건이 있었으나
 * 이후 입력된 모든 Serial/RFID 에 대해서 표기 요청으로 변경
 *
 * @since 2018.08.09 RFID를 Serial에 통합
 */
@Component({
    selector: 'pos-serial',
    templateUrl: './serial.component.html'
})
export class SerialComponent extends ModalComponent implements OnInit, OnDestroy {
    regLabel: string;
    finishStatus: string;
    checktype: number;
    apprmessage: string;
    productInfo: Product;
    productCount = [];
    serialsrfids: Array<string>;
    singleInputFlag: boolean;
    private addProduct = false;
    private dupcheck = false;
    private serialNumbers = [];
    private scanInputSize: number;
    private cartqty: number;
    private changeqty: number;
    private isSerialProduct: boolean;
    private cartInfo: OrderEntry[];
    private userId: string;
    private keyboardsubscription: Subscription;
    @ViewChildren('codes') codes: QueryList<ElementRef>;

    // spinnerService 는 HostListener 사용중
    constructor(protected modalService: ModalService, private keyboard: KeyboardService, private storage: StorageService,
        private spinnerService: SpinnerService) {
        super(modalService);
        this.finishStatus = null;
        this.checktype = 0;
        this.scanInputSize = 0;
    }

    ngOnInit() {
        this.spinnerService.init();
        this.keyboardsubscription = this.keyboard.commands.subscribe(c => {
            this.handleKeyboardCommand(c);
        });
        this.productInfo = this.callerData.productInfo;
        if (this.productInfo) {
            if (this.productInfo.serialNumber) { this.isSerialProduct = true; }
            if (this.productInfo.rfid) { this.isSerialProduct = false; }
        }
        this.cartInfo = this.callerData.cartInfo ? this.callerData.cartInfo : null;
        this.addProduct = this.callerData.addProduct ? this.callerData.addProduct : false;
        this.cartqty = this.callerData.cartQty ? this.callerData.cartQty : 0; // 카트에 담긴 제품 수량
        this.userId = this.callerData.userId;

        this.changeqty = this.callerData.productQty ? this.callerData.productQty : 1; // 수량변경한 제품 수량
        this.serialsrfids = this.storage.getSerialCodes(this.userId + '_' + this.productInfo.code);
        if (this.serialsrfids && this.serialsrfids.length > 0) {
            this.singleInputFlag = false;
        } else { // 입력한 값이 없으면 single input
            this.singleInputFlag = true;
        }
        if (this.changeqty === 0) {
            this.productCount = range(0, 1);
        } else {
            this.scanInputSize = this.changeqty - this.cartqty;
            const inputedRfidCount = this.serialsrfids ? this.serialsrfids.length : 0; // 입력된 SERIAL / RFID 개수
            if (this.isSerialProduct) {
                if (this.addProduct) { // SERIAL 상품 추가인 경우
                    this.scanInputSize = inputedRfidCount + 1;
                    this.changeqty = this.scanInputSize;
                    if (this.scanInputSize === 1) {
                        this.singleInputFlag = true;
                    } else {
                        this.singleInputFlag = false;
                    }
                    if (inputedRfidCount > 0) {
                        const inputSize = this.scanInputSize - inputedRfidCount;
                        this.productCount = range(0, inputSize);
                    } else {
                        this.productCount = range(0, this.scanInputSize);
                    }
                    this.scanInputSize = this.productCount.length; // RFID인 경우 입력창개수를 refresh 해주어야 마지막 input에서 등록 처리됨.
                } else { // 수량 변경인 경우
                    const currRfidCount = inputedRfidCount + this.scanInputSize;
                    if (this.changeqty === currRfidCount) {
                        this.productCount = range(0, this.scanInputSize);
                    } else {
                        this.singleInputFlag = false; // single input인 경우 rfid이면 개수만큼 입력창 만들어주어야함.
                        const inputSize = this.scanInputSize + (this.changeqty - currRfidCount);
                        this.productCount = range(0, inputSize);
                        this.scanInputSize = this.productCount.length; // RFID인 경우 입력창개수를 refresh 해주어야 마지막 input에서 등록 처리됨.
                    }
                }
            } else { // RFID인 경우 빈값으로 입력하더라도 입력창을 열어주어야함.
                if (this.addProduct) { // RFID 상품 추가인 경우
                    const order: OrderEntry = this.cartInfo.find(orderentry => orderentry.product.code === this.productInfo.code);
                    const cartqty = order ? order.quantity : 0;
                    this.scanInputSize = cartqty + 1;
                    this.changeqty = this.scanInputSize;
                    if (this.scanInputSize === 1) {
                        this.singleInputFlag = true;
                    } else {
                        this.singleInputFlag = false;
                    }
                    // const currRfidCount = inputedRfidCount + 1;
                    if (inputedRfidCount > 0) {
                        const inputSize = this.scanInputSize - inputedRfidCount;
                        this.productCount = range(0, inputSize);
                    } else {
                        this.productCount = range(0, this.scanInputSize);
                    }
                    this.scanInputSize = this.productCount.length; // RFID인 경우 입력창개수를 refresh 해주어야 마지막 input에서 등록 처리됨.
                } else { // 수량 변경인 경우
                    const currRfidCount = inputedRfidCount + this.scanInputSize;
                    if (this.changeqty === currRfidCount) {
                        this.productCount = range(0, this.scanInputSize);
                    } else {
                        this.singleInputFlag = false; // single input인 경우 rfid이면 개수만큼 입력창 만들어주어야함.
                        const inputSize = this.scanInputSize + (this.changeqty - currRfidCount);
                        this.productCount = range(0, inputSize);
                        this.scanInputSize = this.productCount.length; // RFID인 경우 입력창개수를 refresh 해주어야 마지막 input에서 등록 처리됨.
                    }
                }
            }
        }
        if (this.productInfo) {
            this.regLabel = '시리얼 번호 입력 / RFID 스캔';
        }
        setTimeout(() => { this.codes.first.nativeElement.focus(); }, 50);
    }

    ngOnDestroy() {
        if (this.keyboardsubscription) { this.keyboardsubscription.unsubscribe(); }
    }

    /**
     * 입력 체크하기(엔터 칠 경우)
     *
     * 중요 변경 사항)
     * 시리얼 번호 또는 RFID 가 인식되지 않는 경우
     * Blank 상태로 [확인] Btn 터치 or [ENTER] KEY 입력/처리 가능
     *
     * @param {any} codes 입력한 input 요소
     * @param {any} evt 이벤트
     */
    checkEnter(codes: any, evt: any) {
        evt.preventDefault();
        if (this.isSerialProduct) { // Serial 인 경우 모든 제품 입력해야함.
            const code = codes.value;
            if (Utils.isEmpty(code)) {
                this.checktype = -1;
                const prdname = codes.getAttribute('data-prdname');
                this.apprmessage = `${prdname} 상품을 스캔해주세요.`;
                const target = evt.target || evt.srcElement || evt.currentTarget;
                if (target) { setTimeout(() => { target.focus(); }, 50); }
                return;
            } else {
                this.checktype = 0;
            }
        }
        if (evt.srcElement.parentElement.nextElementSibling) { // INPUT 요소를 한번 감싸고 있을 경우
            const elms = evt.srcElement.parentElement.nextElementSibling.childNodes;
            elms.forEach(elm => {
                if (elm.nodeType === 1 && elm.nodeName === 'INPUT') { elm.focus(); }
            });
        } else { // 마지막 요소임.
            if (!this.isSerialProduct) { // RFID인 경우 미입력항목 체크하지 않고 바로 처리
                setTimeout(() => { this.reg(); }, 50);
            }
        }
        if (this.isSerialProduct) {
            let reg = 0;
            this.codes.forEach(cd => {
                if (Utils.isEmpty(cd.nativeElement.value)) {
                    reg--;
                }
            });
            if (reg === 0) {
                this.finishStatus = StatusDisplay.PAID;
                this.apprmessage = '스캔이 완료되었습니다.';
                if (this.isSerialProduct) {
                    setTimeout(() => { this.reg(); }, 50);
                }
            }
        }
    }

    /**
     * Serial / RFID 입력하기
     * Serial / RFID 가 배열로 입력되도록
     * API가 변경되었으므로 기존의 string 은
     * 빈값으로 처리하거나 제거하도록 함.
     * 수량변경 시 변경 수량이 큰 경우는 기존 값을 더해주어야함.
     * 수량변경 시 변경 수량이 작은 경우는 front에서 막음.
     */
    reg() {
        let rtype: string;
        let scannedRegCount = 0;
        let prdname: string;
        let pelm: any;
        this.codes.forEach(cd => {
            rtype = cd.nativeElement.getAttribute('data-rfid') ? cd.nativeElement.getAttribute('data-rfid') : 'false';
            if (cd.nativeElement.getAttribute('type') === 'text') {
                if (Utils.isEmpty(cd.nativeElement.value)) {
                    if (rtype === 'true') { scannedRegCount++; } // RFID 인 경우 입력안해도 넘어가도록 처리
                    if (rtype === 'false') {
                        prdname = cd.nativeElement.getAttribute('data-prdname');
                        pelm = cd;
                        return false;
                    }
                } else {
                    this.serialNumbers.push(cd.nativeElement.value);
                    scannedRegCount++;
                }
            }
        });
        if (this.scanInputSize === scannedRegCount) {
            if (this.changeqty > this.cartqty) {
                const orgSerials: Array<string> = this.storage.getSerialCodes(this.userId + '_' + this.productInfo.code);
                if (orgSerials && Array.isArray(orgSerials)) {
                    this.serialNumbers.forEach(serial => {
                        orgSerials.push(serial); // 원래 입력했던거 찾아서 넣어주기
                    });
                    this.serialNumbers = orgSerials.reduce(function (a, b) { if (a.indexOf(b) < 0) { a.push(b); } return a; }, []);
                }
            }
            this.checktype = 0;
            this.apprmessage = '스캔이 완료되었습니다.';
            this.serialNumbers = this.serialNumbers.reduce(function (a, b) { if (a.indexOf(b) < 0) { a.push(b); } return a; }, []);
            this.result = { serialNumbers: this.serialNumbers };
            setTimeout(() => { this.close(); }, 250);
        } else {
            if (this.isSerialProduct) {
                this.checktype = -1;
                this.apprmessage = `${prdname} 상품을 스캔해주세요.`;
                if (pelm) { setTimeout(() => { pelm.nativeElement.focus(); }, 50); }
            }
        }
    }

    close() {
        this.closeModal();
    }

    @HostListener('document:keydown', ['$event', 'this.spinnerService.status()'])
    onSerialKeyBoardDown(event: any, isSpinnerStatus: boolean) {
        event.stopPropagation();
        if (event.target.tagName === 'INPUT') { return; }
        if (event.keyCode === KeyCode.ENTER && !isSpinnerStatus) {
            if (this.finishStatus === StatusDisplay.PAID) {
                if (!this.dupcheck) {
                    setTimeout(() => { this.reg(); }, 50);
                    this.dupcheck = true;
                }
            }
        }
    }

    protected doPageUp(evt: any) {
        setTimeout(() => { this.codes.first.nativeElement.focus(); }, 100);
    }

    protected doPageDown(evt: any) {
        setTimeout(() => { this.codes.last.nativeElement.focus(); }, 100);
    }

    private handleKeyboardCommand(command: KeyCommand) {
        try {
            this[command.name](command.ev);
        } catch (e) { }
    }

}
