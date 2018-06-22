import { Injectable } from "@angular/core";

import { Subject, Observable } from "rxjs";

import { NiceDriver } from "./nice.driver";
import { Logger } from "../../logger/logger";
import { CardApprovalResult } from "./vo/card.approval.result";
import { CardPopulator } from "./populator/card.populator";
import { CardApprovalRequest } from "./vo/card.approval.request";
import { CardCancelResult } from "./vo/card.cancel.result";
import { CardCancelRequest } from "./vo/card.cancel.reqeust";
import { ICCardApprovalResult } from "./vo/iccard.approval.result";
import { ICCardPopulator } from "./populator/iccard.populator";
import { ICCardApprovalRequest } from "./vo/iccard.approval.request";
import { ICCardCancelRequest } from "./vo/iccard.cancel.request";
import { ICCardCancelResult } from "./vo/iccard.cancel.result";

@Injectable()
export class NicePaymentService {

    constructor(private niceDriver: NiceDriver, private logger: Logger) {
    }

    public cardApproval(amount: string, installment: string): Subject<CardApprovalResult> {
        const requestVO: CardApprovalRequest = CardPopulator.fillApprovalReqVO(amount, installment);

        // 로깅 -> 추후 Persistence 고려
        console.log("Card Approval Request");
        console.log(requestVO.stringify());

        const body: string = CardPopulator.generateApprovalReq(requestVO);

        let obs: Observable<any> = this.niceDriver.send(body);

        let notifier: Subject<CardApprovalResult> = new Subject();
        
        obs.subscribe(
            (res) => {
                let raw: string = res;

                let resultVO: CardApprovalResult = CardPopulator.parseApprovalResult(raw);

                // 로깅 -> 추후 Persistence 고려
                console.log("Card Approval Result");
                console.log(resultVO.stringify());

                notifier.next(resultVO);
            },
            (err) => {
                throw new Error('Can not receive card approval');
            }
        );

        return notifier;
    }

    public cardCancel(amount: string, approvalNumber: string, approvalDate: string): Subject<CardCancelResult> {
        let notifier: Subject<CardCancelResult> = new Subject();

        if (approvalDate.length > 6) {
            approvalDate = approvalDate.slice(0, 6);
        }

        const requestVO: CardCancelRequest = CardPopulator.fillCancelReqVO(amount, approvalNumber, approvalDate);

        // 로깅 -> 추후 Persistence 고려
        console.log("Card Cancel Request");
        console.log(requestVO.stringify());

        const body: string = CardPopulator.generateCancelReq(requestVO);

        let obs: Observable<any> = this.niceDriver.send(body);

        obs.subscribe(
            (res) => {
                let raw: string = res;

                let resultVO: CardCancelResult = CardPopulator.parseCancelResult(raw);

                // 로깅 -> 추후 Persistence 고려
                console.log("Card Cancel Result");
                console.log(resultVO.stringify());

                notifier.next(resultVO);
            },
            (err) => {
                throw new Error('Can not receive card approval');
            }
        );

        return notifier;
    }

    public icCardApproval(amount: string): Subject<ICCardApprovalResult> {
        let notifier: Subject<ICCardApprovalResult> = new Subject();

        const requestVO: ICCardApprovalRequest = ICCardPopulator.fillApprovalReqVO(amount);

        // 로깅 -> 추후 Persistence 고려
        console.log("IC Card Approval Request");
        console.log(requestVO.stringify());

        const body: string = ICCardPopulator.generateApprovalReq(requestVO);

        let obs: Observable<any> = this.niceDriver.send(body);

        obs.subscribe(
            (res) => {
                let raw: string = res;

                let resultVO: ICCardApprovalResult = ICCardPopulator.parseApprovalResult(raw);

                // 로깅 -> 추후 Persistence 고려
                console.log("IC Card Approval Result");
                console.log(resultVO.stringify());

                notifier.next(resultVO);
            },
            (err) => {
                throw new Error('Can not receive card approval');
            }
        );

        return notifier;
    }

    public icCardCancel(amount: string, approvalNumber: string, approvalDate: string): Subject<ICCardCancelResult> {
        let notifier: Subject<ICCardCancelResult> = new Subject();

        const requestVO: ICCardCancelRequest = ICCardPopulator.fillCancenReqVO(amount, approvalNumber, approvalDate);

        // 로깅 -> 추후 Persistence 고려
        console.log("IC Card Cancel Request");
        console.log(requestVO.stringify());

        const body: string = ICCardPopulator.generateCancelReq(requestVO);

        let obs: Observable<any> = this.niceDriver.send(body);

        obs.subscribe(
            (res) => {
                let raw: string = res;

                let resultVO: ICCardCancelResult = ICCardPopulator.parseCancelResult(raw);

                // 로깅 -> 추후 Persistence 고려
                console.log("IC Card Cancel Result");
                console.log(resultVO.stringify());

                notifier.next(resultVO);
            },
            (err) => {
                throw new Error('Can not receive card approval');
            }
        );

        return notifier;
    }
}