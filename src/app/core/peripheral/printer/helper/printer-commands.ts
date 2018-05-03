
export class PrinterCommands {

    private CMD = {
        LF: '\x0a',
        ESC: '\x1b',
        FS: '\x1c',
        GS: '\x1d',
        US: '\x1f',
        FF: '\x0c',
        CR: '\x0d',
        DLE: '\x10',
        DC1: '\x11',
        DC4: '\x14',
        EOT: '\x04',
        NUL: '\x00',
        EOL: '\n',
        FEED_CONTROL_SEQUENCES: {
            CTL_LF: '\x0a', // Print and line feed
            CTL_MULTI_LF: '\x64', // Print and n lines feed
            CTL_FF: '\x0c', // Form feed
            CTL_CR: '\x0d', // Carriage return
            CTL_HT: '\x09', // Horizontal tab
            CTL_VT: '\x0b', // Vertical tab
        },
        LINE_SPACING: {
            LS_DEFAULT: '\x1b\x32',
            LS_SET: '\x1b\x33'
        },
        HARDWARE: {
            HW_INIT: '\x1b\x40', // Clear data in buffer and reset modes
            HW_SELECT: '\x1b\x3d\x01', // Printer select
            HW_RESET: '\x1b\x3f\x0a\x00', // Reset printer hardware
        },
        CASH_DRAWER: {
            CD_KICK_2: '\x1b\x70\x00', // Sends a pulse to pin 2 []
            CD_KICK_5: '\x1b\x70\x01', // Sends a pulse to pin 5 []
        },
        MARGINS: {
            BOTTOM: '\x1b\x4f', // Fix bottom size
            LEFT: '\x1b\x6c', // Fix left size
            RIGHT: '\x1b\x51', // Fix right size
        },
        PAPER: {
            PAPER_FULL_CUT: '\x1d\x56\x00', // Full cut paper
            PAPER_PART_CUT: '\x1d\x56\x01', // Partial cut paper
            PAPER_CUT_A: '\x1d\x56\x41', // Partial cut paper
            PAPER_CUT_B: '\x1d\x56\x42', // Partial cut paper
        },
        TEXT_FORMAT: {
            TXT_NORMAL: '\x1b\x21\x00', // Normal text
            TXT_2HEIGHT: '\x1b\x21\x10', // Double height text
            TXT_2WIDTH: '\x1b\x21\x20', // Double width text
            TXT_4SQUARE: '\x1b\x21\x30', // Double width & height text

            TXT_CUSTOM_SIZE: function(width, height) { // other sizes
                const widthDec = (width - 1) * 16;
                const heightDec = height - 1;
                const sizeDec = widthDec + heightDec;
                return '\x1d\x21' + String.fromCharCode(sizeDec);
            },

            TXT_HEIGHT: {
                1: '\x00',
                2: '\x01',
                3: '\x02',
                4: '\x03',
                5: '\x04',
                6: '\x05',
                7: '\x06',
                8: '\x07'
            },
            TXT_WIDTH: {
                1: '\x00',
                2: '\x10',
                3: '\x20',
                4: '\x30',
                5: '\x40',
                6: '\x50',
                7: '\x60',
                8: '\x70'
            },

            TXT_UNDERL_OFF: '\x1b\x2d\x00', // Underline font OFF
            TXT_UNDERL_ON: '\x1b\x2d\x01', // Underline font 1-dot ON
            TXT_UNDERL2_ON: '\x1b\x2d\x02', // Underline font 2-dot ON
            TXT_BOLD_OFF: '\x1b\x45\x00', // Bold font OFF
            TXT_BOLD_ON: '\x1b\x45\x01', // Bold font ON
            TXT_ITALIC_OFF: '\x1b\x35', // Italic font ON
            TXT_ITALIC_ON: '\x1b\x34', // Italic font ON

            TXT_FONT_A: '\x1b\x4d\x00', // Font type A
            TXT_FONT_B: '\x1b\x4d\x01', // Font type B
            TXT_FONT_C: '\x1b\x4d\x02', // Font type C

            TXT_ALIGN_LT: '\x1b\x61\x00', // Left justification
            TXT_ALIGN_CT: '\x1b\x61\x01', // Centering
            TXT_ALIGN_RT: '\x1b\x61\x02', // Right justification

            TXT_REVERSE_OFF: '\x1d\x42\x00', // Reverse mode on
            TXT_REVERSE_ON: '\x1d\x42\x01', // Reverse mode off
        },
        BARCODE_FORMAT: {
            BARCODE_TXT_OFF: '\x1d\x48\x00', // HRI barcode chars OFF
            BARCODE_TXT_ABV: '\x1d\x48\x01', // HRI barcode chars above
            BARCODE_TXT_BLW: '\x1d\x48\x02', // HRI barcode chars below
            BARCODE_TXT_BTH: '\x1d\x48\x03', // HRI barcode chars both above and below

            BARCODE_FONT_A: '\x1d\x66\x00', // Font type A for HRI barcode chars
            BARCODE_FONT_B: '\x1d\x66\x01', // Font type B for HRI barcode chars

            BARCODE_HEIGHT: function(height) { // Barcode Height [1-255]
                return '\x1d\x68' + String.fromCharCode(height);
            },
            // Barcode Width  [2-6]
            BARCODE_WIDTH: {
                1: '\x1d\x77\x02',
                2: '\x1d\x77\x03',
                3: '\x1d\x77\x04',
                4: '\x1d\x77\x05',
                5: '\x1d\x77\x06',
            },
            BARCODE_HEIGHT_DEFAULT: '\x1d\x68\x64', // Barcode height default:100
            BARCODE_WIDTH_DEFAULT: '\x1d\x77\x01', // Barcode width default:1

            BARCODE_UPC_A: '\x1d\x6b\x00', // Barcode type UPC-A
            BARCODE_UPC_E: '\x1d\x6b\x01', // Barcode type UPC-E
            BARCODE_EAN13: '\x1d\x6b\x02', // Barcode type EAN13
            BARCODE_EAN8: '\x1d\x6b\x03', // Barcode type EAN8
            BARCODE_CODE39: '\x1d\x6b\x04', // Barcode type CODE39
            BARCODE_ITF: '\x1d\x6b\x05', // Barcode type ITF
            BARCODE_NW7: '\x1d\x6b\x06', // Barcode type NW7
            BARCODE_CODE93: '\x1d\x6b\x48', // Barcode type CODE93
            BARCODE_CODE128: '\x1d\x6b\x49', // Barcode type CODE128
        },
        CODE2D_FORMAT: {
            TYPE_PDF417: '\x1b\x5a\x00',
            TYPE_DATAMATRIX: '\x1b\x5a\x01',
            TYPE_QR: '\x1b\x5a\x02',
            CODE2D: '\x1b\x5a',
        },
        IMAGE_FORMAT: {
            S_RASTER_N: '\x1d\x76\x30\x00', // Set raster image normal size
            S_RASTER_2W: '\x1d\x76\x30\x01', // Set raster image double width
            S_RASTER_2H: '\x1d\x76\x30\x02', // Set raster image double height
            S_RASTER_Q: '\x1d\x76\x30\x03', // Set raster image quadruple
        },
        BITMAP_FORMAT: {
            BITMAP_S8: '\x1b\x2a\x00',
            BITMAP_D8: '\x1b\x2a\x01',
            BITMAP_S24: '\x1b\x2a\x20',
            BITMAP_D24: '\x1b\x2a\x21'
        },
        GSV0_FORMAT: {
            GSV0_NORMAL: '\x1d\x76\x30\x00',
            GSV0_DW: '\x1d\x76\x30\x01',
            GSV0_DH: '\x1d\x76\x30\x02',
            GSV0_DWDH: '\x1d\x76\x30\x03'
        },
        NV_MEMORY: {
            PRINT: {
                NV_NORMAL: '\x1c\x70\x01\x00',
                NV_DOUBLE_WIDTH: '\x1c\x70\x01\x01',
                NV_DOUBLE_HEIGHT: '\x1c\x70\x01\x02',
                NV_QUADRUPLE: '\x1c\x70\x01\x03'
            }
        }
    };

