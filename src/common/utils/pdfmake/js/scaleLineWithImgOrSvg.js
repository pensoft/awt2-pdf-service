exports.scaleLine = function(pdfSettings,line,writer){
	let context = writer.context();
	let newH = context.availableHeight-3; // remove some value so we are sure that after scale line will fit
	let oldH = line.getHeight();
	let svgs = line.svgs;
	// scaleLine func returns true if scaled the line or false if could not scale the line ;
	let maxScale = +pdfSettings.pdf.maxMathDownscale.replace('%','')/100;
	//maxScale = 0.3;
	let textbaseline = line.lineOffsetTop;
	let hDiff = oldH-newH;


	// calc proportional diff top and bot

	let topHfromBaseLine = textbaseline;
	let botHfromBaseLine = oldH-textbaseline;

	let topProprDiff = (hDiff/oldH)*topHfromBaseLine;
	let botProprDiff = (hDiff/oldH)*botHfromBaseLine;
	let topProprDiffOffset = topProprDiff;
	let botProprDiffOffset = oldH - botProprDiff;

	let canScale = true;
	line.inlines.forEach((inline)=>{
		if(canScale&&inline.props&&(inline.props.svg || inline.props.image)){
			let oldhitem;
			if(inline.props.svg){
				oldhitem = svgs[inline.props.svgId]._height;
			}else if (inline.props.image){
				oldhitem = inline.props.height;
			}
			let oldTopOffset = inline.props.calcOffsetTop;
			let oldBotOffset = oldTopOffset + oldhitem;
			let oldInnerTopOffset = inline.props.itemOffsetTop;
			let oldInnerBotOffset = oldhitem - oldInnerTopOffset;

			let topItemOffsetDiff = topProprDiffOffset - oldTopOffset; // if > 0 should scale item top is bigger than new line top , if < 0 item top will be ok after scale
			let botItemOffsetDiff = oldBotOffset - botProprDiffOffset; // if > 0 should scale item bot is bigger than new line bot , if < 0 item bot will be ok after scale

			// if item has to be scaled only because of top only because of bot then we should calc items bot or top accordingly to the base line so that the item can fit
			// if item both top and bot should be scaled to fit we should calc the bigger diff accordinglhy to the base line so that the item can fit

			if(topItemOffsetDiff > 0 || botItemOffsetDiff > 0){
				let actualTopDiff;
				let actualBotFiff;
				if(topItemOffsetDiff>botItemOffsetDiff){
					actualTopDiff = topItemOffsetDiff;
					actualBotFiff = (actualTopDiff/oldInnerTopOffset)*oldInnerBotOffset;
				}else if(botItemOffsetDiff>topItemOffsetDiff){
					actualTopDiff = (botItemOffsetDiff/oldInnerBotOffset)*oldInnerTopOffset;
					actualBotFiff = botItemOffsetDiff;
				}
				let itemHDiff = actualTopDiff + actualBotFiff;
				let newItemH = oldhitem-itemHDiff;
				let requiredScale = newItemH/oldhitem;
				if(requiredScale<maxScale){
					canScale = false;
				}else{
					context;
					writer;
					inline.props.scaledH = newItemH;
					inline.props.hBeforeScale = oldhitem;
					inline.props.scaledPrecentage = requiredScale;
				}
			}
		}
	});
	if(!canScale){
		line.inlines.forEach((inline)=>{
			if(inline.props&&inline.props.scaledH){
				inline.props.scaledH = undefined;
			}
		});
		return false;
	}else{
		return true;
	}
};
