"use strict";

exports.__esModule = true;
exports.default = void 0;

var _variableType = require("./helpers/variableType");

var _tools = require("./helpers/tools");

var _DocumentContext = _interopRequireDefault(require("./DocumentContext"));

var _events = require("events");
const { scaleLine } = require("./scaleLineWithImgOrSvg");

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/**
 * A line/vector writer, which adds elements to current page and sets
 * their positions based on the context
 */
class ElementWriter extends _events.EventEmitter {
  constructor(context,pdfSettings) {
    super();
		this.pdfSettings = pdfSettings;
    this._context = context;
    this.contextStack = [];
  }

  context() {
    return this._context;
  }

	isSvgEl(el){
		return el.props&&el.props.svg;
	}

	isImgEl(el){
		return el.props&&el.props.image;
	}

	hasSvgOrImgInLine(els){
		return els.some((el)=>this.isSvgEl(el)||this.isImgEl(el));
	}

	centerElThatWasScaled(el){
		let scalePercentage = el.props.scaledPrecentage;
		let elwidth = el.width;
		let scW = elwidth*scalePercentage;
		if(this.isSvgEl(el)){
			this.inlineSvgsAbsPos[el.props.svgId].x += 0;
			this.inlineSvgsAbsPos[el.props.svgId].scW = scW;
		}else if(this.isImgEl(el)){
			this.inlineSvgsAbsPos[el.props.imgId].x += 0;
			this.inlineSvgsAbsPos[el.props.imgId].scW = scW;
		}
	}

  addLine(line, dontUpdateContextPosition, index) {
    let height = line.getHeight();
    let context = this.context();
    let page = context.getCurrentPage();
    let position = this.getCurrentPositionOnPage();
		position.lineHeight = height;
		line.lineHeight = height;
		line.availableHeight = context.availableHeight;

		// to do -> check here if line has svgs or imgs and try scale them so that it can fit in the available height on page


    if (context.availableHeight < height || !page) {
			// check if line contains svgs or images ;
			if(page && this.hasSvgOrImgInLine(line.inlines) && scaleLine(this.pdfSettings,line,this)){
				line.inlines.forEach((inline)=>{
					if(inline.props&&inline.props.scaledH){
						inline.props.height = inline.props.scaledH;
						if(inline.props.svg){
								line.svgs[inline.props.svgId]._height = inline.props.scaledH;
							line.svgs[inline.props.svgId].fit = [line.svgs[inline.props.svgId]._width,inline.props.scaledH];
						}else if(inline.props.image){
							line.svgs[inline.props.imgId].height = inline.props.scaledH;
							line.svgs[inline.props.imgId]._height = inline.props.scaledH;
							line.svgs[inline.props.imgId].fit[1] = inline.props.scaledH;
						}
					}
				});
				height = line.getHeight();
				context = this.context();
        page = context.getCurrentPage();
				position = this.getCurrentPositionOnPage();
				position.lineHeight = height;
				line.lineHeight = height;
				line.availableHeight = context.availableHeight;
			}else{
				return false;
			}
    }

    line.x = context.x + (line.x || 0);
    line.y = context.y + (line.y || 0);
    this.alignLine(line);
		let svgposOnCurrPage = {};
		if(this.hasSvgOrImgInLine(line.inlines)||line.lineHasOnlySubAndSup){
			let textoffsetTop = line.lineOffsetTop;
			if(!this.inlineSvgsAbsPos){
				this.inlineSvgsAbsPos = {};
			}
			let fontSize;
			line.inlines.forEach((el)=>{
				if(!fontSize){fontSize = el.fontSize;}
				if(this.isSvgEl(el)){
					this.inlineSvgsAbsPos[el.props.svgId]={y:el.props.calcOffsetTop+line.y,x:line.x+el.x };
					svgposOnCurrPage[el.props.svgId] = this.inlineSvgsAbsPos[el.props.svgId];
				}else if(this.isImgEl(el)){
					this.inlineSvgsAbsPos[el.props.imgId]={y:el.props.calcOffsetTop+line.y,x:line.x+el.x };
					svgposOnCurrPage[el.props.imgId] = this.inlineSvgsAbsPos[el.props.imgId];
				}
				if((this.isSvgEl(el)||this.isImgEl(el))&&el.props.scaledH){
					this.centerElThatWasScaled(el);
				}
			});
			line.y += textoffsetTop  - fontSize + 0.7;
		}
		Object.keys(svgposOnCurrPage).forEach((svg)=>{
			svgposOnCurrPage[svg].absolutePage = position.pageNumber;
		});
    addPageItem(page, {
      type: 'line',
      item: line
    }, index);
    this.emit('lineAdded', line);

    if (!dontUpdateContextPosition) {
      context.moveDown(height);
    }

    return position;
  }

