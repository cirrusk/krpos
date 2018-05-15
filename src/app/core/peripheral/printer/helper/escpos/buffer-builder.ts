import { Command } from './command';
import { MutableBuffer } from 'mutable-buffer';

export class BufferBuilder {

  private buffer: MutableBuffer;
  private dash: string = '-----------------------------------------';
  
  constructor(private defaultSettings: boolean = true) {
    this.buffer = new MutableBuffer();
  }

  public setInit(): BufferBuilder {
    this.buffer.write(Command.ESC_init);
    return this;
  }

  public end(): BufferBuilder {
    return this;
  }

  public resetCharacterCodeTable(): BufferBuilder {
    this.buffer.write(Command.ESC_t(0));
    return this;
  }

  public setCharacterSize(width: number = 0, height: number = 0): BufferBuilder {
    const size = (width << 4) + height;
    this.buffer.write(Command.GS_exclamation(size));
    return this;
  }

  public resetCharacterSize(): BufferBuilder {
    this.buffer.write(Command.GS_exclamation(0));
    return this;
  }

  public startCompressedCharacter(): BufferBuilder {
    this.buffer.write(Command.ESC_M(1));
    return this;
  }

  public endCompressedCharacter(): BufferBuilder {
    this.buffer.write(Command.ESC_M(0));
    return this;
  }

  public startBold(): BufferBuilder {
    this.buffer.write(Command.ESC_E(1));
    return this;
  }

  public endBold(): BufferBuilder {
    this.buffer.write(Command.ESC_E(0));
    return this;
  }

  public startUnderline(underlineMode: UNDERLINE_MODE = UNDERLINE_MODE.ONE_POINT_OF_COARSE): BufferBuilder {
    this.buffer.write(Command.ESC_minus(underlineMode));
    return this;
  }

  public endUnderline(): BufferBuilder {
    this.buffer.write(Command.ESC_minus(48));
    return this;
  }

  public startAlign(alignment: ALIGNMENT): BufferBuilder {
    this.buffer.write(Command.ESC_a(alignment));
    return this;
  }

  public resetAlign(): BufferBuilder {
    return this.startAlign(ALIGNMENT.LEFT);
  }

  public startReverseMode(): BufferBuilder {
    this.buffer.write(Command.ESC_rev(1));
    return this;
  }

  public endReverseMode(): BufferBuilder {
    this.buffer.write(Command.ESC_rev(0));
    return this;
  }

  public printBarcode(data: string, barcodeSystem: BARCODE_SYSTEM, width: BARCODE_WIDTH = BARCODE_WIDTH.DOT_375, height: number = 162,
    labelFont: BARCODE_LABEL_FONT = BARCODE_LABEL_FONT.FONT_A,
    labelPosition: BARCODE_LABEL_POSITION = BARCODE_LABEL_POSITION.BOTTOM, leftSpacing: number = 0): BufferBuilder {
    this.buffer.write(Command.GS_w(width)); // width
    this.buffer.write(Command.GS_h(height)); // height
    this.buffer.write(Command.GS_x(leftSpacing)); // left spacing
    this.buffer.write(Command.GS_f(labelFont)); // HRI font
    this.buffer.write(Command.GS_H(labelPosition)); // HRI font
    this.buffer.write(Command.GS_K(barcodeSystem, data.length)); // data is a string in UTF-8
    this.buffer.write(data, 'ascii');
    return this;
  }

  public printBitmap(image: number[], width: number, height: number, scale: BITMAP_SCALE = BITMAP_SCALE.NORMAL): BufferBuilder {
    // TODO
    return this;
  }

  public printText(text: string): BufferBuilder {
    this.buffer.write(text);
    return this;
  }