    public initPrinter(): string {
        return this.CMD.HARDWARE.HW_INIT;
    }

    public selectPageMode(): string {
        return this.CMD.FF;
    }

    public defaultLineSpace(): string {
        return this.CMD.LINE_SPACING.LS_DEFAULT;
    }

    public paperPartialCut(): string {
        return this.CMD.PAPER.PAPER_PART_CUT;
    }

    public paperFullCut(): string {
        return this.CMD.PAPER.PAPER_FULL_CUT;
    }

    public bold(text: string): string {
        return this.CMD.TEXT_FORMAT.TXT_BOLD_ON + text + this.CMD.TEXT_FORMAT.TXT_BOLD_OFF;
    }

    public underline(text: string): string {
        return this.CMD.TEXT_FORMAT.TXT_UNDERL_ON + text + this.CMD.TEXT_FORMAT.TXT_UNDERL_OFF;
    }

    public reverse(text: string): string {
        return this.CMD.TEXT_FORMAT.TXT_REVERSE_ON + text + this.CMD.TEXT_FORMAT.TXT_REVERSE_OFF;
    }

    public newline(times: number): string {
        let ret = '';

        for (let i = 0 ; i < times ; i++) {
            ret += this.CMD.CR + this.CMD.LF;
        }

        return ret;
    }