  alignLine(line) {
    let width = this.context().availableWidth;
    let lineWidth = line.getWidth();
    let alignment = line.inlines && line.inlines.length > 0 && line.inlines[0].alignment;
    let offset = 0;

    switch (alignment) {
      case 'right':
        offset = width - lineWidth;
        break;

      case 'center':
        offset = (width - lineWidth) / 2;
        break;
    }

    if (offset) {
      line.x = (line.x || 0) + offset;
    }

    if (alignment === 'justify' && !line.newLineForced && !line.lastLineInParagraph && line.inlines.length > 1) {
      let additionalSpacing = (width - lineWidth) / (line.inlines.length - 1);

      for (let i = 1, l = line.inlines.length; i < l; i++) {
        offset = i * additionalSpacing;
        line.inlines[i].x += offset;
        line.inlines[i].justifyShift = additionalSpacing;
      }
    }
  }

  addImage(image, index) {
    let context = this.context();
    let page = context.getCurrentPage();
    let position = this.getCurrentPositionOnPage();

    if (!page || image.absolutePosition === undefined && context.availableHeight < image._height && page.items.length > 0) {
      return false;
    }

    if (image._x === undefined) {
      image._x = image.x || 0;
    }

    image.x = context.x + image._x;
    image.y = context.y;
		if(image.inlineimg&&this.inlineSvgsAbsPos&&this.inlineSvgsAbsPos[image.imgId]){
			let data = this.inlineSvgsAbsPos[image.imgId];
			image.x = data.x;
			image.y = data.y;
			image.absolutePage = data.absolutePage;
		}else{
			this.alignImage(image);
		}
    addPageItem(page, {
      type: 'image',
      item: image
    }, index);
    context.moveDown(image._height);
    return position;
  }

  addCanvas(node, index) {
    let context = this.context();
    let page = context.getCurrentPage();
    let positions = [];
    let height = node._minHeight;

    if (!page || node.absolutePosition === undefined && context.availableHeight < height) {
      // TODO: support for canvas larger than a page
      // TODO: support for other overflow methods
      return false;
    }

    this.alignCanvas(node);
    node.canvas.forEach(function (vector) {
      let position = this.addVector(vector, false, false, index);
      positions.push(position);

      if (index !== undefined) {
        index++;
      }
    }, this);
    context.moveDown(height);
    return positions;
  }

  addSVG(image, index) {
    // TODO: same as addImage
    let context = this.context();
    let page = context.getCurrentPage();
    let position = this.getCurrentPositionOnPage();

    if (!page || image.absolutePosition === undefined && context.availableHeight < image._height && page.items.length > 0) {
      return false;
    }

    if (image._x === undefined) {
      image._x = image.x || 0;
    }

    image.x = context.x + image._x;
    image.y = context.y;
		if(image.inlinesvg&&this.inlineSvgsAbsPos&&this.inlineSvgsAbsPos[image.svgId]){
			let data = this.inlineSvgsAbsPos[image.svgId];
			image.x = data.x;
			image.y = data.y;
			image.absolutePage = data.absolutePage;
		}else{
			this.alignImage(image);
		}
    addPageItem(page, {
      type: 'svg',
      item: image
    }, index);
    context.moveDown(image._height);
    return position;
  }

  addQr(qr, index) {
    let context = this.context();
    let page = context.getCurrentPage();
    let position = this.getCurrentPositionOnPage();

    if (!page || qr.absolutePosition === undefined && context.availableHeight < qr._height) {
      return false;
    }

    if (qr._x === undefined) {
      qr._x = qr.x || 0;
    }

    qr.x = context.x + qr._x;
    qr.y = context.y;
    this.alignImage(qr);

    for (let i = 0, l = qr._canvas.length; i < l; i++) {
      let vector = qr._canvas[i];
      vector.x += qr.x;
      vector.y += qr.y;
      this.addVector(vector, true, true, index);
    }

    context.moveDown(qr._height);
    return position;
  }

  addAttachment(attachment, index) {
    let context = this.context();
    let page = context.getCurrentPage();
    let position = this.getCurrentPositionOnPage();

    if (!page || attachment.absolutePosition === undefined && context.availableHeight < attachment._height && page.items.length > 0) {
      return false;
    }

    if (attachment._x === undefined) {
      attachment._x = attachment.x || 0;
    }

    attachment.x = context.x + attachment._x;
    attachment.y = context.y;
    addPageItem(page, {
      type: 'attachment',
      item: attachment
    }, index);
    context.moveDown(attachment._height);
    return position;
  }