  public printTextMode(text: string, mode: string = 'utf-8'): BufferBuilder {
    switch (mode) {
      case 'utf-8':
        this.buffer.write(text, 'utf-8');
        break;
      case 'ascii':
        this.buffer.write(text, 'ascii');
        break;
      case 'base64':
        this.buffer.write(text, 'base64');
        break;
      default:
        this.buffer.write(text, 'utf-8');
        break;
    }

    return this;
  }

  public fill(chr: string): BufferBuilder {
    let token: string = chr;

    if (token.length > 1) {
      token = chr.substr(0, 1);
    }

    for (let i = 0 ; i < 41 ; i++) {
      token += token;
    }

    return this.printTextLine(token);
  }

  public fillDash(): BufferBuilder {
    return this.printTextLine(this.dash);
  }

  public printTextLine(text: string): BufferBuilder {
    return this.printText(text).lineFeed();
  }

  public lineFeed(lines: number = 1): BufferBuilder {
    for (let i = 0 ; i < lines ; i++) {
      this.buffer.write(Command.LF);
    }
    return this;
  }

  public paperCutFull(): BufferBuilder {
    this.buffer.write(Command.GS_V(PAPER_CUTMODE.FULL));
    return this;
  }

  public paperCutPartial(): BufferBuilder {
    this.buffer.write(Command.GS_V(PAPER_CUTMODE.PARTIAL));
    return this;
  }

  public printNVImage(): BufferBuilder {
    this.buffer.write(Command.FS_p(1));
    return this;
  }

  public openCashDrawer(): BufferBuilder {
    this.buffer.write(Command.ESC_p(CASHDRAWER_SIGNAL.LINE_2));
    this.buffer.write(Command.ESC_p(CASHDRAWER_SIGNAL.LINE_5));
    return this;
  }

  public transmitStatus(statusType: STATUS_TYPE): BufferBuilder {
    this.buffer.write(Command.DLE_EOT(statusType));
    return this;
  }

  public build(): number[] {
    if (this.defaultSettings) {
      this.lineFeed();
      this.buffer.write(Command.ESC_init);
    }

    this.buffer.write(Command.ESC_init);

    return this.buffer.flush();
  }

  public buildConv(): Uint8Array {
    return this.buffer.flush();
  }

}

export enum UNDERLINE_MODE {
  ONE_POINT_OF_COARSE = 49,
  TWO_POINTS_OF_COARSE = 50
}

export enum ALIGNMENT {
  LEFT = 48,
  CENTER = 49,
  RIGHT = 50
}

export enum BARCODE_SYSTEM {
  UPC_A = 65,
  UPC_E = 66,
  EAN_13 = 67,
  EAN_8 = 68,
  CODE_39 = 69,
  ITF = 70,
  CODABAR = 71,
  CODE_93 = 72,
  CODE_128 = 73
}

export enum BARCODE_WIDTH {
  DOT_250 = 2,
  DOT_375 = 3,
  DOT_560 = 4,
  DOT_625 = 5,
  DOT_750 = 6
}

export enum BARCODE_LABEL_FONT {
  FONT_A = 48,
  FONT_B = 49
}

export enum BARCODE_LABEL_POSITION {
  NOT_PRINT = 48,
  ABOVE = 49,
  BOTTOM = 50,
  ABOVE_BOTTOM = 51
}

export enum QR_EC_LEVEL {
  L = 0,
  M = 1,
  Q = 2,
  H = 3
}

export enum BITMAP_SCALE {
  NORMAL = 48,
  DOUBLE_WIDTH = 49,
  DOUBLE_HEIGHT = 50,
  FOUR_TIMES = 51
}

export enum STATUS_TYPE {
  PRINTER_STATUS = 1,
  OFFLINE_STATUS = 2,
  ERROR_STATUS = 3,
  PAPER_ROLL_SENSOR_STATUS = 4
}

export enum CASHDRAWER_SIGNAL {
  LINE_2 = 48,
  LINE_5 = 49
}

export enum PAPER_CUTMODE {
  FULL = 48,
  PARTIAL = 49
}
