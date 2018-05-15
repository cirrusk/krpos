import { Command } from './../command';

import { ProductFieldMaxLen } from './maxlen.interface';
import { ReceiptProductFieldInterface } from './../../../../../../data/receipt/interfaces/productfield.interface';

export class ReceiptUtils {

    private static LEADING_SPACE_REPLACE = String.fromCharCode(Command.SI);

    // UTF8 Text Length in real byte
    public static getTextLengthUTF8(text: string) : number {
        const b = text.match(/[^\x00-\xff]/g);
        return (text.length + (!b ? 0: b.length)); 
    }

    // Convert Price to localed
    public static convertToLocalePrice(price: string): string {
        return price.toString().replace(/(\d)(?=(\d{3})+(?!\d))/g, "$1,");
    }

    // Generate same character sequences
    public static sequences(length: number, symbol: string): string {
        let arr: Array<string> = [];

        for (let i: number = 0 ; i < length ; i++) {
            arr.push(symbol);
        }

        return arr.join('');
    }

    // Generate Blank sequences
    public static spaces(length: number): string {
        return ReceiptUtils.sequences(length, " ");
    }

    public static convertProductListPrices(productList): any {
        productList.forEach(
            (item) => {
                item.price = ReceiptUtils.convertToLocalePrice(item.price);
                item.totalPrice = ReceiptUtils.convertToLocalePrice(item.totalPrice);
            }
        );
        return productList;
    }

    // Find maximum length of each field in productList
    public static findMaxLengths(productList): ProductFieldMaxLen {
        let maxLenIdx: number = 0;
        let maxLenSkuCode: number = 0;
        let maxLenPrice: number = 0;
        let maxLenQty: number = 0;
        let maxLenTotal: number = 0;
        
        productList.forEach((item) => {
            if (item.idx.length > maxLenIdx) {
                maxLenIdx = item.idx.length;
            }
            if (item.skuCode.length > maxLenSkuCode) {
                maxLenSkuCode = item.skuCode.length;
            }
            if (item.price.length > maxLenPrice) {
                maxLenPrice = item.price.length;
            }
            if (item.qty.length > maxLenQty) {
                maxLenQty = item.qty.length;
            }
            if (item.totalPrice.length > maxLenTotal) {
                maxLenTotal = item.totalPrice.length;
            }
        });

        return {
            idx: maxLenIdx,
            skuCode: maxLenSkuCode,
            productName: 42 - maxLenIdx - maxLenSkuCode - maxLenPrice - maxLenQty - maxLenTotal - 5,
            price: maxLenPrice,
            qty: maxLenQty,
            totalPrice: maxLenTotal
        };
    }

    public static rightAlignedText(text: string, maxLen: number, symbol?: string): string {
        if (symbol) {
            return ReceiptUtils.sequences(maxLen - text.length, symbol) + text;
        }
        return ReceiptUtils.spaces(maxLen - text.length) + text;
    }

    // substring() for Unicode text
    public static substrUnicode(text: string, len: number): string {
        let i: number = 0;
        let c: number = 0;

        for(let b = 0 ; c = text.charCodeAt(i);) {

            b += c >> 7 ? 2 : 1;
            
            if (b > len) {
                break;
            }
            
            i++;
        }
        
        return text.substring(0,i);
    }

    public static getFormattedProductField(product: ReceiptProductFieldInterface, maxLengths: ProductFieldMaxLen): string {
        let formatted: Array<string> = [];

        // 상품 목록 순번
        formatted.push(ReceiptUtils.rightAlignedText(product.idx, maxLengths.idx, ReceiptUtils.LEADING_SPACE_REPLACE));
        formatted.push(ReceiptUtils.spaces(1));
        
        // SKU code
        formatted.push(ReceiptUtils.rightAlignedText(product.skuCode, maxLengths.skuCode));
        formatted.push(ReceiptUtils.spaces(1));

        // 상품명
        const croppedProductName: string = ReceiptUtils.substrUnicode(product.productName, maxLengths.productName);
        formatted.push(croppedProductName);
        
        // 잘린 상품명에 모자란 바이트를 " " 로 채움. 끝의 1 은 단가와 띄어쓰기
        const croppedLen: number = ReceiptUtils.getTextLengthUTF8(croppedProductName);
        const paddedLen: number = maxLengths.productName - croppedLen;
        formatted.push(ReceiptUtils.spaces(paddedLen + 1));

        // 상품 단가
        formatted.push(ReceiptUtils.rightAlignedText(product.price, maxLengths.price));
        formatted.push(ReceiptUtils.spaces(1));

        // 수량
        formatted.push(ReceiptUtils.rightAlignedText(product.qty, maxLengths.qty));
        formatted.push(ReceiptUtils.spaces(1));

        // 가격
        formatted.push(ReceiptUtils.rightAlignedText(product.totalPrice, maxLengths.totalPrice));;

        return formatted.join('');
    }
}