  alignImage(image) {
    let width = this.context().availableWidth;
    let imageWidth = image._minWidth;
    let offset = 0;

    switch (image._alignment) {
      case 'right':
        offset = width - imageWidth;
        break;

      case 'center':
        offset = (width - imageWidth) / 2;
        break;
    }

    if (offset) {
      image.x = (image.x || 0) + offset;
    }
  }

  alignCanvas(node) {
    let width = this.context().availableWidth;
    let canvasWidth = node._minWidth;
    let offset = 0;

    switch (node._alignment) {
      case 'right':
        offset = width - canvasWidth;
        break;

      case 'center':
        offset = (width - canvasWidth) / 2;
        break;
    }

    if (offset) {
      node.canvas.forEach(vector => {
        (0, _tools.offsetVector)(vector, offset, 0);
      });
    }
  }

  addVector(vector, ignoreContextX, ignoreContextY, index) {
    let context = this.context();
    let page = context.getCurrentPage();
    let position = this.getCurrentPositionOnPage();

    if (page) {
      (0, _tools.offsetVector)(vector, ignoreContextX ? 0 : context.x, ignoreContextY ? 0 : context.y);
      addPageItem(page, {
        type: 'vector',
        item: vector
      }, index);
      return position;
    }
  }

  beginClip(width, height) {
    let ctx = this.context();
    let page = ctx.getCurrentPage();
    page.items.push({
      type: 'beginClip',
      item: {
        x: ctx.x,
        y: ctx.y,
        width: width,
        height: height
      }
    });
    return true;
  }

  endClip() {
    let ctx = this.context();
    let page = ctx.getCurrentPage();
    page.items.push({
      type: 'endClip'
    });
    return true;
  }

  addFragment(block, useBlockXOffset, useBlockYOffset, dontUpdateContextPosition) {
    let ctx = this.context();
    let page = ctx.getCurrentPage();

    if (!useBlockXOffset && block.height > ctx.availableHeight) {
      return false;
    }

    block.items.forEach(item => {
      switch (item.type) {
        case 'line':
          var l = item.item.clone();

          if (l._node) {
            l._node.positions[0].pageNumber = ctx.page + 1;
          }

          l.x = (l.x || 0) + (useBlockXOffset ? block.xOffset || 0 : ctx.x);
          l.y = (l.y || 0) + (useBlockYOffset ? block.yOffset || 0 : ctx.y);
          page.items.push({
            type: 'line',
            item: l
          });
          break;

        case 'vector':
          var v = (0, _tools.pack)(item.item);
          (0, _tools.offsetVector)(v, useBlockXOffset ? block.xOffset || 0 : ctx.x, useBlockYOffset ? block.yOffset || 0 : ctx.y);
          page.items.push({
            type: 'vector',
            item: v
          });
          break;

        case 'image':
        case 'svg':
          var img = (0, _tools.pack)(item.item);
          img.x = (img.x || 0) + (useBlockXOffset ? block.xOffset || 0 : ctx.x);
          img.y = (img.y || 0) + (useBlockYOffset ? block.yOffset || 0 : ctx.y);
          page.items.push({
            type: item.type,
            item: img
          });
          break;
      }
    });

    if (!dontUpdateContextPosition) {
      ctx.moveDown(block.height);
    }

    return true;
  }
  /**
   * Pushes the provided context onto the stack or creates a new one
   *
   * pushContext(context) - pushes the provided context and makes it current
   * pushContext(width, height) - creates and pushes a new context with the specified width and height
   * pushContext() - creates a new context for unbreakable blocks (with current availableWidth and full-page-height)
   *
   * @param {object|number} contextOrWidth
   * @param {number} height
   */


  pushContext(contextOrWidth, height) {
    if (contextOrWidth === undefined) {
      height = this.context().getCurrentPage().height - this.context().pageMargins.top - this.context().pageMargins.bottom;
      contextOrWidth = this.context().availableWidth;
    }

    if ((0, _variableType.isNumber)(contextOrWidth)) {
      contextOrWidth = new _DocumentContext.default({
        width: contextOrWidth,
        height: height
      }, {
        left: 0,
        right: 0,
        top: 0,
        bottom: 0
      });
    }

    this.contextStack.push(this.context());
    this._context = contextOrWidth;
  }

  popContext() {
    this._context = this.contextStack.pop();
  }

  getCurrentPositionOnPage() {
    return (this.contextStack[0] || this.context()).getCurrentPosition();
  }

}

function addPageItem(page, item, index) {
  if (index === null || index === undefined || index < 0 || index > page.items.length) {
    page.items.push(item);
  } else {
    page.items.splice(index, 0, item);
  }
}

var _default = ElementWriter;
exports.default = _default;