    public println(text: string): string {
        return text + this.CMD.CR + this.CMD.LF;
    }

    public doubledHeight(text: string): string {
        return this.CMD.TEXT_FORMAT.TXT_2HEIGHT + text + this.CMD.TEXT_FORMAT.TXT_NORMAL;
    }

    public doubledWidth(text: string): string {
        return this.CMD.TEXT_FORMAT.TXT_2WIDTH + text + this.CMD.TEXT_FORMAT.TXT_NORMAL;
    }

    public doubledBoth(text: string): string {
        return this.CMD.TEXT_FORMAT.TXT_4SQUARE + text + this.CMD.TEXT_FORMAT.TXT_NORMAL;
    }

    public printHorizontalDash(font: string = 'A'): string {
        let dash = '------------------------------------------';

        if (font !== 'A') {
            dash = dash + '--------------';
        }

        return dash;
    }

    public fontA(): string {
        return this.CMD.TEXT_FORMAT.TXT_FONT_A;
    }

    public fontB(): string {
        return this.CMD.TEXT_FORMAT.TXT_FONT_B;
    }

    public center(): string {
        return this.CMD.TEXT_FORMAT.TXT_ALIGN_CT;
    }

    public left(): string {
        return this.CMD.TEXT_FORMAT.TXT_ALIGN_LT;
    }

    public right(): string {
        return this.CMD.TEXT_FORMAT.TXT_ALIGN_RT;
    }

    public printNVImage(): string {
        return this.CMD.NV_MEMORY.PRINT.NV_NORMAL;
    }

    public openCashDrawer() {
        return this.CMD.CASH_DRAWER.CD_KICK_2 + this.CMD.CASH_DRAWER.CD_KICK_5;
    }

    // public imageMode(): string {
    //     return this.CMD.BITMAP_FORMAT.BITMAP_D24;
    // }

    // public printImage(bytes: string): string {
    //     return this.CMD.GSV0_FORMAT.GSV0_NORMAL + bytes;
    // }

    public printBarcodeCodeUAT(text: string) {
        const barcode: string = this.println(text) +
                                this.CMD.BARCODE_FORMAT.BARCODE_WIDTH['3'] + this.CMD.BARCODE_FORMAT.BARCODE_HEIGHT_DEFAULT +
                                this.CMD.BARCODE_FORMAT.BARCODE_FONT_A + this.CMD.BARCODE_FORMAT.BARCODE_TXT_BLW +
                                this.CMD.BARCODE_FORMAT.BARCODE_CODE93 + String.fromCharCode(text.length) + text +
                                this.CMD.NUL + this.newline(3);
        return barcode;
    }


