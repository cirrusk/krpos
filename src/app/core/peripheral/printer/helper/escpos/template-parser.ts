import * as handlebars from 'handlebars/dist/handlebars.min.js';
import * as moment from 'moment';
import * as numeral from 'numeral';
import 'numeral/locales/pt-br';
import { cloneDeep } from 'lodash';
import { XMLParser } from './xml-parser';
import { BufferBuilder } from './buffer-builder';

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

  public parser(template, scope): BufferBuilder {
    const fn = this.handlebars.compile(template);
    const xml = fn(scope);
    return new XMLParser().parser(xml);
  }

  public vanillaParser(template: any, scope: any): string {
    const fn = this.handlebars.compile(template);
    const parsed = fn(scope);
    return parsed;
  }

}
