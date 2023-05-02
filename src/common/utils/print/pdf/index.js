/* eslint-disable prettier/prettier */
let pdfMake = require("../../pdfmake/js/index.js");
let vfs = require("../../pdfmake/build/vfs_fonts.js");
const jsdom = require("jsdom");
const { JSDOM } = jsdom;
const navigator = require("navigator");
global.navigator = navigator;
const path = require("path");
const dom = new JSDOM(`<!DOCTYPE html><div class="render-katex"></div>`);
const {loadImages,loppNodes,loopAndRunFunc} = require('./pdfJsonPrepFns');
var mathjax = require("mathjax-node");
global.window = dom.window;
global.document = dom.window.document;
global.HTMLCanvasElement = dom.window.HTMLCanvasElement;
global.HTMLVideoElement = dom.window.HTMLVideoElement;
global.Element = dom.window.Element;
global.Node = dom.window.Node;
global.HTMLElement = dom.window.Node;
global.Text = dom.window.Text;

const { getComputedStyle } = window;
window.getComputedStyle = (elt) => getComputedStyle(elt);

pdfMake.vfs = vfs;
pdfMake.fonts = {
  Roboto: {
    normal: "Roboto-Regular.ttf",
    bold: "Roboto-Medium.ttf",
    italics: "Roboto-Italic.ttf",
    bolditalics: "Roboto-MediumItalic.ttf",
  },
  CodeFont: {
    normal: "SourceCodePro-Regular.ttf",
    bold: "SourceCodePro-Medium.ttf",
    italics: "SourceCodePro-Italic.ttf",
    bolditalics: "SourceCodePro-MediumItalic.ttf",
  },
  Math1: {
    normal: "fontello.ttf",
    bold: "fontello.ttf",
    italics: "fontello.ttf",
    bolditalics: "fontello.ttf",
  },
};

