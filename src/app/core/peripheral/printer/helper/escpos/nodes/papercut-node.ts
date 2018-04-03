import { XMLNode } from '../xml-node';
import { BufferBuilder } from '..';

export default class PaperCutNode extends XMLNode {

    constructor(node: any) {
        super(node);
    }

    public open(bufferBuilder: BufferBuilder): BufferBuilder {
        bufferBuilder.lineFeed(5);

        switch (this.attributes.mode) {
            case 'partial':
                bufferBuilder.paperCutPartial();
                break;
            case 'full':
                bufferBuilder.paperCutFull();
                break;
            default:
                bufferBuilder.paperCutPartial();
        }

        return bufferBuilder;
    }
    public close(bufferBuilder: BufferBuilder): BufferBuilder {
        return bufferBuilder;
    }
}
