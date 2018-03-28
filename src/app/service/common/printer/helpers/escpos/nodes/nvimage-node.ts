import { XMLNode } from "../xml-node";
import { BufferBuilder } from "..";

export default class NVImageNode extends XMLNode {

    constructor(node: any) {
        super(node);
    }

    public open(bufferBuilder: BufferBuilder): BufferBuilder {
        bufferBuilder.printNVImage();
        return bufferBuilder;
    }
    public close(bufferBuilder: BufferBuilder): BufferBuilder {
        return bufferBuilder;
    }
}