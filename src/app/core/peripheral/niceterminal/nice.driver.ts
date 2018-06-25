import { Injectable } from "@angular/core";

import { WebSocketSubject } from "rxjs/observable/dom/WebSocketSubject";
import { Subject, Observable, BehaviorSubject } from "rxjs/Rx";

import { AbstractDriver } from "../abstract.driver";
import { Config } from '../../config/config';
import { Logger } from '../../logger/logger';
import { NiceUtils } from "./utils/nice.utils";
import { NiceConstants } from "./nice.constants";

@Injectable()
export class NiceDriver extends AbstractDriver {
    private connInfo: string;
    
    private wsSubject: WebSocketSubject<any>;
    private onMessageHandler: Subject<any>;

    private ws: WebSocket;
    private wsObserver: Observable<any>;
    private driverMsgHandler: Subject<any>;

    constructor(private config:Config, private logger: Logger) {
        super('NICE Driver');

        /*
        niceTermBase: "ws://localhost",
        niceTermPort: "8088",
        niceTermType: "PCAT"
        */
        console.log("NICE WebSocket Initializing...");

        this.connInfo = this.config.getConfig('niceTermBase') + ':' + this.config.getConfig('niceTermPort') + '/' + this.config.getConfig('niceTermType');
        this.driverMsgHandler = new Subject();

        this.ws = this.setupWebSocket();
    }

    public send(data: string) : Subject<any> {
        
        if (this.isNotReady()) {
            console.log("Trying to reconnect.");
            this.reconnect();

            const errResponse: string = NiceUtils.genErrMessage(NiceConstants.ERROR_CODE.WEBSOCKET_ERROR);
            
            let errRes: BehaviorSubject<string> = new BehaviorSubject(errResponse);
            return errRes;
        }

        const resNoti: Subject<any> = new Subject();

        // 전문 생성
        const req: string = this.makeupRequest(data);

        // 메시지 전달
        console.log("NICE Send() : " + req);

        this.ws.send(req);

        // 응답 대기
        this.driverMsgHandler.subscribe(
            (res) => {
                console.log("NICE result : " + res);
                resNoti.next(res);
            },
            (err) => {
                console.log("NICE error : " + err);
            },
            () => {
                console.log("NICE completed");
            }
        );
        
        return resNoti;
    }

    
    private makeupRequest(data: string): string {
        const bodyLen: number = NiceUtils.byteLen(data);
        const totalLen: number = bodyLen + 12;

        let strBuilder: Array<string> = new Array();

        strBuilder.push(NiceUtils.padding(totalLen.toString(), 4));
        strBuilder.push('PCAT');
        strBuilder.push('    ');
        strBuilder.push(NiceUtils.padding(bodyLen.toString(), 4));
        strBuilder.push(data);
        
        return strBuilder.join('');
    }

    private setupWebSocket(): WebSocket {
        let _ws = new WebSocket(this.connInfo);

        _ws.onopen = () => {
            console.log("NICE webSocket.onConnect: " + this.connInfo);
        };
        _ws.onmessage = (event) => {
            console.log("NICE webSocket.onMessage : " + event.data);
            this.driverMsgHandler.next(event.data);
        };
        _ws.onerror = (event) => {
            console.log("NICE webSocket.onError : " + event);
        };
        _ws.onclose = (event) => {
            console.log("NICE webSocket.onClose : " + event);
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

    ngOnDestroy(): void {
        
    }
}