let vfsPdf = require('../../pdfmake/js/virtual-fs').default;
for (var key in vfs) {
  if (vfs.hasOwnProperty(key)) {
    var data = void 0;
    var encoding = void 0;

    if (typeof vfs[key] === 'object') {
      data = vfs[key].data;
      encoding = vfs[key].encoding || 'base64';
    } else {
      data = vfs[key];
      encoding = 'base64';
    }

    vfsPdf.writeFileSync(key, data, encoding);
  }
}
exports.renderPdf = async (data, metaData) => {
  pdfSettings = metaData.pdfSettings;
/*   let orderFns = getFns(pdfSettings) */

  /*   data.orderNodes = orderFns.ordNodesFunc
  data.pageBreakBefore = orderFns.pageBreakBefore */
/*   data.reorderAllNodes = orderFns.reorderAllNodes */
  await loadImages(data.images)
  let svgs = [];
  await loppNodes(data.content,svgs,data);
  await loppNodes(data.footer,svgs,data);
  await loppNodes(data.header,svgs,data);
  const directory = path.resolve(process.cwd(), "./print/pdf/mathsvgs");

  // matches fontsize 11  if u change the mathScale prop u should change the font size acordigly
  let mathMatch = 11;
  let mathScale = 5.785;
  let loadAndSaveMath = async (data) => {
    let svgId = 0;
    return loopAndRunFunc(data, async (obj) => {
      if (obj&&obj.svgType && obj.svgType == "katex") {
        return new Promise((resolve, reject) => {
          let katexFormula = obj.katexFormula;
          if (obj.katexType == "inline") {

            mathjax.typeset(
              {
                math: katexFormula,
                format: "inline-TeX",
                svg: true,
              },
              function (result) {
                obj.svg = result.svg;
                let matchgroups = obj.svg.toString().match(/ (width="[^("|\s)]+"|height="[^("|\s)]+"|style="[^(")]+")/gm)
                let svgwidth = matchgroups[0].match(/[\d.]+/gm)[0]
                let svgheight = matchgroups[1].match(/[\d.]+/gm)[0]
                let svgverticalalign = matchgroups[2].match(/[\d.]+/gm)[0]
                obj.svgwidth = svgwidth
                obj.svgheight = svgheight
                obj.svgverticalalign = svgverticalalign
                obj.props.canvasDims[0] = svgwidth
                obj.props.canvasDims[1] = svgheight
                obj.props.canvasDims[0] = obj.props.canvasDims[0] * mathScale
                obj.props.canvasDims[1] = obj.props.canvasDims[1] * mathScale
                obj.width = obj.props.canvasDims[0]
                svgId++;
                /*let svgstring = result.svg;
                svgstring = svgstring.replaceAll("<path ",'<path stroke="black" fill="black" ');
                svgstring = svgstring.replace(/<title.+?(?=title>)title>/,'');
                //svgstring = svgFlatten(svgstring).pathify().flatten().value()
                svgstring = svgstring.replaceAll(/"\/>\s+.+?(?= d=") d="/gm,'\n');*/
                obj.svgId =  "math" + svgId;
                obj.inlinesvg = true;
                //obj.fit=obj.props.canvasDims
                obj.absolutePosition = {x:0,y:0}
                svgs.push(obj)
                resolve(true);
                /* fs.writeFile(
                  path.join(directory, "math" + svgId + ".svg"),
                  svgstring,
                  (err, result) => {
                    if (err) {
                    } else {
                      resolve(true);
                    }
                  }
                ); */
              }
            );
          } else if (obj.katexType == "block") {
            mathjax.typeset(
              {
                math: katexFormula,
                format: "TeX",
                svg: true,
              },
              function (result) {
                obj.svg = result.svg;
                let matchgroups = obj.svg.toString().match(/ (width="[^("|\s)]+"|height="[^("|\s)]+"|style="[^(")]+")/gm)
                let svgwidth = matchgroups[0].match(/[\d.]+/gm)[0]
                let svgheight = matchgroups[1].match(/[\d.]+/gm)[0]
                let svgverticalalign = matchgroups[2].match(/[\d.]+/gm)[0]
                obj.svgwidth = svgwidth
                obj.svgheight = svgheight
                obj.svgverticalalign = svgverticalalign
                obj.props.canvasDims[0] = svgwidth
                obj.props.canvasDims[1] = svgheight
                obj.props.canvasDims[0] = obj.props.canvasDims[0] * mathScale
                obj.props.canvasDims[1] = obj.props.canvasDims[1] * mathScale
                obj.width = obj.props.canvasDims[0]
                resolve(true)
                // save math only for inline nodes
                svgId++;
                let svgstring = result.svg;
                svgstring = svgstring.replace(/<path /gm,'<path stroke="black" fill="black" ');
                svgstring = svgstring.replace(/<title.+?(?=title>)title>/,'');
                //svgstring = svgFlatten(svgstring).pathify().flatten().value();
                svgstring = svgstring.replace(/"\/>\s+.+?(?= d=") d="/gm,'\n');
                obj.svgId =  "math" + svgId;
                /* fs.writeFile(
                  path.join(directory, "math" + svgId + ".svg"),
                  svgstring,
                  (err, result) => {
                    if (err) {
                    } else {
                      resolve(true);
                    }
                  }
                ); */
              }
            );
          }
        });
      } else {
        return Promise.resolve(true);
      }
    });
  }
  // render new svgs with mathjax
  await loadAndSaveMath(data.content);
  await loadAndSaveMath(data.footer);
  await loadAndSaveMath(data.header);
  let svgspath = path.resolve(process.cwd(), "./print/pdf/mathsvgs/*.svg")
  let fontName = "mathfont"

  let hasLineBreakingNodes = (node,linebrekingNodes = [])=>{
    if(node&&Object.keys(node).some((key)=>linebrekingNodes.includes(key))){
      return true
    }
    if(node instanceof Array){
      for(let i = 0 ; i < node.length ; i++){
        if(hasLineBreakingNodes(node[i],linebrekingNodes)){
          return true
        }
      }
    }else if(typeof node == 'object'){
      let keys = Object.keys(node);
      for(let i = 0 ; i < keys.length ; i++){
        if(hasLineBreakingNodes(node[keys[i]],linebrekingNodes)){
          return true
        }
      }
    }
    return false;
  }
  let imagesCount = 0 ;
  let processParagraphsWithBlockNodes = (node,parr,key)=>{
    if(node&&node.text && node.text instanceof Array){
      let inlineBreakableNodes = ['image','svg'];
      if(hasLineBreakingNodes(node,inlineBreakableNodes)){
        let lbns = []
        node.text.forEach((ch,i,arr)=>{
          if(Object.keys(ch).some(key => inlineBreakableNodes.includes(key))){
            let oldNode = ch;
            lbns.push(oldNode);
            let type = Object.keys(ch).find(key => inlineBreakableNodes.includes(key));
            let newNode = {
              text:type,
              props:{
              },color:'white'
            }
            newNode.props[type] = true;
            if(type == 'svg'){
              if(parr[key].fontSize&&parr[key].fontSize!==mathMatch){
                let scalepercentage = parr[key].fontSize/mathMatch;
                ch.props.canvasDims[0] = ch.props.canvasDims[0]*scalepercentage
                ch.props.canvasDims[1] = ch.props.canvasDims[1]*scalepercentage
                ch.width = ch.props.canvasDims[0]
                ch.height = ch.props.canvasDims[1]
              }
              newNode.props.svgId = ch.svgId;
              newNode.props.width = ch.props.canvasDims[0];
              newNode.props.height = ch.props.canvasDims[1];
              newNode.props.svgheight = ch.svgheight;
              newNode.props.svgwidth = ch.svgwidth;
              newNode.inlinesvg = true;
              newNode.props.svgverticalalign = ch.svgverticalalign;
              oldNode.inlinesvg = true;
            }else if(type == 'image'){
              imagesCount++
              let imgId = 'img'+imagesCount
              oldNode.imgId = imgId
              oldNode.inlineimg = true;
              oldNode.fit=[oldNode.width,oldNode.height];
              oldNode.absolutePosition = {x:0,y:0};
              newNode.props.imgId = imgId;
              newNode.props.width = oldNode.width;
              newNode.props.height = oldNode.height;
            }
            arr[i] = newNode
          }
        })
        let originalNode = node ;

        let newNode = {stack:[originalNode,...lbns]};
        parr[key] = newNode
      }
    }
  }
  let loopAndRunFuncV2 = function(obj, fn,parrent,key) {
    fn(obj,parrent,key);
    if (obj instanceof Array) {
      for (let i = 0; i < obj.length; i++) {
        loopAndRunFuncV2(obj[i], fn,obj,i);
      }
    } else if (
      typeof obj == "string" ||
      typeof obj == "number" ||
      (obj && Object.keys(obj).length == 0) ||
      !obj ||
      typeof obj == "boolean" ||
      typeof obj == "function"
    ) {
      return true
    } else if (obj.svgType && obj.svgType == "katex") {
      return true
    } else if (Object.keys(obj).includes("table")) {
      loopAndRunFuncV2(obj.table.body, fn,obj.table,'body');
    } else if (Object.keys(obj).length > 0) {
      let keys = Object.keys(obj);
      for (let i = 0; i < keys.length; i++) {
        loopAndRunFuncV2(obj[keys[i]], fn,obj,keys[i])
      }
    } else {
      return true
    }
  }
  loopAndRunFuncV2(data.content,processParagraphsWithBlockNodes,data,'content')
  let dd = {
    content: [
    {
      stack:[
        {
          text:[
            'asd asdoiuioasu ioduoiauso duoiauso duasudo uoasud oiausoi duoso duoiauso duasudo uoasud oiausoi duoso duoiauso duasudo uoasud oiausoi duoasud iouaoisud ouaosduoausdo uoaisud ouasid uioasd ',
            {text:'qwe qwew eqw',decoration:'underline',background:'red'},
            {
              text: 'svg',
              props:{
                svg:true,
                svgId:'math1',
                width:91.28515625,
                height:282.8680204884106,
                svgheight:49.343,
                svgverticalalign:'47.049',
                svgwidth:'15.855'
              },color:'white' },
              'e q so duoiauso duasudo uoasud oiausoi duoso duoiauso duasudo uoasud oiausoi duoso duoiauso duasudo uoasud oiausoi duoso duoiauso duasudo uoasud oiausoi duoee',
            {
              text: 'svg',
              props:{
                svg:true,
                svgId:'math2',
                width:83.94921875,
                height:272.87485701576,
                svgheight:45.176,
                svgverticalalign:'22.005',
                svgwidth:'13.769'
              },
              color:'white' },'qwq eqe','asd asdoiuioasu ioduoiauso duoiauso duasudo uoasud oiausoi duoasud iouaoisud ouaosduoausdo uoaisud ouasid uioasd '

          ],
        },
        ...svgs
      ],
      props:{
        type:'paragraph',
        main:true
      },
    },
  ],
  };
/*   dd.orderNodes = orderFns.ordNodesFunc */
  let longtxt = `s orci luctus et ultrices posuere cubilia Curae; Donec velit neque, auctor sit amet aliquam vel, ullamcorper sit amet ligula. Cras ultricies ligula sed magna dictum porta. Curabitur arcu erat, accumsan id imperdiet et, porttitor at sem. Proin eget tortor rrimis in faucibus orci luctus et ultrices posuere cubilia Curae; Donec velit neque, auctor sit amet aliquam vel, ullamcorper sit amet ligula. Cras ultricies ligula sed magna dictum porta. Curabitur arcu erat, accumsan id imperdiet et, porttitor at sem. Proin eget tortor rrimis in faucibus orci luctus et ultrices posuere cubilia Curae; Donec velit neque, aucet ultrices posuere cubilia Curae; Donec velit neque, auctor sit amet aliquam vel, ullamcorper sit amet ligula. Cras ultricies ligula sed magna dictum porta. Curabitur arcu erat, accumsan id imperdiet et, porttitor at sem. Proin eget tortor risurimis in faucibus orci luctus et ultrices posuere cubilia Curae; Donec velit neque, auctor sit amet aliquam vel, ullamcorper sit amet ligula. Cras ultricies ligula sed magna dictum porta. Curabitur arcu erat, accumsan id imperdiet et, porttitor at sem. Proin eget tortor rrimis in faucibus orci luctus et ultrices posuere cubilia Curae; Donec velit neque, auctor sit amet aliquam vel, ullamcorper sit amet ligula. Cras ultricies ligula sed magna dictum porta. Curabitur arcu erat, accumsan id imperdiet et, porttitor at sem. Proin eget tortor rrimis in faucibus orci luctus et ultrices posuere cubilia Curae; Donec velit neque, auctor sit amet aliquam vel, ullamcorper sit amet ligula. Cras ultricies ligula sed magna dictum porta. Curabitur arcu erat, accumsan id imperdiet et, porttitor at sem. Proin eget tortor rrimis in faucibus orci luctus et ultrices posuere cubilia Curae; Donec velit neque, auctor sit amet aliquam vel, ullamcorper sit amet ligula. Cras ultricies ligula sed magna dictum porta. Curabitur arcu erat, accumsan id imperdiet et, porttitor at sem. Proin eget tortor rrimis in faucibus orci luctus et ultrices posuere cubilia Curae; Donec velit neque, auctor sit amet aliquam vel, ullamcorper sit amet ligula. Cras ultricies ligula sed magna dictum porta. Curabitur arcu erat, accumsan id imperdiet et, porttitor at sem. Proin eget tortor rrimis in faucibus orci luctus et ultrices posuere cubilia Curae; Donec velit neque, aucet ultrices posuere cubilia Curae; Donec velit neque, auctor sit amet aliquam vel, ullamcorper sit amet ligula. Cras ultricies ligula sed magna dictum porta. Curabitur arcu erat, accumsan id imperdiet et, porttitor at sem. Proin eget tortor risurimis in faucibus orci luctus et ultrices posuere cubilia Curae; Donec velit neque, auctor sit amet aliquam vel, ullamcorper sit amet ligula. Cras ultricies ligula sed magna dictum porta. Curabitur arcu erat, accumsan id imperdiet et, porttitor at sem. Proin eget tortor rrimis in faucibus orci luctus et ultrices posuere cubilia Curae; Donec velit neque, auctor sit amet aliquam vel, ullamcorper sit amet ligula. Cras ultricies ligula sed magna dictum porta. Curabitur arcu erat, accumsan id imperdiet et, porttitor at sem. Proin eget tortor rrimis in faucibus orci luctus et ultrices posuere cubilia Curae; Donec velit neque, auctor sit amet aliquam vel, ullamcorper sit amet ligula. Cras ultricies ligula sed magna dictum porta. Curabitur arcu erat, accumsan id imperdiet et, porttitor at sem. Proin eget tortor rrimis in faucibus orci luctus et ultrices posuere cubilia Curae; Donec velit neque, auctor sit amet aliquam vel, ullamcorper sit amet ligula. Cras ultricies ligula sed magna dictum porta. Curabitur arcu erat, accumsan id imperdiet et, porttitor at sem. Proin eget tortor rrimis in faucibus orci luctus et ultrices posuere cubilia Curae; Donec velit neque, auctor sit amet aliquam vel, ullamcorper sit amet ligula. Cras ultricies ligula sed magna dictum porta. Curabitur arcu erat, accumsan id imperdiet et, porttitor at sem. Proin eget tortor rrimis in faucibus orci luctus et ultrices posuere cubilia Curae; Donec velit neque, aucet ultrices posuere cubilia Curae; Donec velit neque, auctor sit amet aliquam vel, ullamcorper sit amet ligula. Cras ultricies ligula sed magna dictum porta. Curabitur arcu erat, accumsan id imperdiet et, porttitor at sem. Proin eget tortor risurimis in faucibus orci luctus et ultrices posuere cubilia Curae; Donec velit neque, auctor sit amet aliquam vel, ullamcorper sit amet ligula. Cras ultricies ligula sed magna dictum porta. Curabitur arcu erat, accumsan id imperdiet et, porttitor at sem. Proin eget tortor rrimis in faucibus orci luctus et ultrices posuere cubilia Curae; Donec velit neque, auctor sit amet aliquam vel, ullamcorper sit amet ligula. Cras ultricies ligula sed magna dictum porta. Curabitur arcu erat, accumsan id imperdiet et, porttitor at sem. Proin eget tortor rrimis in faucibus orci luctus et ultrices posuere cubilia Curae; Donec velit neque, auctor sit amet aliquam vel, ullamcorper sit amet ligula. Cras ultricies ligula sed magna dictum porta. Curabitur arcu erat, accumsan id imperdiet et, porttitor at sem. Proin eget tortor rrimis in faucibus orci luctus et ultrices posuere cubilia Curae; Donec velit neque, auctor sit amet aliquam vel, ullamcorper sit amet ligula. `
/* data.content.push({
    columns: [
      {
        // auto-sized columns have their widths based on their content
        width: 'auto',
        text: longtxt},
      {
        // star-sized columns fill the remaining space
        // if there's more than one star-column, available width is divided equally
        width: '*',
        text: longtxt
      }
    ],
    props:{main:true},
    // optional space between columns
    columnGap: 10
  })
  data.content.push({
    // to treat a paragraph as a bulleted list, set an array of items under the ul key
    ul: [
      longtxt,
      longtxt,
      longtxt,
      { text: longtxt, bold: true },
    ],
    props:{main:true},
  },
  longtxt,
  {
    // for numbered lists set the ol key
    ol: [
      longtxt,
      longtxt,
      longtxt
    ],
    props:{main:true},
  }) */
  data.pdfSettings = pdfSettings
  //let svg = MathJax.tex2svg('Finally, while display equations look good for a page of samples, the ability to mix math and text in a paragraph is also important. This expression \(\sqrt{3x-1}+(1+x)^2\) is an example of an inline equation.  As you see, MathJax equations can be used this way as well, without unduly disturbing the spacing between lines.\\frac{1}{x^2-1}', {display: true});
  //dd.content[3].svg = svg;
  return pdfMake.createPdf(data).pdfDocumentPromise;
};


