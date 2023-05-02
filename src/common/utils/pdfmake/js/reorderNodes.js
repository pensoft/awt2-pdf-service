function caluclateNodesH(nodes, pages, docStructure, writer /* pdfDocument */) {
	let pageMargins = writer._context.pageMargins;
	let pageInnerH =
		writer._context.availableHeight + writer._context.y - pageMargins.top;
	let getActTop = (top) => {
		return top - pageMargins.top;
	};
	/* 	let drawLine = (i,top)=>{
		pdfDocument.switchToPage(i);
		pdfDocument.moveTo(0, top).lineTo(40,top).fillAndStroke("red", "#900");
	}; */
	for (let i = 0; i < nodes.length; i++) {
		let node = nodes[i];
		if (!(node.props && node.props.main)) continue;

		let nm = node.nodePosMeta;
		let nodeStPage = nm.pageBefore;
		let nodeEndPage = nm.pageAfter;
		let nodeyBefore = nm.yBefore;
		let nodeyAfter = nm.yAfter;
		let nodeh =
			(nodeEndPage - nodeStPage) * pageInnerH +
			getActTop(nodeyAfter) -
			getActTop(nodeyBefore);
		/* 		drawLine(nodeStPage,nodeyBefore);
		drawLine(nodeEndPage,nodeyAfter); */
		for (let i = nodeStPage; i < nodeEndPage; i++) {
			let pm = pages[i].pageEndMeta;
			let endpageEmptySpace = pm.availableHeight;
			// eslint-disable-next-line no-unused-vars
			nodeh -= endpageEmptySpace;
		}

		node.calculatedHeight = nodeh;
	}
	//const range = pdfDocument.bufferedPageRange(); // => { start: 0, count: 2 }

	/* 	let i;
	let end;
for (i = range.start, end = range.start + range.count, range.start <= end; i < end; i++) {
	let pm = pages[i].pageEndMeta;
  pdfDocument.switchToPage(i);
  //doc.text(`Page ${i + 1} of ${range.count}`);
	drawLine(i,pm.y);
} */
	/* 	pages.forEach((page,i)=>{
		let pm = page.pageEndMeta;
	}); */
}

exports.calcH = (linearNodes, pages, docStructure, writer, pdfDocument) => {
	caluclateNodesH(linearNodes, pages, docStructure, writer, pdfDocument);
	return {
		pages: pages,
		linearNodeList: linearNodes,
	};
};
function isNumeric(str) {
	if (typeof str != "string") return false; // we only process strings!
	//@ts-ignore
	return (
		!isNaN(str) && // use type coercion to parse the _entirety_ of the string (`parseFloat` alone does not do this)...
		!isNaN(parseFloat(str))
	); // ...and ensure strings of whitespace fail
}

function pxToPt(px) {
	return px * 0.75;
}

let checkIfHeadingIsLastNodeOnNonLastPage = (
	node,
	nodesAfterNodeOnSamePage
) => {
	if (node.positions.length > 1) return false; // more than one line in paragraph / heading
	if (nodesAfterNodeOnSamePage.length > 0) return false; //node is not last node on the page
	if (!node.positions[0] || node.nodeInfo.pages == node.positions[0].pageNumber)
		return false; //node is on the last page
	node.pageBreak = "before";
	return true;
};

let checkNodesBeforeIfHeadingAndMove = (node, nodesBefore) => {
	let c = 0;
	let nonHeading = false;
	let moved = false;
	while (nodesBefore[nodesBefore.length - 1 - c] && c < 1 && !nonHeading) {
		let nodeBefore = nodesBefore[nodesBefore.length - 1 - c];
		//should probably check inner nodes if its a nested header
		if (
			(nodeBefore.props.type == "heading" ||
				nodeBefore.props.type == "paragraph" ||
				nodeBefore.props.type == "paragraphTable") &&
			nodeBefore.positions.length == 1
		) {
			nodeBefore.pageBreak = "before";
			node.pageBreak = undefined;
			if (c == 1) {
				nodesBefore[nodesBefore.length - 1].pageBreak = undefined;
			} else if (c == 2) {
				nodesBefore[nodesBefore.length - 1].pageBreak = undefined;
				nodesBefore[nodesBefore.length - 2].pageBreak = undefined;
			}
			moved = true;
		} else {
			nonHeading = true;
		}
		c++;
	}
	return moved;
};

