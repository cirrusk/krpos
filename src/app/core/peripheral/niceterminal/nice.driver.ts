import { Injectable } from '@angular/core';

// import { WebSocketSubject } from 'rxjs/observable/dom/WebSocketSubject';
// import { Subject, Observable, BehaviorSubject } from 'rxjs/Rx';
// import { Observable } from 'rxjs/Observable';
import { Subject } from 'rxjs/Subject';
import { BehaviorSubject } from 'rxjs/BehaviorSubject';

import { AbstractDriver } from '../abstract.driver';
import { Config } from '../../config/config';
import { Logger } from '../../logger/logger';
import { NiceUtils } from './utils/nice.utils';
import { NiceConstants } from './nice.constants';
import { Utils } from '../../utils';

@Injectable()
export class NiceDriver extends AbstractDriver {
    private connInfo: string;

    // private wsSubject: WebSocketSubject<any>;
    // private onMessageHandler: Subject<any>;

    private ws: WebSocket;
    // private wsObserver: Observable<any>;
    private driverMsgHandler: Subject<any>;

    constructor(private config: Config, private logger: Logger) {
        super('NICE Driver');

        /*
        niceTermBase: "ws://localhost",
        niceTermPort: "8088",
        niceTermType: "PCAT"
        */
        this.logger.set('nice.driver', 'NICE WebSocket Initializing...').debug();

        this.connInfo = this.config.getConfig('niceTermBase') + ':' + this.config.getConfig('niceTermPort') + '/' + this.config.getConfig('niceTermType');
        this.driverMsgHandler = new Subject();

        this.ws = this.setupWebSocket();
    }

    public send(data: string): Subject<any> {
        if (this.ws.readyState === WebSocket.OPEN) {
            this.logger.set('nice.driver', `Socket Open Status : ${this.ws.readyState}`).debug();
        } else {
            this.logger.set('nice.driver', `Socket Open Status : ${this.ws.readyState}`).error();
        }
        if (this.isNotReady()) {
            this.logger.set('nice.driver', 'NICE WebSocket Trying to reconnect...').debug();
            setTimeout(() => { this.reconnect(); }, 10 * 1000);

            const errResponse: string = NiceUtils.genErrMessage(NiceConstants.ERROR_CODE.WEBSOCKET_ERROR);

            const errRes: BehaviorSubject<string> = new BehaviorSubject(errResponse);
            return errRes;
        }

        const resNoti: Subject<any> = new Subject();

        // 전문 생성
        const req: string = this.makeupRequest(data);

        // 메시지 전달
        this.logger.set('nice.driver', `NICE approval Send Request : ${Utils.stringify(req)}`).debug();

        this.ws.send(req);

        // 응답 대기
        this.driverMsgHandler.subscribe(
            (res) => {
                this.logger.set('nice.driver', `NICE approval Response : ${Utils.stringify(res)}`).debug();
                resNoti.next(res);
            },
            (err) => {
                console.log('NICE error : ' + err);
                this.logger.set('nice.driver', `NICE approval catch error : ${Utils.stringify(err)}`).error();
            },
            () => {
                console.log('NICE completed');
                this.logger.set('nice.driver', 'NICE approval completed').debug();
            }
        );

        return resNoti;
    }


    private makeupRequest(data: string): string {
        const bodyLen: number = NiceUtils.byteLen(data);
        const totalLen: number = bodyLen + 12;

        const strBuilder: Array<string> = new Array();

        strBuilder.push(NiceUtils.padding(totalLen.toString(), 4));
        strBuilder.push('PCAT');
        strBuilder.push('    ');
        strBuilder.push(NiceUtils.padding(bodyLen.toString(), 4));
        strBuilder.push(data);

        return strBuilder.join('');
    }

    private setupWebSocket(): WebSocket {
        const _ws = new WebSocket(this.connInfo);

        _ws.onopen = () => {
            this.logger.set('nice.driver', `NICE webSocket.onConnect : ${Utils.stringify(this.connInfo)}`).debug();
        };
        _ws.onmessage = (event) => {
            this.logger.set('nice.driver', `NICE webSocket.onMessage : ${Utils.stringify(event.data)}`).debug();
            this.driverMsgHandler.next(event.data);
        };
        _ws.onerror = (event) => {
            this.logger.set('nice.driver', `NICE webSocket.onError : ${event}`).error();
        };
        _ws.onclose = (event) => {
            this.logger.set('nice.driver', `NICE webSocket.onClose : ${event}`).debug();
        };

        return _ws;
    }

    private reconnect() {
        this.ws.close();
        this.ws = this.setupWebSocket();
    }

    private isReady(): boolean {
        return this.ws.readyState === 1;
    }

    private isNotReady(): boolean {
        return !this.isReady();
    }

}
