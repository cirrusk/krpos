import { Injectable } from '@angular/core';
import { Subject } from 'rxjs/Subject';

import { PrinterDriver } from './printer.driver';
import { FormatReader } from '../common/format-reader';
import { DriverReadyBroker } from '../../broker/driverstatus.broker';
import { PrinterConfigs } from './helper/printer-configs';
import { Logger } from '../../logger/logger';
import { EscPos } from './helper/escpos/escpos';
import Utils from '../../utils';

@Injectable()
export class PrinterService {

  // 프린터 설정 override
  private printerOpts: PrinterConfigs;
  constructor(private printerDriver: PrinterDriver,
    private dirverReadyBroker: DriverReadyBroker,
    private formatReaderService: FormatReader,
    private logger: Logger) {
    // Wait
    const waitPrinterDriver: Subject<any> = this.dirverReadyBroker.getPrinterObserver();
    waitPrinterDriver.subscribe(
      () => {
          this.printerOpts = {
              size: {width: 79, height: null},
              units: 'mm',
              colorType: 'grayscale',
              interpolation: 'bilinear'
              // scaleContent: false
          };

          this.logger.set({n: 'printer.service', m: 'Printer driver is ready'}).debug();

          this.printerDriver.overridePrinterConfig(this.printerOpts);
      }
    );
  }
  public closeConnection(): void {
    this.printerDriver.close();
  }

  public printInlineHTML(html: string) {
    this.printerDriver.printPixelModeHTML(html).subscribe(
        (result) => {

        },
        (err) => {
            throw err;
        },
        () => {
            this.logger.set({n: 'printer.service', m: 'Printing[HTML] is complete'}).debug();
        }
    );
  }

  public printText(rawData: string) {
    this.printerDriver.printRawModeText(rawData).subscribe(
        () => {

        },
        (err) => {
            throw err;
        },
        () => {
            this.logger.set({n: 'printer.service', m: 'Printing[Text] is complete'}).debug();
        }
    );
  }

  public sendCommand(cmd: string) {
    this.printText(cmd);
  }

  public openCashDrawer() {

  }

  public initXmlTemplates() {
    this.formatReaderService.readFormat('assets/template/receipt/test/test2.xml')
    .subscribe(
        (text) => {
            console.log(`===== Original : \n${text}`);
            // let build: number[] = EscPos.getBufferFromXML(text);
            const raw: Uint8Array = EscPos.getTransformedRaw(text);
            console.log(`===== Raw data : \n${raw}`);

            const converted: string = Utils.utf8ArrayDecode(raw);
            console.log(`===== convertedToString : \n${converted}\n${converted.split('')}`);

            const escaped = EscPos.escapeNull(converted);
            console.log(`===== Null Escaped :\n ${escaped}\n${escaped.split('')}`);

            const parsed = EscPos.getParsed(escaped, {
                'subtitle': 'MJMJ'
            });
            console.log(`===== Parsed : \n${parsed}`);

            const unescaped = EscPos.unescapeNull(parsed);
            console.log(`===== Unescaped : \n${unescaped}`);

            const encoded = Utils.utf8ArrayEncode(converted);
            console.log(`==== Encoded : \n${encoded}`);

            // let same = (encoded === org) ? true : false;

            // console.log(`==== Check : \n${same}`);
        }
    );
  }

}
