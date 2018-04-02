import { XMLNode } from '../xml-node';
import { BufferBuilder } from '../buffer-builder';

export default class LineFeedNode extends XMLNode {

  constructor(node: any) {
    super(node);
  }

  public open(bufferBuilder: BufferBuilder): BufferBuilder {
    let lines = 0;

    try {
      lines = this.attributes.lines;
    } catch (ex) {
      lines = 1;
    }

    bufferBuilder.lineFeed(lines);

    return bufferBuilder;
  }

  public close(bufferBuilder: BufferBuilder): BufferBuilder {
    return bufferBuilder;
  }
}
