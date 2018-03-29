import { Component, OnInit } from "@angular/core";

import { ModalService } from './../service/common/modal/modal.service';
import { AddCartBroker } from "../broker/cart/addcart.broker";
import { NetworkService } from "../service/common/network/network.service";

@Component({
    selector: 'posmain',
    template: `
    <h1>POS Demo</h1>
    MAC Address : {{macAddress}}<br>
    <button (click)="loadMacAddress()">Load</button>
    <product-search></product-search>
    <cartlist></cartlist>
    <receipt-print></receipt-print>
    <click-observer></click-observer>

    <h3>Modal Dialog Test</h3>

    <button (click)="openModal('modal-test-1')">Open Modal 1</button>

    <modal id="modal-test-1" dimClickClose="true" escKeyClose="true">
        <div class="modal">
            <div class="modal-body">
                <h1>A Custom Modal!</h1>
                <p>
                    Home page text: <input type="text" [(ngModel)]="bodyText" />
                </p>
                <button (click)="closeModal('modal-test-1');">Close</button>
            </div>
        </div>
        <div class="modal-background"></div>
    </modal>
    `
})
export class PosMainComponent implements OnInit {
    private macAddress: string;

    constructor(private modalService: ModalService,
                private networkService: NetworkService) {
        console.log('1');
    }

    ngOnInit() {
        console.log('2');
        this.getMACAddress();
        console.log('3');
    }

    ngOnDestroy() {
        
    }

    private getMACAddress() {
        this.networkService.wait().subscribe(
            () => {
                this.macAddress = this.networkService.getLocalMacAddress();
            }
        );
    }

    public openModal(id: string) {
        this.modalService.open(id);
    }

    public closeModal(id: string ){
        this.modalService.close(id);
    }

    public loadMacAddress() {
        this.macAddress = this.networkService.getLocalMacAddress();
    }
} 