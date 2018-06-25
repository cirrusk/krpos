import { Command } from './../command';

import { ProductFieldMaxLen } from './maxlen.interface';
import { ReceiptProductFieldInterface } from './../../../../../../data/receipt/interfaces/productfield.interface';
import { PosPrinterConstants } from '../posprinter.constants';

export class ReceiptUtils {

    private static SAFE_SPACE_CHAR = String.fromCharCode(Command.SI);

    private static START_TEXTLINE = '<text-line>';

    private static END_TEXTLINE = '</text-line>';

    // 유니코드 문자에 대해 바이트 수 구함
    public static getTextLengthUTF8(text: string) : number {
        const b = text.match(/[^\x00-\xff]/g);
        return (text.length + (!b ? 0: b.length)); 
    }

    // 원화에 대해 3자리마다 콤마 찍기
    public static convertToLocalePrice(price: string): string {
        return price.replace(/(\d)(?=(\d{3})+(?!\d))/g, "$1,");
    }

    // symbol 을 length 만큼 생성
    public static sequences(length: number, symbol: string): string {
        let arr: Array<string> = [];

        for (let i: number = 0 ; i < length ; i++) {
            arr.push(symbol);
        }

        return arr.join('');
    }

    // SAFE_SPACE_CHAR 를 length 만큼 생성
    public static genSafeLeadingSpaces(length: number) {
        return ReceiptUtils.sequences(length, this.SAFE_SPACE_CHAR);
    }

    // SPACE 를 length 만큼 생성
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

    // 구매 상품 리스트의 각 필드의 최대 길이 값
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
            productName: PosPrinterConstants.LineBytes - maxLenIdx - maxLenSkuCode - maxLenPrice - maxLenQty - maxLenTotal - 5,
            price: maxLenPrice,
            qty: maxLenQty,
            totalPrice: maxLenTotal
        };
    }

    public static rightAlignedText(text: string, maxLen: number, symbol?: string): string {
        if (symbol) {
            return this.sequences(maxLen - text.length, symbol) + text;
        }
        return this.spaces(maxLen - text.length) + text;
    }

    // 유니코드 텍스트를 위한 substr()
    // len 은 바이트 수 (원 substr 은 글자 수)
    public static substrUnicode(text: string, len: number, startIdx: number): string {
        let c: number = 0;

        // 첫 글자가 Space (ASCII 32) 이면 한 칸 뒤로
        if (text.charCodeAt(startIdx) === 32) {
            startIdx++;
        }

        let i: number = startIdx;

        for(let b = 0 ; c = text.charCodeAt(i) ;) {

            b += c >> 7 ? 2 : 1;
            
            if (b > len) {
                break;
            }
            
            i++;
        }
        
        return text.substring(startIdx, i);
    }

    public static getProductListTitle(maxLengths: ProductFieldMaxLen): string {
        let formatted: Array<string> = [];
        const productName: string = "상품명";
        const remainings: string = "단가 수량 금액";

        formatted.push(this.START_TEXTLINE);

        let len: number = maxLengths.idx + 1 + maxLengths.skuCode + 1;
        formatted.push(this.genSafeLeadingSpaces(len));
        formatted.push(productName);

        len = PosPrinterConstants.LineBytes - len - this.getTextLengthUTF8(productName) - this.getTextLengthUTF8(remainings);
        formatted.push(this.spaces(len));
        formatted.push(remainings);

        formatted.push(this.END_TEXTLINE);

        formatted.push('<dash-line/>');

        return formatted.join('');
    }

    public static getFormattedProductField(product: ReceiptProductFieldInterface, maxLengths: ProductFieldMaxLen): string {
        let formatted: Array<string> = [];

        // 태그 시작
        formatted.push(this.START_TEXTLINE);

        // 상품 목록 순번
        formatted.push(this.rightAlignedText(product.idx, maxLengths.idx, this.SAFE_SPACE_CHAR));
        formatted.push(this.spaces(1));

        // 상품명 (한줄 자르기)
        const idxLen = maxLengths.idx + 1;
        const croppedProductName: string = this.substrUnicode(product.productName, PosPrinterConstants.LineBytes - idxLen, 0);
        formatted.push(croppedProductName);

        // 개행
        formatted.push(this.END_TEXTLINE);
        formatted.push(this.START_TEXTLINE);

        // 순번 컬럼 비우기
        formatted.push(this.genSafeLeadingSpaces(idxLen));
        
        // SKU code
        formatted.push(this.rightAlignedText(product.skuCode, maxLengths.skuCode));
        formatted.push(this.spaces(1));

        // const croppedLen: number = this.getTextLengthUTF8(croppedProductName);
        
        // // 개행 여부 판단
        // // 상품명이 긴 경우 2라인에 출력하자는 요건
        // if (product.productName.length > maxLengths.productName) {
        //     // 개행
        //     formatted.push(this.END_TEXTLINE);
        //     formatted.push(this.START_TEXTLINE);

        //     formatted.push(this.genSafeLeadingSpaces(maxLengths.idx + 1 + maxLengths.skuCode + 1));

        //     // substr 은 한글과 영/숫자를 바이트 위치가 아니라 글자 위치 자체로 계산
        //     const startPos: number = croppedProductName.length;

        //     const nextLine: string = this.substrUnicode(product.productName, maxLengths.productName, startPos);
        //     formatted.push(nextLine);
        // }

        // // 잘린 상품명에 모자란 바이트를 " " 로 채움. 끝의 1 은 단가와 띄어쓰기
        // const paddedLen: number = maxLengths.productName - croppedLen;
        // formatted.push(this.spaces(paddedLen + 1));

        // 상품 단가
        formatted.push(this.rightAlignedText(product.price, maxLengths.price));
        formatted.push(this.spaces(1));

        // 수량
        formatted.push(this.rightAlignedText(product.qty, maxLengths.qty));
        formatted.push(this.spaces(1));

        // 가격
        formatted.push(this.rightAlignedText(product.totalPrice, maxLengths.totalPrice));;

        // 태그 끝
        formatted.push(this.END_TEXTLINE);

        return formatted.join('');
    }

    public static fitTextsEqual(text1: string, text2: string): string {
        const paddedLen = (PosPrinterConstants.LineBytes / 2) - this.getTextLengthUTF8(text1);
        return text1 + this.spaces(paddedLen) + text2;
    }
}