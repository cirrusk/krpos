import { Component, ElementRef, ViewChild, ViewEncapsulation } from "@angular/core";

@Component({
    selector: 'receipt-form',
    template: `
        <div id="rawData">
            <style>
                div .width{
                    border-style: solid;
                    width: 260px;
                },
            </style>
            <div class="width">
                <p>
                    &lt;div&gt; width is 260px
                </p>
                <h1>H1 Head</h1>
                <h2>H2 Head</h2>
                <h3>H3 Head</h3>
                <h4>H4 Head</h4>
            </div>
        </div>
    `,
    encapsulation: ViewEncapsulation.Native,
})
export class ReceiptFormComponent {
    
}