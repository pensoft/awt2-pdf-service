exports.findInlineHeight = function findInlineHeight(cell) {
  let inlines = cell._inlines;
  if (cell._inlines) {
    let inlinesHeights = cell._inlines.map((inline) => {
      return inline.height || inline._height;
    });
    return { height: Math.max(inlinesHeights) || inlinesHeights[0] || 0 };
  } else {
    return { height: cell.height || cell._height || 0 };
  }
  let calcLines = (inlines) => {
    if (!inlines)
      return {
        height: 0,
        width: 0,
      };
    let currentMaxHeight = 0;
    let lastHadLineEnd = false;
    for (const currentNode of inlines) {
      usedWidth += currentNode.width;
      if (usedWidth > maxWidth || lastHadLineEnd) {
        currentMaxHeight += currentNode.height;
        usedWidth = currentNode.width;
      } else {
        currentMaxHeight = Math.max(currentNode.height, currentMaxHeight);
      }
      lastHadLineEnd = !!currentNode.lineEnd;
    }
    return {
      height: currentMaxHeight,
      width: usedWidth,
    };
  };
  if (cell._offsets) {
    usedWidth += cell._offsets.total;
  }
  if (cell._inlines && cell._inlines.length) {
    return calcLines(cell._inlines);
  } else if (cell.stack && cell.stack[0]) {
    return cell.stack
      .map((item) => {
        return findInlineHeight(item, maxWidth);
      })
      .reduce((prev, next) => {
        return {
          height: prev.height + next.height,
          width: Math.max(prev.width + next.width),
        };
      });
  } else if (cell.table) {
    let currentMaxHeight = 0;
    for (const currentTableBodies of cell.table.body) {
      const innerTableHeights = currentTableBodies.map(mapTableBodies);
      currentMaxHeight = Math.max(...innerTableHeights, currentMaxHeight);
    }
    return {
      height: currentMaxHeight,
      width: usedWidth,
    };
  } else if (cell._height) {
    usedWidth += cell._width;
    return {
      height: cell._height,
      width: usedWidth,
    };
  }

  return {
    height: null,
    width: usedWidth,
  };
};
exports.mapTableBodies = function mapTableBodies(innerTableCell) {
  const findInlineHeight = exports.findInlineHeight(
    innerTableCell,
    maxWidth,
    usedWidth
  );

  usedWidth = findInlineHeight.width;
  return findInlineHeight.height;
};

exports.applyVerticalAlignment = function applyVerticalAlignment(
  node,
  rowIndex,
  align,
  manualHeight = 0
) {
  // New default argument
  const allCellHeights = node.table.body[rowIndex].map(
    (innerNode, columnIndex) => {
      const mFindInlineHeight = exports.findInlineHeight(innerNode);
      return mFindInlineHeight.height;
    }
  );
  const maxRowHeight = manualHeight
    ? manualHeight[rowIndex]
    : Math.max(...allCellHeights); // handle manual height
  node.table.body[rowIndex].forEach((cell, ci) => {
    if (allCellHeights[ci] && maxRowHeight > allCellHeights[ci]) {
      let topMargin;

      let cellAlign = align;
      if (Array.isArray(align)) {
        cellAlign = align[ci];
      }

      if (cellAlign === "bottom") {
        topMargin = maxRowHeight - allCellHeights[ci];
      } else if (cellAlign === "center") {
        topMargin = (maxRowHeight - allCellHeights[ci]) / 2;
      }

      if (topMargin) {
        if (cell._margin) {
          cell._margin[1] = topMargin;
        } else {
          cell._margin = [0, topMargin, 0, 0];
        }
      }
    }
  });
};

exports.applyVerticalAlignmentv2 = function applyVerticalAlignment(
  node,
  rowIndex
) {
  let tableHeight = node.props.height;
  let tableBody = node.table.body;
  let mostOffsetBot = 0;
  let maxOffsetTop = 0;
  if(tableBody){
    tableBody[0].forEach((cell)=>{
      if(cell.svg){
        let svgwidth = cell.svgwidth
        let svgheight = cell.svgheight
        let svgverticalalign = cell.svgverticalalign
        
        let svgitemInCellH = cell._height;
        let svgInnerBaselineOffsetTop
        let svgInnerBaselineOffsetBot
        
        let offsetBotPercentage = svgverticalalign/svgheight;
        svgInnerBaselineOffsetBot = svgitemInCellH*offsetBotPercentage;
        svgInnerBaselineOffsetTop = svgitemInCellH*(1-offsetBotPercentage);

        if(svgInnerBaselineOffsetTop > maxOffsetTop){
          maxOffsetTop = svgInnerBaselineOffsetTop
        }

        cell.itemOffsetTop = svgInnerBaselineOffsetTop;
      }
    })
  }
  if (tableBody && maxOffsetTop>0) {
    tableBody[0].forEach((cell) => {
      if(!cell.margin){
        cell.margin = [0,0,0,0]
      }
      if (cell.svg) {
        cell.margin[1] = maxOffsetTop-cell.itemOffsetTop
      }else if (cell._inlines&&cell._inlines[0]&&cell._inlines[0].fontSize){
        cell.margin[1] = maxOffsetTop - cell._inlines[0].fontSize + 0.5;
      }
    });
  }
};
