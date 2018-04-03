import { XMLNode } from '../xml-node';
import { BufferBuilder } from '../buffer-builder';

export default class ReverseNode extends XMLNode {

  constructor(node: any) {
    super(node);
  }

  public open(bufferBuilder: BufferBuilder): BufferBuilder {
    bufferBuilder.startReverseMode();
    return bufferBuilder;
  }

  public close(bufferBuilder: BufferBuilder): BufferBuilder {
    bufferBuilder.endReverseMode();
    return bufferBuilder;
  }

}
