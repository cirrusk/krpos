import AlignNode from './nodes/align-node';
import BarcodeNode from './nodes/barcode-node';
import BoldNode from './nodes/bold-node';
import DocumentNode from './nodes/document-node';
import LineFeedNode from './nodes/line-feed-node';
import SmallNode from './nodes/small-node';
import TextNode from './nodes/text-node';
import TextLineNode from './nodes/text-line-node';
import UnderlineNode from './nodes/underline-node';
import PaperCutNode from './nodes/papercut-node';
import NVImageNode from './nodes/nvimage-node';
import CashDrawerNode from './nodes/cashdrawer-node';
import ReverseNode from './nodes/reverse-node';
import DashLineNode from './nodes/dashline-node';

export class NodeFactory {

  public static create(nodeType: String, node) {
    switch (nodeType) {
      case 'align':      return new AlignNode(node);
      case 'barcode':    return new BarcodeNode(node);
      case 'bold':       return new BoldNode(node);
      case 'document':   return new DocumentNode(node);
      case 'line-feed':  return new LineFeedNode(node);
      case 'small':      return new SmallNode(node);
      case 'text':       return new TextNode(node);
      case 'text-line':  return new TextLineNode(node);
      case 'underline':  return new UnderlineNode(node);
      case 'papercut': return new PaperCutNode(node);
      case 'nvimage': return new NVImageNode(node);
      case 'logo': return new NVImageNode(node);
      case 'cashdrawer': return new CashDrawerNode(node);
      case 'reverse': return new ReverseNode(node);
      case 'dash-line': return new DashLineNode(node);
      default:           return null;
    }
  }

}
