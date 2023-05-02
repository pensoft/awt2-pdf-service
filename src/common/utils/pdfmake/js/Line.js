"use strict";

exports.__esModule = true;
exports.default = void 0;

class Line {
  /**
   * @param {number} maxWidth Maximum width this line can have
	 * @param {any} svgs
	 * @param {any} pdfSettings
   */
  constructor(maxWidth,svgs,pdfSettings) {
		this.svgs = svgs;
    this.maxWidth = maxWidth;
    this.leadingCut = 0;
    this.trailingCut = 0;
    this.inlineWidths = 0;
    this.inlines = [];
		this.pdfSettings = pdfSettings;
  }
  /**
   * @param {object} inline
   */


  addInline(inline) {
    if (this.inlines.length === 0) {
      this.leadingCut = inline.leadingCut || 0;
    }

    this.trailingCut = inline.trailingCut || 0;
    inline.x = this.inlineWidths - this.leadingCut;
    this.inlines.push(inline);
    this.inlineWidths += inline.width;

    if (inline.lineEnd) {
      this.newLineForced = true;
    }
  }
  /**
   * @returns {number}
   */


  getHeight() {
    let max = 0;
		let hasSubscript = false;
		let hasSuperscript = false;
		let allitemsInLineAreSubAndSup = true;
    this.inlines.forEach(item => {
      max = Math.max(max, item.height || 0);
			if(item.sub){
				hasSubscript = true;
			}
			if(item.sup){
				hasSuperscript = true;
			}
			if(!item.sub&&!item.sup){
				allitemsInLineAreSubAndSup = false;
			}
    });
		let maxOffsetTop = 0;
		let maxOffsetBot = 0;
		let anysvgs = this.inlines.some((el)=>el.props&&(el.props.svg||el.props.image));
		let minFontSize;
		let maxFontSize;

		this.inlines.forEach((inline)=>{
			if(inline.fontSize){
				if(!minFontSize || minFontSize>inline.fontSize) minFontSize = inline.fontSize;
				if(!maxFontSize || maxFontSize<inline.fontSize) maxFontSize = inline.fontSize;
			}
			if(inline.props&&inline.props.svg){
				let pr = inline.props;
				let svgheight = +pr.svgheight;
				let svgverticalalign = +pr.svgverticalalign;
				let svgitemInCellH = +this.svgs[inline.props.svgId]._height;
				let svgInnerBaselineOffsetTop ;
				let svgInnerBaselineOffsetBot ;
				let offsetBotPercentage = svgverticalalign/svgheight;
				svgInnerBaselineOffsetBot = svgitemInCellH*offsetBotPercentage;
				svgInnerBaselineOffsetTop = svgitemInCellH*(1-offsetBotPercentage);
				if(svgInnerBaselineOffsetTop > maxOffsetTop){
					maxOffsetTop = svgInnerBaselineOffsetTop;
				}
				if(maxOffsetBot < svgInnerBaselineOffsetBot){
					maxOffsetBot = svgInnerBaselineOffsetBot;
				}
				inline.props.itemOffsetTop = svgInnerBaselineOffsetTop;
			}else if(inline.props&&inline.props.image){
				let pr = inline.props;
				//let id = pr.imgId;
				let height = pr.height;
				let svgInnerBaselineOffsetTop = height;
				let svgInnerBaselineOffsetBot = 0;
				inline.props.itemOffsetTop = svgInnerBaselineOffsetTop;
				if(svgInnerBaselineOffsetTop > maxOffsetTop){
					maxOffsetTop = svgInnerBaselineOffsetTop;
				}
				if(maxOffsetBot < svgInnerBaselineOffsetBot){
					maxOffsetBot = svgInnerBaselineOffsetBot;
				}
			}
		});
    let subAdditionalH = maxFontSize*0.2;
    let supAdditionalH = maxFontSize*0.2;
    if(hasSubscript&&!allitemsInLineAreSubAndSup){
      maxOffsetBot+=subAdditionalH;
    }
    if(hasSuperscript&&!allitemsInLineAreSubAndSup){
      maxOffsetTop+=supAdditionalH;
    }
		if(allitemsInLineAreSubAndSup){
			this.lineHasOnlySubAndSup = true;
      maxOffsetBot+=maxFontSize - maxFontSize*0.5;
      maxOffsetTop+=maxFontSize+maxFontSize*0.5;
		}
		let lineCalch = maxOffsetTop+maxOffsetBot;
		this.inlines.forEach((inline)=>{
			if (inline.props&&(inline.props.svg||inline.props.image)) {
				inline.props.calcOffsetTop = maxOffsetTop-inline.props.itemOffsetTop; // important for svg absolute pos
			}
		});

		if(anysvgs||allitemsInLineAreSubAndSup){
			this.lineCalch = lineCalch;				// important
			this.lineOffsetTop = maxOffsetTop; // important
			return lineCalch;
		}
    return max;
  }
  /**
   * @returns {number}
   */


  getAscenderHeight() {
    let y = 0;
    this.inlines.forEach(inline => {
      y = Math.max(y, inline.font.ascender / 1000 * inline.fontSize);
    });
    return y;
  }
  /**
   * @returns {number}
   */


  getWidth() {
    return this.inlineWidths - this.leadingCut - this.trailingCut;
  }
  /**
   * @returns {number}
   */


  getAvailableWidth() {
    return this.maxWidth - this.getWidth();
  }
  /**
   * @param {object} inline
   * @param {Array} nextInlines
   * @returns {boolean}
   */


  hasEnoughSpaceForInline(inline, nextInlines = []) {
    if (this.inlines.length === 0) {
      return true;
    }

    if (this.newLineForced) {
      return false;
    }

    let inlineWidth = inline.width;
    let inlineTrailingCut = inline.trailingCut || 0;

    if (inline.noNewLine) {
      for (let i = 0, l = nextInlines.length; i < l; i++) {
        let nextInline = nextInlines[i];
        inlineWidth += nextInline.width;
        inlineTrailingCut += nextInline.trailingCut || 0;

        if (!nextInline.noNewLine) {
          break;
        }
      }
    }

    return this.inlineWidths + inlineWidth - this.leadingCut - inlineTrailingCut <= this.maxWidth;
  }

  clone() {
    let result = new Line(this.maxWidth);

    for (let key in this) {
      if (this.hasOwnProperty(key)) {
        result[key] = this[key];
      }
    }

    return result;
  }

}

var _default = Line;
exports.default = _default;
