import { EodData, OrderEodData, CancelEodData } from './../../../../../data/models/receipt/eod-data';
import * as handlebars from 'handlebars/dist/handlebars.min.js';
import * as moment from 'moment';
import * as numeral from 'numeral';
import 'numeral/locales/pt-br';
import { cloneDeep } from 'lodash';
import { XMLParser } from './xml-parser';
import { BufferBuilder } from './buffer-builder';
// import { TextEncoder, TextDecoder } from 'text-encoding';

import { ReceiptUtils } from './helpers/receipt.utils';
import { ReceiptProductFieldInterface, DiscountFieldInterface } from '../../../../../data/receipt/interfaces/productfield.interface';
// import { BonusDataInterface } from './helpers/bonusdata.interface';

export class TemplateParser {

  private moment: any;
  private numeral: any;
  private handlebars: any;

  constructor() {
    this.moment = moment;
    this.moment.locale('ko-kr');

    this.numeral = numeral;
    this.numeral.locale('ko-kr');

    this.handlebars = handlebars;

    this.registerMoment();
    this.registerNumeral();
    this.registerPriceFormatHelper();
    this.registerProductListHelper();
    this.registerBonusDataHelper();
    this.registerPriceLocaleHelper();
    this.registerDiscountListHelper();
    this.registerEodDataHelper();

  }

  private registerMoment() {
    this.handlebars.registerHelper('moment', (context, block) => {
      if (context && context.hash) {
        block = cloneDeep(context);
        context = undefined;
      }
      // 2018.04.02 this.moment(context) ==> deprecate warning
      let date = this.moment(); // this.moment(context);

      if (block.hash.timezone) {
        date.tz(block.hash.timezone);
      }

      let hasFormat = false;

      for (const i in block.hash) {
        if (i === 'format') {
          hasFormat = true;
        } else if (date[i]) {
          date = date[i](block.hash[i]);
        }
      }

      if (hasFormat) {
        date = date.format(block.hash.format);
      }

      return date;
    });
  }

  private registerNumeral() {
    this.handlebars.registerHelper('numeral', (context, block) => {
      if (context && context.hash) {
        block = cloneDeep(context);
        context = undefined;
      }
      return this.numeral(context).format(block.hash.format);
    });
  }

  // 영수증 가격 리스트의 포맷을 양쪽 정렬로 맞추기 위한 Helper
  // 취소 영수증인 경우 앞에 prefix로 '-'가 붙으므로 공백값을 하나더 빼주어야함.
  private registerPriceFormatHelper() {
    this.handlebars.registerHelper('priceFormatHelper', (priceName: string, price: string, cancelFlag?: string) => {
      const utf8ItemLen: number = ReceiptUtils.getTextLengthUTF8(priceName);
      const localePrice: string = ReceiptUtils.convertToLocalePrice(price);
      const localPriceLen = cancelFlag === 'Y' ? localePrice.length + 1 : localePrice.length;
      const blankLenth: number = 42 - utf8ItemLen - localPriceLen;
      const cancelSymbol: string = cancelFlag === 'Y' ? '-' : '';
      return new handlebars.SafeString(priceName + ReceiptUtils.spaces(blankLenth) + cancelSymbol + localePrice);
    });
  }

  // 숫자를 3자리마다 , 찍어주는 Helper
  private registerPriceLocaleHelper() {
    this.handlebars.registerHelper('priceLocaleHelper', (price: string) => {
      return new handlebars.SafeString(ReceiptUtils.convertToLocalePrice(price));
    });
  }

  // 영수증 상품 리스트를 포맷팅하기 위한 Helper
  private registerProductListHelper() {
    this.handlebars.registerHelper('productListHelper', (productList: Array<ReceiptProductFieldInterface>) => {
      const localedProductList = ReceiptUtils.convertProductListPrices(productList);
      const maxLengths = ReceiptUtils.findMaxLengths(localedProductList);
      const formatted: Array<string> = [];
      formatted.push(ReceiptUtils.getProductListTitle(maxLengths));
      productList.forEach(
        (product) => {
          formatted.push(ReceiptUtils.getFormattedProductField(product, maxLengths));
        }
      );
      return new handlebars.SafeString(formatted.join(''));
    });
  }

  private registerDiscountListHelper() {
    this.handlebars.registerHelper('discountListHelper', (discountList: Array<DiscountFieldInterface>) => {
      const formatted: Array<string> = [];
      discountList.forEach(
        (discount) => {
          formatted.push(ReceiptUtils.getFormattedDiscountField(discount));
        }
      );
      return new handlebars.SafeString(formatted.join(''));
    });
  }