// function should return true only if nodes order is changes , function should not change the nodes before , only reorder nodes after and cur node
exports.ordNodesFunc = (node, stack = [], pdfSettings, writer, i) => {
	let nodeFunc = {
			getAllNodesBefore: () => {
					if (i == 0)
							return [];
					return stack.slice(0, i);
			},
			getAllNodesAfter: () => {
					if (i == stack.length - 1)
							return [];
					return stack.slice(i + 1);
			},
			getNextNode: () => {
					if (i == stack.length - 1)
							return [];
					return stack.slice(i + 1, i + 2);
			},
	};
	let shouldAddPageBreakAfter = (n,nafter) => {
			// if (+pdfSettings.pdf.minParagraphLinesAtEndOfPage == 0) return false;
			let availableHeightOnPage = writer._context.availableHeight - 4;
			let minParagraphLinesAtEndOfPage = pdfSettings.pdf.minParagraphLinesAtEndOfPage + 1;
			let linesSumH = 0;
			let linesSumWithoutAdd = 0;
			for (let i = 0; (i < minParagraphLinesAtEndOfPage && i < n.positions.length); i++) {
				let lineH = n.positions[i].lineHeight;
				linesSumH = linesSumH + lineH;
				if ((i < minParagraphLinesAtEndOfPage - 1 && i < n.positions.length - 1)) {
					linesSumWithoutAdd += lineH;
				}
			}
			if (linesSumH > availableHeightOnPage && (n.positions.length > 1 && linesSumWithoutAdd < availableHeightOnPage)) {
				return true;
			}else if(nafter){
				linesSumH += n._margin[1];
				linesSumH += n._margin[3];
				for (let i = 0; (i < minParagraphLinesAtEndOfPage && i < nafter.positions.length); i++) {
					let lineH = nafter.positions[i].lineHeight;
					linesSumH = linesSumH + lineH;
					if ((i < minParagraphLinesAtEndOfPage - 1 && i < nafter.positions.length - 1)) {
						linesSumWithoutAdd += lineH;
					}
				}
				if(n.stack[0].text == "Figures" && nafter.pageBreak == 'before') {
					if(availableHeightOnPage > nafter.calculatedHeight + n.calculatedHeight) {
						nafter.pageBreak == undefined;
						return false;
					}
					nafter.pageBreak == undefined;
					return true;
				} else if (n.stack[0].text == "Tables" && nafter.pageBreak == 'before') {
					if(availableHeightOnPage > nafter.calculatedHeight + n.calculatedHeight) {
						nafter.pageBreak == undefined;
						return false;
					}
					nafter.pageBreak == undefined;
					return true;
				}
				if (linesSumH > availableHeightOnPage) {
					return true;
				}
			}
			return false;
	};
	if (node.table && node.table.props && node.table.props.type == "figure") {
			let structuredNodes = stack;
			let nodesBefore = nodeFunc.getAllNodesBefore();
			let nodesAfter = nodeFunc.getAllNodesAfter();
			if (nodesBefore.length > 0) {
					let availableHeightAfterLastNode = writer._context.availableHeight;
					let figureH = node.calculatedHeight;
					if (availableHeightAfterLastNode > figureH) {
							node.pageBreak = undefined;
							return false;
					}
					if (availableHeightAfterLastNode < 100) {
							return false;
					}
					let loopTableAndChangeWidth = (nodeToChange) => {
							let availableHeightOnLastPage = writer._context.availableHeight;
							let figureHeight = nodeToChange.calculatedHeight;
							let imagesTable = nodeToChange.table.body[0][0].columns[1];
							let npm = imagesTable.nodePosMeta;
							let imageTableHeight = npm.yAfter - npm.yBefore;
							let descriptionHeight = figureHeight - imageTableHeight;
							let imageNewHeight = availableHeightOnLastPage - descriptionHeight - 3;
							let dawnScalePercent = imageNewHeight / imageTableHeight;
							let scaleFromUserInput = pdfSettings.pdf.maxFiguresImagesDownscale.replace("%", "");
							let scale = 0.8;
							if (isNumeric(scaleFromUserInput)) {
									scale = +scaleFromUserInput / 100;
							}
							if (dawnScalePercent >= scale) {
									nodeToChange.pageOrderCalculated = true;
									nodeToChange.pageBreak = "after";
									for (let r = 0; r < imagesTable.table.body.length; r++) {
											let row = imagesTable.table.body[r];
											for (let c = 0; c < row.length; c++) {
													let cell = row[c];
													if (cell.fit && cell.fit[1]) {
															let dimensions = { width: cell.width, height: cell.height };
															let h = cell.fit[1] * dawnScalePercent;
															let w = cell.fit[0] * dawnScalePercent;
															cell.fit[1] = h;
															cell.fit[0] = w;
															let factor = (dimensions.width / dimensions.height > cell.fit[0] / cell.fit[1]) ? cell.fit[0] / dimensions.width : cell.fit[1] / dimensions.height;
															cell._width = cell._minWidth = cell._maxWidth = dimensions.width * factor;
															cell._height = dimensions.height * factor;
													}
											}
									}
									return true;
							}
							else {
									return false;
							}
					};
					if (loopTableAndChangeWidth(node)) {
							node.pageBreak = undefined;
							return false;
					}
					let filledSpace = 0;
					let counter = 0;
					let movedIndexes = [];
					let cannotMove = false;
					while (counter < nodesAfter.length && !cannotMove) {
							let nAfter = nodesAfter[counter];
							if (nAfter.calculatedHeight <
									availableHeightAfterLastNode - filledSpace &&
									!nAfter.table) {
									filledSpace += nAfter.calculatedHeight;
									movedIndexes.push(1 + nodesBefore.length + counter);
							}
							else {
									cannotMove = true;
							}
							counter++;
					}
					if (movedIndexes.length > 0 &&
							availableHeightAfterLastNode - filledSpace < 200 &&
							availableHeightAfterLastNode > 200) {
							let figureNode = structuredNodes.splice(nodesBefore.length, 1);
							let biggestIndex = Math.max(...movedIndexes);
							node.pageOrderCalculated = false;
							structuredNodes.splice(biggestIndex, 0, figureNode[0]);
							return true;
					}
					return false;
			}
	}
	else if (node.table && node.table.props && node.table.props.type == "citable-table") {
			let structuredNodes = stack;
			let nodesBefore = nodeFunc.getAllNodesBefore();
			let nodesAfter = nodeFunc.getAllNodesAfter();
			if (nodesBefore.length > 0) {
					let availableHeightAfterLastNode = writer._context.availableHeight;
					let tableH = node.calculatedHeight;
					if (availableHeightAfterLastNode > tableH) {
							node.pageBreak = undefined;
							return false;
					}
					if (availableHeightAfterLastNode < 100) {
							return false;
					}
					let filledSpace = 0;
					let counter = 0;
					let movedIndexes = [];
					let cannotMove = false;
					while (counter < nodesAfter.length && !cannotMove) {
							let nAfter = nodesAfter[counter];
							if (nAfter.calculatedHeight <
									availableHeightAfterLastNode - filledSpace &&
									!nAfter.table) {
									filledSpace += nAfter.calculatedHeight;
									movedIndexes.push(1 + nodesBefore.length + counter);
							}
							else {
									cannotMove = true;
							}
							counter++;
					}
					if (movedIndexes.length > 0) {
							let talbeNode = structuredNodes.splice(nodesBefore.length, 1);
							let biggestIndex = Math.max(...movedIndexes);
							node.pageOrderCalculated = false;
							structuredNodes.splice(biggestIndex, 0, talbeNode[0]);
							return true;
					}
					return false;
			}
	}
	else if (node.props.type == "paragraph") {
			if (shouldAddPageBreakAfter(node)) {
					// node.pageBreak = 'before';
			}
	}
	else if (node.props.type == "block-math") {
			let availableHeightAfterLastNode = writer._context.availableHeight;
			let mathContainerH = node.calculatedHeight;
			if (mathContainerH > availableHeightAfterLastNode) {
					let maxMathDownscale = pdfSettings.pdf.maxMathDownscale.replace("%", "");
					let scale = 0.8;
					if (isNumeric(maxMathDownscale)) {
							scale = +maxMathDownscale / 100;
					}
					let structuredNodes = stack;
					let nodesBefore = nodeFunc.getAllNodesBefore();
					let mathEl = node.columns[1].stack[0];
					let mathH = mathEl._height;
					let mathW = mathEl._width;
					let mathContainerSpaceDiff = mathContainerH - mathH;
					let mathHRequiredToFittAvailableSpace = availableHeightAfterLastNode - mathContainerSpaceDiff - 5;
					let requiredScalePercent = mathHRequiredToFittAvailableSpace / mathH;
					if (requiredScalePercent > scale && requiredScalePercent < 1) {
							let h = mathH * requiredScalePercent;
							let w = mathW * requiredScalePercent;
							mathEl._minHeight = h;
							mathEl.height = h;
							mathEl._height = h;
							mathEl._maxHeight = h;
							mathEl._minWidth = w;
							mathEl.width = w;
							mathEl._width = w;
							mathEl._maxWidth = w;
							return false;
					}
			}
	} else if (node.props.type == "heading") {
		if (shouldAddPageBreakAfter(node,nodeFunc.getNextNode()[0])) {
			node.pageBreak = 'before';
		}
	} else if (node.props.type == 'endnotes') {
		let availableHeightOnPage = writer._context.availableHeight + 130;
		if(node.calculatedHeight > availableHeightOnPage) {
			node.pageBreak = 'before';
		}
	} else if (node.props.type == 'supplementary') {
		let availableHeightOnPage = writer._context.availableHeight - 4;
		if(node.calculatedHeight > availableHeightOnPage) {
			node.pageBreak = 'before';
		}
	}
	return false;
};
