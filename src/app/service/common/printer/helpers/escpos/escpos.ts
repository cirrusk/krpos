import { Command } from './command';
import { Injectable } from '@angular/core';

import { TemplateParser } from './template-parser';
import { XMLParser } from './xml-parser';
import { BufferBuilder } from './buffer-builder';
import { UTF8ArrayConverter } from '../../../utils/utf8.arrayconverter';

export class EscPos {
  private static NULL_CHAR = '\0';

  private static NULL_REPLACE = String.fromCharCode(Command.SO);

  public static getBufferFromTemplate(template: string, data: any): number[] {
    let templateParser = new TemplateParser();
    return templateParser.parser(template, data).build();
  }

  public static getBufferFromXML(xml: string): number[] {
    let xmlParser = new XMLParser();
    return xmlParser.parser(xml).build();
  }
  
  public static getBufferBuilder(): BufferBuilder {
    return new BufferBuilder();
  }
  
  public static getTransformed(xml: string): string {
    let xmlParser = new XMLParser();
    return UTF8ArrayConverter.decode(xmlParser.parser(xml).buildConv());
  }

  public static getTransformedRaw(xml: string): Uint8Array {
    let xmlParser = new XMLParser();
    return xmlParser.parser(xml).buildConv();
  }

  public static escapeNull(text: string): string {
    let chrArray: Array<string> = text.split('');

    chrArray.forEach( (value, index) => {
      if (value === EscPos.NULL_CHAR) {
        let prev = (index - 1) >= 0 ? (index - 1) : 0;
        let next = (index + 1) < chrArray.length ? (index + 1) : (index);
        //console.log(`found ${chrArray[prev]} ${chrArray[index]} ${chrArray[next]}`);

        chrArray[index] = EscPos.NULL_REPLACE;
      }
    });

    //console.log(`returning ${chrArray.join('')}`)

    return chrArray.join('');
  }

  public static unescapeNull(text: string): string {
    let chrArray: Array<string> = text.split('');

    chrArray.forEach( (value, index) => {
      if (value === EscPos.NULL_REPLACE) {
        let prev = (index - 1) >= 0 ? (index - 1) : 0;
        let next = (index + 1) < chrArray.length ? (index + 1) : (index);
        //console.log(`found ${chrArray[prev]} ${chrArray[index]} ${chrArray[next]}`);

        chrArray[index] = EscPos.NULL_CHAR;

      }
    });

    //console.log(`returning ${chrArray.join('')}`)

    return chrArray.join('');
  }

  public static getParsed(text:string, data: any): string {
    let templateParser = new TemplateParser();
    return templateParser.vanillaParser(text, data);
  }
}
 