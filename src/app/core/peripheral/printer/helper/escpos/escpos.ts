import { Command } from './command';
import { Injectable } from '@angular/core';

import { TemplateParser } from './template-parser';
import { XMLParser } from './xml-parser';
import { BufferBuilder } from './buffer-builder';
import Utils from '../../../../utils';
// import { UTF8ArrayConverter } from '../../../utils/utf8.arrayconverter';

export class EscPos {
  private static NULL_CHAR = '\0';

  private static NULL_REPLACE = String.fromCharCode(Command.SO);

  private static LEADING_SPACE_REPLACE = String.fromCharCode(Command.SI);

  public static getBufferFromTemplate(template: string, data: any): number[] {
    let templateParser;
    templateParser = new TemplateParser();
    return templateParser.parser(template, data).build();
  }

  public static getBufferFromXML(xml: string): number[] {
    let xmlParser;
    xmlParser = new XMLParser();
    return xmlParser.parser(xml).build();
  }

  public static getBufferBuilder(): BufferBuilder {
    return new BufferBuilder();
  }

  public static getTransformed(xml: string): string {
    let xmlParser;
    xmlParser = new XMLParser();
    return Utils.utf8ArrayDecode(xmlParser.parser(xml).buildConv());
  }

  public static getTransformedRaw(xml: string): Uint8Array {
    let xmlParser;
    xmlParser = new XMLParser();
    return xmlParser.parser(xml).buildConv();
  }

  private static replaceByteArray(text: string, target: string, replacement: string) {
    let chrArray;
    chrArray = text.split('');
    chrArray.forEach( (value, index) => {
      if (value === target) {
        const prev = (index - 1) >= 0 ? (index - 1) : 0;
        const next = (index + 1) < chrArray.length ? (index + 1) : (index);

        chrArray[index] = replacement;
      }
    });

    return chrArray.join('');
  }

  public static escapeNull(text: string): string {
    return EscPos.replaceByteArray(text, EscPos.NULL_CHAR, EscPos.NULL_REPLACE);
  }

  public static unescapeNull(text: string): string {
    return EscPos.replaceByteArray(text, EscPos.NULL_REPLACE, EscPos.NULL_CHAR);
  }

  public static unescapeLeadingSpace(text: string): string | null {
    return EscPos.replaceByteArray(text, EscPos.LEADING_SPACE_REPLACE, " ");
  }

  public static getParsed(text: string, data: any): string {
    let templateParser;
    templateParser = new TemplateParser();
    return templateParser.vanillaParser(text, data);
  }

}
