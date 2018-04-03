import { Component, OnDestroy } from "@angular/core";

import { Subscription } from "rxjs/Subscription";

import { AddCartBroker } from "../../broker/cart/addcart.broker";
import { CartEntry } from "../../interface/cartentry.interface";

@Component({
    selector: 'cartlist',
    template:`
    <h3>Cart</h3> 
    <ng-container *ngIf="cartList != 0;else empty">
        <table class="pure-table">
            <thead>
                <tr>
                    <td>Code</td>
                    <td>Name</td>
                    <td>Price</td>
                    <td>Quantity</td>
                </tr>
            </thead>
            <tbody>
                <tr *ngFor="let entry of cartList">
                    <td>{{entry.code}}</td>
                    <td>{{entry.name}}</td>
                    <td>{{entry.price}}</td>
                    <td>{{entry.qty}}</td>
                </tr>
            </tbody>
        </table>
        <label>
            Total Price : {{totalPrice | currency : 'KRW' : 'symbol' : '1.0-0'}}
        </label>
    </ng-container>
    <ng-template #empty>
        <div>
            No Cart Entry
        </div>
    </ng-template>
    
    `
})
export class CartListComponent implements OnDestroy {
    private cartList: Array<CartEntry>;

    private subscription: Subscription;

    private totalPrice: number;
    
    constructor(private addCartBroker: AddCartBroker) {
        this.cartList = new Array<CartEntry>();

        this.subscription = this.addCartBroker.getSubscription().subscribe(value => {
            console.log(`Add to cart ${value}`);

            //this.addCartEntry(value);

        });
    }

    private addCartEntry() {
        // let existedIdx: number = this.cartList.findIndex(
        //     function (obj) {
        //         return obj.code === productData.code;
        //     }
        // );

        // // Not existing
        // if (existedIdx === -1) {
        //     this.cartList.push(
        //         {code: productData.code, name: productData.name, price: productData.price, qty: 1}
        //     );
        // }
        // // Existing
        // else {
        //     this.cartList[existedIdx].qty++;
        // }

        // this.calculateTotalPrice();
    }

    ngOnDestroy() {
        this.subscription.unsubscribe();
    }

    private calculateTotalPrice(): void {
        let total = 0;

        for (let entry of this.cartList) {
            total += entry.price * entry.qty;
        }

        this.totalPrice = total;
    }
}