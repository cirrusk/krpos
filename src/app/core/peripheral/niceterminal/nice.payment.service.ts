import { Injectable } from '@angular/core';

// import { Subject, Observable, BehaviorSubject } from 'rxjs';
import { Observable } from 'rxjs/Observable';
import { Subject } from 'rxjs/Subject';
import { BehaviorSubject } from 'rxjs/BehaviorSubject';
import 'rxjs/add/operator/first';
import 'rxjs/add/operator/take';

import { NiceDriver } from './nice.driver';
import { Logger } from '../../logger/logger';
import { CardApprovalResult } from './vo/card.approval.result';
import { CardPopulator } from './populator/card.populator';
import { CardApprovalRequest } from './vo/card.approval.request';
import { CardCancelResult } from './vo/card.cancel.result';
import { CardCancelRequest } from './vo/card.cancel.reqeust';
import { ICCardApprovalResult } from './vo/iccard.approval.result';
import { ICCardPopulator } from './populator/iccard.populator';
import { ICCardApprovalRequest } from './vo/iccard.approval.request';
import { ICCardCancelRequest } from './vo/iccard.cancel.request';
import { ICCardCancelResult } from './vo/iccard.cancel.result';
import { NiceConstants } from './nice.constants';
import { WebsocketResult } from './vo/result.common';

@Injectable()
export class NicePaymentService {

    constructor(private niceDriver: NiceDriver, private logger: Logger) {
    }

    public init() {
        this.logger.set('nice.payment.service', 'init...').debug();
    }

    public cardApproval(amount: string, installment: string): Subject<CardApprovalResult> {
        if (this.isNotValidAmount(amount) || this.isNotValidInstallment(installment)) {
            const errResult: CardApprovalResult = new CardApprovalResult();
            return this.genArgumentErrorNotifier(errResult, NiceConstants.ERROR_CODE.APPROVAL_ARG_ERROR);
        }

        const requestVO: CardApprovalRequest = CardPopulator.fillApprovalReqVO(amount, installment);

        const notifier: Subject<CardApprovalResult> = new Subject();

        // 로깅 -> 추후 Persistence 고려
        // console.log('Card Approval Request');
        // console.log(requestVO.stringify());
        this.logger.set('Card Approval Request', requestVO.stringify()).info();

        const body: string = CardPopulator.generateApprovalReq(requestVO);

        const obs: Observable<any> = this.niceDriver.send(body);

        obs.first().subscribe(
            (res) => {
                const raw: string = res;

                const resultVO: CardApprovalResult = CardPopulator.parseApprovalResult(raw);

                // 로깅 -> 추후 Persistence 고려
                // console.log('Card Approval Result');
                // console.log(resultVO.stringify());
                this.logger.set('Card Approval Result', resultVO.stringify()).info();

                notifier.next(resultVO);
            },
            (err) => {
                throw new Error('Can not receive card approval');
            }
        );

        return notifier;
    }

    public cardCancel(amount: string, approvalNumber: string, approvalDate: string, installment: string): Subject<CardCancelResult> {
        if (this.isNotValidAmount(amount) || this.isNotValidInstallment(installment)) {
            const errResult: CardCancelResult = new CardCancelResult();
            return this.genArgumentErrorNotifier(errResult, NiceConstants.ERROR_CODE.APPROVAL_ARG_ERROR);
        }

        const notifier: Subject<CardCancelResult> = new Subject();

        const requestVO: CardCancelRequest = CardPopulator.fillCancelReqVO(amount, approvalNumber, approvalDate, installment);

        // 로깅 -> 추후 Persistence 고려
        this.logger.set('Card Cancel Request', requestVO.stringify()).info();

        const body: string = CardPopulator.generateCancelReq(requestVO);

        const obs: Observable<any> = this.niceDriver.send(body);

        obs.first().subscribe(
            (res) => {
                const raw: string = res;

                const resultVO: CardCancelResult = CardPopulator.parseCancelResult(raw);

                // 로깅 -> 추후 Persistence 고려
                this.logger.set('Card Cancel Result', resultVO.stringify()).info();

                notifier.next(resultVO);
            },
            (err) => {
                throw new Error('Can not receive card approval');
            }
        );

        return notifier;
    }

