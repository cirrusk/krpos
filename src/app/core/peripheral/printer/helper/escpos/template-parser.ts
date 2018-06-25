import * as handlebars from 'handlebars/dist/handlebars.min.js';
import * as moment from 'moment';
import * as numeral from 'numeral';
import 'numeral/locales/pt-br';
import { cloneDeep } from 'lodash';
import { XMLParser } from './xml-parser';
import { BufferBuilder } from './buffer-builder';
// import { TextEncoder, TextDecoder } from 'text-encoding';

import { ReceiptUtils } from './helpers/receipt.utils';
import { ReceiptProductFieldInterface } from '../../../../../data/receipt/interfaces/productfield.interface';
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

    // this.handlebars.registerHelper('null', function() {
    //   return null
    // })
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
  private registerPriceFormatHelper() {
    this.handlebars.registerHelper('priceFormatHelper', (priceName: string, price: string) => {
      const utf8ItemLen: number = ReceiptUtils.getTextLengthUTF8(priceName);
      const localePrice: string = ReceiptUtils.convertToLocalePrice(price);
      const blankLenth: number = 42 - utf8ItemLen - localePrice.length;

      return new handlebars.SafeString(priceName + ReceiptUtils.spaces(blankLenth) + localePrice);
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

  // Bonus 정보를 용지 절반 기준 2단으로 보여주기 위한 Helper
  private registerBonusDataHelper() {
    this.handlebars.registerHelper('bonusDataHelper', (title1: string, value1: string, title2: string, value2: string) => {
      const formatted: Array<string> = [];

      formatted.push('<text-line>');
      formatted.push(ReceiptUtils.fitTextsEqual(title1 + value1, title2 + value2));
      formatted.push('</text-line>');

      return new handlebars.SafeString(formatted.join(''));
    });
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
