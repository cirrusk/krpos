import * as parser from 'xml-parser';
import { BufferBuilder } from './buffer-builder';
import { XMLNode } from './xml-node';
import { NodeFactory } from './node-factory';

export class XMLParser {

  public parser(xml: string): BufferBuilder {
    const parsedXML = parser(xml);
    console.log(parsedXML);
    return this.compile(parsedXML);
  }

  private compile(parsedXML: any): BufferBuilder {
    let bufferBuilder;
    bufferBuilder = new BufferBuilder();
    let rootNode;
    rootNode = this.adapter(parsedXML.root, null);
    return rootNode.draw(bufferBuilder);
  }

  private adapter(node: any, parentNode): XMLNode {
    let xmlNode: XMLNode;
    xmlNode = NodeFactory.create(node.name, node);
    if (parentNode) { parentNode.addChild(xmlNode); }
    if (node.children.length > 0) {
      node.children.forEach(child => {
        this.adapter(child, xmlNode);
      });
    }
    return xmlNode;
  }

}