    public icCardApproval(amount: string): Subject<ICCardApprovalResult> {
        if (this.isNotValidAmount(amount)) {
            const errResult: ICCardApprovalResult = new ICCardApprovalResult();
            return this.genArgumentErrorNotifier(errResult, NiceConstants.ERROR_CODE.APPROVAL_ARG_ERROR);
        }

        const notifier: Subject<ICCardApprovalResult> = new Subject();

        const requestVO: ICCardApprovalRequest = ICCardPopulator.fillApprovalReqVO(amount);

        // 로깅 -> 추후 Persistence 고려
        // console.log('IC Card Approval Request');
        // console.log(requestVO.stringify());
        this.logger.set('IC Card Approval Request', requestVO.stringify()).info();

        const body: string = ICCardPopulator.generateApprovalReq(requestVO);

        const obs: Observable<any> = this.niceDriver.send(body);

        obs.first().subscribe(
            (res) => {
                const raw: string = res;

                const resultVO: ICCardApprovalResult = ICCardPopulator.parseApprovalResult(raw);

                // 로깅 -> 추후 Persistence 고려
                console.log('IC Card Approval Result');
                console.log(resultVO.stringify());
                this.logger.set('IC Card Approval Result', resultVO.stringify()).info();

                notifier.next(resultVO);
            },
            (err) => {
                throw new Error('Can not receive card approval');
            }
        );

        return notifier;
    }

    public icCardCancel(amount: string, approvalNumber: string, approvalDate: string): Subject<ICCardCancelResult> {
        if (this.isNotValidAmount(amount)) {
            const errResult: ICCardCancelResult = new ICCardCancelResult();
            return this.genArgumentErrorNotifier(errResult, NiceConstants.ERROR_CODE.APPROVAL_ARG_ERROR);
        }

        const notifier: Subject<ICCardCancelResult> = new Subject();

        const requestVO: ICCardCancelRequest = ICCardPopulator.fillCancenReqVO(amount, approvalNumber, approvalDate);

        // 로깅 -> 추후 Persistence 고려
        // console.log('IC Card Cancel Request');
        // console.log(requestVO.stringify());
        this.logger.set('IC Card Cancel Request', requestVO.stringify()).info();

        const body: string = ICCardPopulator.generateCancelReq(requestVO);

        const obs: Observable<any> = this.niceDriver.send(body);

        obs.first().subscribe(
            (res) => {
                const raw: string = res;

                const resultVO: ICCardCancelResult = ICCardPopulator.parseCancelResult(raw);

                // 로깅 -> 추후 Persistence 고려
                console.log('IC Card Cancel Result');
                console.log(resultVO.stringify());
                this.logger.set('IC Card Cancel Result', resultVO.stringify()).info();

                notifier.next(resultVO);
            },
            (err) => {
                throw new Error('Can not receive card approval');
            }
        );

        return notifier;
    }

    private isNotValidAmount(amount: string): boolean {
        const numAmt: number = Number.parseInt(amount);

        if (isNaN(numAmt) || numAmt <= 0) {
            return true;
        }

        return false;
    }

    private isNotValidInstallment(installment: string): boolean {
        if (!installment) {
            return false;
        }

        const numAmt: number = Number.parseInt(installment);

        if (isNaN(numAmt) || numAmt < 0) {
            return true;
        }

        return false;
    }

    private genArgumentErrorNotifier<T extends WebsocketResult>(obj: T, errCode: string): Subject<T> {
        obj.code = errCode;
        obj.msg = NiceConstants.ERROR_MESSAGE[errCode];
        return new BehaviorSubject<T>(obj);
    }

}
