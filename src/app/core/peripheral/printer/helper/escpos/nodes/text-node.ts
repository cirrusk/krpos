import { XMLNode } from '../xml-node';
import { BufferBuilder } from '../buffer-builder';

export default class TextNode extends XMLNode {

  constructor(node: any) {
    super(node);
  }

  public open(bufferBuilder: BufferBuilder): BufferBuilder {

    if (/\d+:\d+/.test(this.attributes.size)) {
      // let size: number[] = new String(this.attributes.size).split(':').map(entry => parseInt(entry, 10));
      const size: number[] = this.attributes.size.split(':').map(entry => parseInt(entry, 10));
      bufferBuilder.setCharacterSize(size[0], size[1]);
    }

    if (this.attributes.reverse) {
      bufferBuilder.startReverseMode();
    }

    bufferBuilder.printText(this.getContent().trim());

    return bufferBuilder;
  }

  public close(bufferBuilder: BufferBuilder): BufferBuilder {
    bufferBuilder.resetCharacterSize();
    bufferBuilder.endReverseMode();
    return bufferBuilder;
  }

}