    public printBarcodeCode128(text: string) {
        // width
        // height
        // leftSpacing
        // HRI Font
        // HRI Position
        // System
        // Data

        // text.length.toString().charCodeAt(0)

        // BARCODE_UPC_A: '\x1d\x6b\x00', // Barcode type UPC-A
        // BARCODE_UPC_E: '\x1d\x6b\x01', // Barcode type UPC-E
        // BARCODE_EAN13: '\x1d\x6b\x02', // Barcode type EAN13
        // BARCODE_EAN8: '\x1d\x6b\x03', // Barcode type EAN8
        // BARCODE_CODE39: '\x1d\x6b\x04', // Barcode type CODE39
        // BARCODE_ITF: '\x1d\x6b\x05', // Barcode type ITF
        // BARCODE_NW7: '\x1d\x6b\x06', // Barcode type NW7
        // BARCODE_CODE93: '\x1d\x6b\x48', // Barcode type CODE93
        // BARCODE_CODE128: '\x1d\x6b\x49', // Barcode type CODE128

        const barcode: string = this.println('UPC A') +
                                this.CMD.BARCODE_FORMAT.BARCODE_WIDTH['3'] + this.CMD.BARCODE_FORMAT.BARCODE_HEIGHT_DEFAULT +
                                this.CMD.BARCODE_FORMAT.BARCODE_FONT_A + this.CMD.BARCODE_FORMAT.BARCODE_TXT_BLW +
                                this.CMD.BARCODE_FORMAT.BARCODE_UPC_A + String.fromCharCode(text.length) + text
                                + this.CMD.NUL + this.newline(3) +
                                this.println('UPC E') +
                                this.CMD.BARCODE_FORMAT.BARCODE_WIDTH['3'] + this.CMD.BARCODE_FORMAT.BARCODE_HEIGHT_DEFAULT +
                                this.CMD.BARCODE_FORMAT.BARCODE_FONT_A + this.CMD.BARCODE_FORMAT.BARCODE_TXT_BLW +
                                this.CMD.BARCODE_FORMAT.BARCODE_UPC_E + String.fromCharCode(text.length) + text +
                                this.CMD.NUL + this.newline(3) +
                                this.println('EAN 13') +
                                this.CMD.BARCODE_FORMAT.BARCODE_WIDTH['3'] + this.CMD.BARCODE_FORMAT.BARCODE_HEIGHT_DEFAULT +
                                this.CMD.BARCODE_FORMAT.BARCODE_FONT_A + this.CMD.BARCODE_FORMAT.BARCODE_TXT_BLW +
                                this.CMD.BARCODE_FORMAT.BARCODE_EAN13 + String.fromCharCode(text.length) + text +
                                this.CMD.NUL + this.newline(3) +
                                this.println('EAN 8') +
                                this.CMD.BARCODE_FORMAT.BARCODE_WIDTH['3'] + this.CMD.BARCODE_FORMAT.BARCODE_HEIGHT_DEFAULT +
                                this.CMD.BARCODE_FORMAT.BARCODE_FONT_A + this.CMD.BARCODE_FORMAT.BARCODE_TXT_BLW +
                                this.CMD.BARCODE_FORMAT.BARCODE_EAN8 + String.fromCharCode(text.length) + text +
                                this.CMD.NUL + this.newline(3) +
                                this.println('Code 39') +
                                this.CMD.BARCODE_FORMAT.BARCODE_WIDTH['3'] + this.CMD.BARCODE_FORMAT.BARCODE_HEIGHT_DEFAULT +
                                this.CMD.BARCODE_FORMAT.BARCODE_FONT_A + this.CMD.BARCODE_FORMAT.BARCODE_TXT_BLW +
                                this.CMD.BARCODE_FORMAT.BARCODE_CODE39 + String.fromCharCode(text.length) + text +
                                this.CMD.NUL + this.newline(3) +
                                this.println('Code 93') +
                                this.CMD.BARCODE_FORMAT.BARCODE_WIDTH['3'] + this.CMD.BARCODE_FORMAT.BARCODE_HEIGHT_DEFAULT +
                                this.CMD.BARCODE_FORMAT.BARCODE_FONT_A + this.CMD.BARCODE_FORMAT.BARCODE_TXT_BLW +
                                this.CMD.BARCODE_FORMAT.BARCODE_CODE93 + String.fromCharCode(text.length) + text +
                                this.CMD.NUL + this.newline(3) +
                                this.println('Code 128') +
                                this.CMD.BARCODE_FORMAT.BARCODE_WIDTH['3'] + this.CMD.BARCODE_FORMAT.BARCODE_HEIGHT_DEFAULT +
                                this.CMD.BARCODE_FORMAT.BARCODE_FONT_A + this.CMD.BARCODE_FORMAT.BARCODE_TXT_BLW +
                                this.CMD.BARCODE_FORMAT.BARCODE_CODE128 + String.fromCharCode(text.length) + text +
                                this.CMD.NUL + this.newline(3) +
                                this.println('ITF') +
                                this.CMD.BARCODE_FORMAT.BARCODE_WIDTH['3'] + this.CMD.BARCODE_FORMAT.BARCODE_HEIGHT_DEFAULT +
                                this.CMD.BARCODE_FORMAT.BARCODE_FONT_A + this.CMD.BARCODE_FORMAT.BARCODE_TXT_BLW +
                                this.CMD.BARCODE_FORMAT.BARCODE_ITF + String.fromCharCode(text.length) + text +
                                this.CMD.NUL + this.newline(3) +
                                this.println('NW7') +
                                this.CMD.BARCODE_FORMAT.BARCODE_WIDTH['3'] + this.CMD.BARCODE_FORMAT.BARCODE_HEIGHT_DEFAULT +
                                this.CMD.BARCODE_FORMAT.BARCODE_FONT_A + this.CMD.BARCODE_FORMAT.BARCODE_TXT_BLW +
                                this.CMD.BARCODE_FORMAT.BARCODE_NW7 + String.fromCharCode(text.length) + text +
                                this.CMD.NUL + this.newline(3);

        return barcode;
    }
}