  // Bonus 정보를 용지 절반 기준 2단으로 보여주기 위한 Helper
  private registerBonusDataHelper() {
    this.handlebars.registerHelper('bonusDataHelper', (title1: string, value1: string, title2: string, value2: string, cancelFlag?: string) => {
      const formatted: Array<string> = [];
      const cancelSymbol = cancelFlag === 'Y' ? '-' : '';
      const pvValue = ReceiptUtils.convertToLocalePrice(value1);
      const bvValue = ReceiptUtils.convertToLocalePrice(value2);
      formatted.push('<text-line>');
      formatted.push(ReceiptUtils.fitTextsEqual(title1 + cancelSymbol + pvValue, title2 + cancelSymbol + bvValue));
      formatted.push('</text-line>');
      return new handlebars.SafeString(formatted.join(''));
    });
  }

  /**
   * EOD 출력 헬퍼
   */
  private registerEodDataHelper() {
    this.handlebars.registerHelper('eodDataHelper', (eodData: EodData) => {
      const formatted: Array<string> = [];
      formatted.push(this.printEodData('일반/그룹주문', eodData.normalOrder));
      formatted.push(this.printEodData('중개주문', eodData.mediateOrder));
      formatted.push(this.printEodData('멤버/비회원주문', eodData.memberOrder));
      formatted.push(this.printEodData('주문별 총 합계', eodData.summaryOrder));
      formatted.push(this.printEodCancelData('주문취소', eodData.orderCancel));
      return new handlebars.SafeString(formatted.join(''));
    });
  }

  /**
   * EOD 주문 데이터 출력 양식 생성
   *
   * @param header 양식 출력 헤더
   * @param data 주문 데이터
   * @returns 출력 양식
   */
  private printEodData(header: string, data: OrderEodData): string {
    const formatted: Array<string> = [];
    formatted.push('<line-feed lines="1"/>');
    formatted.push(ReceiptUtils.getEodHeader(header));
    formatted.push(ReceiptUtils.getEodFormattedFields(data.credit.name, data.credit.quantity, data.credit.price));
    formatted.push(ReceiptUtils.getEodFormattedFields(data.iccard.name, data.iccard.quantity, data.iccard.price));
    formatted.push(ReceiptUtils.getEodFormattedFields(data.debit.name, data.debit.quantity, data.debit.price));
    formatted.push(ReceiptUtils.getEodFormattedFields(data.point.name, data.point.quantity, data.point.price));
    formatted.push(ReceiptUtils.getEodFormattedFields(data.recash.name, data.recash.quantity, data.recash.price));
    formatted.push('<dash-line/>');
    formatted.push('<bold>');
    formatted.push(ReceiptUtils.getEodFormattedFields(data.summary.name, data.summary.quantity, data.summary.price));
    formatted.push('</bold>');
    formatted.push('<dash-line/>');
    return formatted.join('');
  }

  /**
   * EOD 주문취소 데이터 출력 양식 생성
   *
   * @param header 양식 출력 헤더
   * @param data 주문 취소 데이터
   * @returns 출력양식
   */
  private printEodCancelData(header: string, data: CancelEodData): string {
    const formatted: Array<string> = [];
    formatted.push('<line-feed lines="1"/>');
    formatted.push(ReceiptUtils.getEodHeader(header));
    formatted.push(ReceiptUtils.getEodFormattedFields(data.orderCancel.name, data.orderCancel.quantity, data.orderCancel.price));
    formatted.push(ReceiptUtils.getEodFormattedFields(data.mediateCancel.name, data.mediateCancel.quantity, data.mediateCancel.price));
    formatted.push(ReceiptUtils.getEodFormattedFields(data.memberCancel.name, data.memberCancel.quantity, data.memberCancel.price));
    formatted.push('<dash-line/>');
    formatted.push('<bold>');
    formatted.push(ReceiptUtils.getEodFormattedFields(data.summaryCancel.name, data.summaryCancel.quantity, data.summaryCancel.price));
    formatted.push('</bold>');
    formatted.push('<dash-line/>');
    return formatted.join('');
  }

  public parser(template, data): BufferBuilder {
    const fn = this.handlebars.compile(template);
    const xml = fn(data);
    return new XMLParser().parser(xml);
  }

  public vanillaParser(template: any, data: any): string {
    const fn = this.handlebars.compile(template);
    const parsed = fn(data);

    return parsed;
  }

}
