/* eslint-disable prettier/prettier */
const { debug } = require('console');
const {schema,PMDOMSerializer} = require('../../Schema/index');
const { nodes } = require('../../Schema/nodes');
let data = {
  pageMargins: [0, 0, 0, 0],
  content: [],
  images:{
  }
}

function getTableWidths(tableHtmlElement){
  let tableFullWidth;
  let columnsWidths= []
  Array.from(tableHtmlElement.childNodes[0].childNodes[0].attributes).forEach((attr)=>{
    if(attr.name == 'tablewidth'){
      tableFullWidth = +attr.value;
    }
  })
  Array.from(tableHtmlElement.childNodes[0].childNodes[0].childNodes).forEach((cell,i)=>{
    Array.from(cell.attributes).forEach((attr)=>{
      if(attr.name=='data-colwidth'||attr.name == 'tablewidth'){
        columnsWidths[i] = +attr.value
      }
      if(columnsWidths[i] == undefined){
        columnsWidths[i] = 0;
      }
    })
  })
  let widths = [];
  if(tableFullWidth>0){
    columnsWidths.forEach((width)=>{
      if(width>0){
        widths.push(((width/tableFullWidth)*100).toFixed(0)+'%');
      }else{
        widths.push('*');
      }
    })
  }else{
    columnsWidths.forEach((width)=>{
      widths.push('*')
    })
  }
  return widths
}

var pageDimensionsInPT = {
  '4A0': [4767.87, 6740.79],
  '2A0': [3370.39, 4767.87],
  A0: [2383.94, 3370.39],
  A1: [1683.78, 2383.94],
  A2: [1190.55, 1683.78],
  A3: [841.89, 1190.55],
  A4: [595.28, 841.89],
  A5: [419.53, 595.28],
  A6: [297.64, 419.53],
  A7: [209.76, 297.64],
  A8: [147.40, 209.76],
  A9: [104.88, 147.40],
  A10: [73.70, 104.88],
  B0: [2834.65, 4008.19],
  B1: [2004.09, 2834.65],
  B2: [1417.32, 2004.09],
  B3: [1000.63, 1417.32],
  B4: [708.66, 1000.63],
  B5: [498.90, 708.66],
  B6: [354.33, 498.90],
  B7: [249.45, 354.33],
  B8: [175.75, 249.45],
  B9: [124.72, 175.75],
  B10: [87.87, 124.72],
  C0: [2599.37, 3676.54],
  C1: [1836.85, 2599.37],
  C2: [1298.27, 1836.85],
  C3: [918.43, 1298.27],
  C4: [649.13, 918.43],
  C5: [459.21, 649.13],
  C6: [323.15, 459.21],
  C7: [229.61, 323.15],
  C8: [161.57, 229.61],
  C9: [113.39, 161.57],
  C10: [79.37, 113.39],
  RA0: [2437.80, 3458.27],
  RA1: [1729.13, 2437.80],
  RA2: [1218.90, 1729.13],
  RA3: [864.57, 1218.90],
  RA4: [609.45, 864.57],
  SRA0: [2551.18, 3628.35],
  SRA1: [1814.17, 2551.18],
  SRA2: [1275.59, 1814.17],
  SRA3: [907.09, 1275.59],
  SRA4: [637.80, 907.09],
  EXECUTIVE: [521.86, 756.00],
  FOLIO: [612.00, 936.00],
  LEGAL: [612.00, 1008.00],
  LETTER: [612.00, 792.00],
  TABLOID: [792.00, 1224.00]
};
exports.pageDimensionsInPT = pageDimensionsInPT

function isNumeric(str) {
  if (typeof str != "string") return false // we only process strings!
  //@ts-ignore
  return !isNaN(str) && // use type coercion to parse the _entirety_ of the string (`parseFloat` alone does not do this)...
    !isNaN(parseFloat(str)) // ...and ensure strings of whitespace fail
}
exports.isNumeric = isNumeric
function mmToPx(mm) {
  return mm * 3.7795275591;
}
function pxToPt(px) {
  return px * 0.75;
}
function ptToPx(pt) {
  return pt / 0.75;
}
function componentToHex(c) {
  var hex = c.toString(16);
  return hex.length === 1 ? "0" + hex : hex;
}
function rgbToHex(r, g, b, f) {
  if (!r && !g && !b) {
    return undefined
  }
  return "#" + componentToHex(r) + componentToHex(g) + componentToHex(b)
}

exports.pdfmakeJSONparser = class pdfmakeJSONparser {

  elements = []
  importantLeafNodes = [
    'h1', 'h2', 'h3', 'h4', 'h5', 'h6',
    'p',
    'table',
    'br',
    'img',
    'block-figure',
    'block-table',
    'ol',
    'ul',
    'math-display',
    'page-break',
    'form-field-inline-view',
    'form-field-inline',
    'end-notes-nodes-container',
    'supplementary-files-nodes-container'
  ];

/*   @ViewChild('elementsContainer', { read: ElementRef }) elementsContainer;
  @ViewChild('headerPMEditor', { read: ElementRef }) headerPMEditor;
  @ViewChild('footerPMEditor', { read: ElementRef }) footerPMEditor; */

  pageSize = 'A4';
  data
  pdfFunctions = {}
  pdfMetaData = {}
  pageMarg = [72, 72, 72, 72];

  headerPmContainer

  footerPmContainer

  constructor(
    ydocData
  ) {
    this.data = data;
    this.ydocData = ydocData
  }

  fillElementsArray() {
    let firstlevelElements = [];

    const elements = this.ydocData.sectionPMNodesJson;
    const flatSections = this.ydocData.articleSectionsStructureFlat;
    Object.keys(elements).forEach((sectionId)=>{
      const pmJson = elements[sectionId];

      const sectionKey = flatSections.findIndex(s => s.sectionID === sectionId);
      const sectionName = flatSections[sectionKey]? flatSections[sectionKey].title.name : sectionId;
      let node = schema.nodeFromJSON(pmJson);
      let editorDom = document.createElement('div')
      editorDom.className = 'ProseMirror-example-setup-style';
      editorDom.setAttribute('section-name',sectionName)

      node.content.content.forEach(ch=>{
        let chdom = PMDOMSerializer.serializeNode(ch);
        editorDom.appendChild(chdom);
      })
      firstlevelElements.push(editorDom);
    });

    this.elements = []
    let loopChildren = (element,section) => {
      if (element instanceof HTMLElement && element.tagName) {
        let elTag = element.tagName.toLocaleLowerCase();
        if (this.importantLeafNodes.includes(elTag)) {
          this.elements.push(element)
        } else if (element.childNodes.length > 0) {
          element.childNodes.forEach((child) => {
            loopChildren(child);
          })
        }
      }
    }
    let domels = firstlevelElements
    Object.keys(domels).forEach((secid)=>{
      let secDom = domels[secid];
      if(secDom.childNodes) {
        let children = Array.from(secDom.childNodes);
        children.forEach((ch) => {
          loopChildren(ch);
        })
      }
    })
  }

  /* __fillElementsArray() {
    this.elements = []
    let loopChildren = (element,section) => {
      if (element instanceof HTMLElement && element.tagName) {
        let elTag = element.tagName.toLocaleLowerCase();
        if (this.importantLeafNodes.includes(elTag)) {
          this.elements.push(element)
        } else if (element.childNodes.length > 0) {
          element.childNodes.forEach((child) => {
            loopChildren(child);
          })
        }
      }
    }
    let domels = this.ydocData.sectionPMNodesDomEls
    Object.keys(domels).forEach((secid)=>{
      let secDom = domels[secid];
      if(secDom.childNodes) {
        let children = Array.from(secDom.childNodes);
        children.forEach((ch) => {
          loopChildren(ch);
        })
      }
    })

  } */

  bindHTML(div, html) {
    div.innerHTML = html
  }
  tablepadding = 6;

  // [left, top, right, bottom]

  pdfSettingsSave = {
    "nodes": {
      "h1": {
        "marginTop": 10,
        "marginBottom": 10,
        "fontSize": 20,
        "lineHeight": 1.3
      },
      "h2": {
        "marginTop": 20,
        "marginBottom": 10,
        "fontSize": 15
      },
      "h3": {
        "marginTop": 15,
        "marginBottom": 10,
        "fontSize": 12
      },
      "h4": {
        "marginTop": 12,
        "marginBottom": 8,
        "fontSize": 11
      },
      "h5": {
        "marginTop": 9,
        "marginBottom": 6,
        "fontSize": 10
      },
      "h6": {
        "marginTop": 6,
        "marginBottom": 4,
        "fontSize": 9
      },
      "p": {
        "marginTop": 2,
        "marginBottom": 5,
        "lineHeight": 1.2,
        "fontSize": 9
      },
      "table": {
        "marginTop": 5,
        "marginBottom": 10
      },
      "tableLabel": {
        "fontSize": 8,
        "marginTop": 3.5,
        "marginbottom": 3.5
      },
      "tableHeader": {
        "fontSize": 7.5,
        "marginTop": 3.5,
        "marginbottom": 3.5
      },
      "tableContent": {
        "fontSize": 7,
        "marginTop": 3,
        "marginbottom": 3,
        "marginRight": 2,
        "marginLeft": 2
      },
      "tableFooter": {
        "fontSize": 7.5,
        "marginTop": 3.5,
        "marginbottom": 3.5
      },
      "figureHeader": {
        "fontSize": 8,
        "marginTop": 2
      },
      "figureContent": {
        "fontSize": 7
      },
      "block-figure": {
        "marginTop": 10,
        "marginBottom": 10
      },
      "authorsSection": {
        "fontSize": 7
      },
      "corespondentAuthors": {
        "fontSize": 6
      },
      "ol": {
        "marginTop": 5,
        "marginBottom": 10,
        "fontSize": 9
      },
      "ul": {
        "marginTop": 5,
        "marginBottom": 10,
        "fontSize": 9
      },
      "math-display": {
        "marginTop": 10,
        "marginBottom": 10
      },
      "form-field": {
        "marginTop": 5,
        "marginBottom": 5,
        "fontSize": 9
      },
      "br": {
        "marginTop": 2,
        "marginBottom": 2
      },
      "form-field-inline": {
        "marginTop": 2,
        "marginBottom": 2,
        "fontSize": 11
      },
      "block-table": {
        "marginTop": 5,
        "marginBottom": 5
      },
      "reference-citation-end": {
        "marginLeft": 10
      }
    },
    "maxFiguresImagesDownscale": "80%",
    "maxMathDownscale": "80%",
    "pageMargins": {
      "marginTop": 72,
      "marginRight": 72,
      "marginBottom": 72,
      "marginLeft": 72
    },
    "pageFormat": {
      "A2": false,
      "A3": false,
      "A4": true,
      "A5": false
    },
    "minParagraphLinesAtEndOfPage": 1,
    "header": {
      "marginTop": 20,
      "marginBottom": 15,
      "fontSize": 7
    },
    "footer": {
      "marginTop": 15,
      "marginBottom": 15,
      "fontSize": 7
    }
  }

  mathObj = {};

  fillSettings() {
    return this.ydocData.pdfSettings;
  }

  refreshContent = async () => {
    try {
      this.fillElementsArray()
      this.pageMarg = [];
      
      let pdfSettings = this.fillSettings()

      let margings = pdfSettings.pdf.pageMargins;
      this.pageMarg = [
        +margings.marginTop,
        +margings.marginRight,
        +margings.marginBottom,
        +margings.marginLeft,
      ]
      this.pageSize = pdfSettings.pdf.pageFormat;

      //elementsContainerElements.append(...this.elements)

      let pageFullWidth = pageDimensionsInPT[this.pageSize][0]  // in pt
      let pageWidth = ptToPx(pageFullWidth) - this.pageMarg[1] - this.pageMarg[3];

      let tablePadding = this.tablepadding;
      let pageInPoints = pxToPt(pageWidth);
      let singleimgOnRowWidth = pageInPoints - (tablePadding * 2);
      let threeImgOnRowWidth = (pageInPoints * 0.6) - (tablePadding * 2);
      let fourImgOnRowWidth = (pageInPoints * 0.4) - (tablePadding * 2);

      this.data.pageMargins = [pxToPt(this.pageMarg[0]), pxToPt(this.pageMarg[1]), pxToPt(this.pageMarg[2]), pxToPt(this.pageMarg[3])];

      let ImagesByKeys = {}

      let generateFigure = async (element, style) => {
        let figuresObj = this.ydocData.ArticleFigures
        let figureID = element.getAttribute('figure_id');
        let figureTable = {
          color: 'black',
          margin: style.margin || [],
          layout: {
            paddingBottom: function paddingBottom(i, node) {
              return 0;
            },
            hLineWidth: function hLineWidth(i) {
              return 0;
            },
            vLineWidth: function vLineWidth(i) {
              return 0;
            },
          },
          table: {
            headerRows: 1,
            dontBreakRows: true,
            keepWithHeaderRows: 1,
            body: [],
            widths: '*',
            props: {type: 'figure', main: true}
          },
          props: {type: 'figure-container'},
          tableType: 'figureContainer',
          alingment: 'center',
        }
        let figuresCount = element.firstChild?.childNodes.length;
        let figuresDescriptions = element.childNodes.item(1);

        let figureHeader = figuresDescriptions.childNodes.item(0)
        let figureDesc = figuresDescriptions.childNodes.item(1)
        let figureLabel = []
        for (let j = 0; j < figureHeader.childNodes.length; j++) {
          let label = await generatePDFData(figureHeader.childNodes[j], figureTable, {parentWidth: pageWidth, ...style}, element);
          let styles = pdfSettings.nodes?.['figureHeader'];
          if(styles?.fontSize) {
            label.fontSize = +styles.fontSize - 0.5;
          } else {
            label.fontSize = 8;
          }
          label.margin = [styles?.marginLeft || 0, styles?.marginTop || 2, styles?.marginRight || 0, styles?.marginBottom || 0];
          figureLabel.push(label)
        }
        let figureDescription = document.createElement('form-field');

        let styles = pdfSettings.nodes?.['figureContent'];
        figureDescription.style.fontSize = ptToPx(styles?.fontSize || 8) + 'px'

        element.parentElement?.append(figureDescription)
        let moveNodeInlineChildren = (node, containerNode) => {
          let findParagraphChild = (node, container) => {
            if (node.tagName == 'P') {
              if (container.lastChild && container.lastChild.tagName && container.lastChild.tagName == "P") {
                container.lastChild.append(...Array.from(node.childNodes).map((n) => {
                  return (n).cloneNode(true)
                }));
              } else {
                container.append(document.createElement('p'))
                container.lastChild.append(...Array.from(node.childNodes).map((n) => {
                  return (n).cloneNode(true)
                }));
              }
            } else if (node.tagName == 'MATH-DISPLAY') {
              container.append(node)
            } else {
              node.childNodes.forEach((ch) => {
                findParagraphChild(ch, container);
              })
            }
          }
          findParagraphChild(node, containerNode);
        }
        for (let j = 0; j < figureDesc.childNodes.length; j++) {
          let descEl = figureDesc.childNodes[j]
          moveNodeInlineChildren(descEl, figureDescription);
        }
        let separatorSymbols = ['.', ',', '/', ':', ';', '!', '?']
        let descriptions = [];
        let checkNextTextNodeAndSpace = (node) => {
          if (!(node instanceof Text)) {
            if (node.childNodes && node.childNodes.length > 0) {
              checkNextTextNodeAndSpace(node.childNodes[0])
            }
          } else {
            if (!node.textContent?.startsWith(" ")) {
              node.textContent = " " + node.textContent
            }
          }
        }
        let indexes = [];
        for (let i = 0; i < figuresCount; i++) {
          let descText = (figuresDescriptions.childNodes.item(i + 2));
          let description = [];
          for (let j = 1; j < descText.childNodes.length; j++) {
            let descEl = descText.childNodes[j]
            if (figuresCount > 1) {
              let separator
              let lastSymbol = figureDescription.childNodes[figureDescription.childNodes.length - 1].textContent[figureDescription.childNodes[figureDescription.childNodes.length - 1].textContent.length - 1];
              indexes.push(String.fromCharCode(65 + i))
              if (separatorSymbols.includes(lastSymbol)) {
                //strong.textContent = "&#032;" + String.fromCharCode(65 + i) + "&#032;";
                separator = document.createElement('strong');
                separator.textContent = " " + String.fromCharCode(65 + i);
              } else {
                //strong.textContent = "&#032;;&#032;" + String.fromCharCode(65 + i) + "&#032;";
                separator = document.createElement('strong');
                separator.textContent = "; " + String.fromCharCode(65 + i);
              }
              //strong.style.fontSize = ptToPx(5) + 'px'
              if (figureDescription.lastChild && figureDescription.lastChild.tagName && figureDescription.lastChild.tagName == "P") {
                //figureDescription.lastChild.append(document.createTextNode("; " + String.fromCharCode(65 + i) + " "))
                figureDescription.lastChild.append(separator)
              } else {
                figureDescription.append(document.createElement('p'));
                //figureDescription.lastChild.append(document.createTextNode("; " + String.fromCharCode(65 + i) + " "))
                figureDescription.lastChild.append(document.createTextNode(String.fromCharCode(65 + i)))

              }
              checkNextTextNodeAndSpace(descEl)
            }
            moveNodeInlineChildren(descEl, figureDescription);
          }
        }

        let descriptionPDFNode = await generatePDFData(figureDescription, figureTable, {
          parentWidth: pageWidth,
          nodetype: 'figure-container', ...style
        }, element);
        descriptionPDFNode.stack[0].fontSize = styles?.fontSize || 8;
        descriptionPDFNode.lineHeight = styles?.lineHeight || 1.3;
        // descriptionPDFNode.fontSize = 5;
        descriptionPDFNode.alignment = 'justify'
        let bottomTable = {
          margin: [0, 0, 0, 0],
          table: {
            dontBreakRows: true,
            widths: ['*'],
            body: [
              [{
                fillColor: '#fafaf8',
                borderColor: ['#e2e2dc', '#e2e2dc', '#e2e2dc', '#e2e2dc'],
                stack: [{stack: [...figureLabel]/* , margin: 4 */}, {stack: [descriptionPDFNode]/* , margin: 4 */}, ...descriptions]
              }]
            ]
          }
        }
        let imageWidth = singleimgOnRowWidth;

        let imageRectangle = figuresObj[figureID].canvasData.a4Pixels

        let a4Rectangle = pageDimensionsInPT['A4']

        let imageA4Rectangle = [a4Rectangle[0] - (tablePadding * 2)];

        element.parentElement?.removeChild(figureDescription)

        imageA4Rectangle[1] = (imageRectangle[1] / imageRectangle[0]) * a4Rectangle[0]
        if (imageA4Rectangle[0] > pxToPt(pageWidth)) {
          imageA4Rectangle[0] = pxToPt(pageWidth) - (tablePadding * 2);
          imageA4Rectangle[1] = (imageRectangle[1] / imageRectangle[0]) * imageA4Rectangle[0];
        }

        figuresObj;
        figureID;
        let figImagesData = figuresObj[figureID].canvasData
        let fullTableWidth = imageA4Rectangle[0]
        let fullTableHeight = imageA4Rectangle[0]
        let nCol = figImagesData.nOfColumns;
        let nRows = figImagesData.nOfRows;
        let widthOfCell = fullTableWidth / nCol
        let heightOfCell = fullTableHeight / nRows
        let imagesTable = {
          color: 'black',
          layout: {
            paddingBottom: function paddingBottom(i, node) {
              return 0;
            },
            paddingTop: function paddingBottom(i1, node) {
              applyVerticalAlignment(node, i1, 'center')
              return 0;
            },
            paddingRight: function paddingBottom(i, node) {
              return 0;
            },
            paddingLeft: function paddingBottom(i, node) {
              return 0;
            },
            hLineWidth: function hLineWidth(i) {
              return 0;
            },
            vLineWidth: function vLineWidth(i) {
              return 0;
            },
          },
          table: {
            dontBreakRows: true,
            body: [],
            widths: [],
          },
          width: fullTableWidth,
          props: {initProps: {}},
          tableType: 'figureImagesContainer',
          alingment: 'center',
        }
        let widthPercentage = 100 / nCol + '%';
        for (let i = 0; i < nCol; i++) {
          imagesTable.table.widths.push(widthPercentage);
        }
        for (let i = 0; i < figImagesData.figRows.length; i++) {
          let figureRow = figImagesData.figRows[i];
          let tablerow = [];
          for (let j = 0; j < nCol; j++) {
            if (figureRow[j]) {
              let cel = figureRow[j].container
              let url = cel.pdfImgResized?cel.pdfImgResized:cel.pdfImgOrigin;
              if(!url)url = cel.url

              let imageName = url.replace(/\//gm,'q')
              if (!ImagesByKeys[imageName]) {
                ImagesByKeys[imageName] = url;
              }
              let table = {
                layout: 'noBorders',
                table: {
                  dontBreakRows: true,
                  widths: [widthOfCell, heightOfCell],
                  body: [
                    [{
                      fillColor: '#fff',
                      stack: [{text: indexes.shift(), bold: true, margin: [5, 0, 0, 0]},{image: imageName, fit: [widthOfCell, heightOfCell]}]
                    }]
                  ]
                }
              }
              tablerow.push(table)
            } else {
              tablerow.push({})
            }
          }
          imagesTable.table.body.push(tablerow);
        }

        let columns = {
          columns: [
            {width: '*', text: ''},
            imagesTable,
            {width: '*', text: ''},
          ],
          props: {}
        }


        figureTable.table.body.push([columns]);
        figureTable.table.body.push([bottomTable])
        return Promise.resolve(figureTable);

      }

      let generateCitableTable = async (element, style) => {
        let vLineWidthPT = 1
        let leftRightPadd = 5;
        let topBottomPadd = 5;
        let leftRightPaddFunc = () => {
          return leftRightPadd
        }
        let topBottomPaddFunc = () => {
          return topBottomPadd
        }
        let citableTable = {
          color: 'black',
          margin: style.margin || [],
          layout: {
            paddingBottom: topBottomPaddFunc,
            paddingTop: topBottomPaddFunc,
            paddingRight: leftRightPaddFunc,
            paddingLeft: leftRightPaddFunc,
            hLineWidth: (i) => {
              return vLineWidthPT;
            },
            vLineWidth: (i) => {
              return vLineWidthPT;
            },
          },
          table: {
            headerRows: 1,
            dontBreakRows: true,
            keepWithHeaderRows: 1,
            body: [],
            widths: '*',
            props: {type: 'citable-table', main: true}
          },
          pageBreak: 'before',
          props: {type: 'citable-table-container'},
          tableType: 'citableTalbeContainer',
          alingment: 'center',
        };

        let tableLabel = pdfSettings.nodes?.['tableLabel'];
        let tableContent = pdfSettings.nodes?.['tableContent'];
        let tableFooter = pdfSettings.nodes?.['tableFooter'];
        let tableHeader = pdfSettings.nodes?.['tableHeader'];
        style.parentHasMargin = true;
        // let tablesObj = this.ydocData.ArticleTables;
        
        //let table_id = element.getAttribute('table_id');
        //let table_number = element.getAttribute('table_number');
        let tableParrElChilds = Array.from(element.childNodes);
        let labelElementPDF = await generatePDFData(tableParrElChilds[0], citableTable, {parentWidth: pageWidth - 2 * leftRightPadd - 2 * vLineWidthPT, ...style})
        labelElementPDF.stack[0].stack[0]
        labelElementPDF.stack[0].stack[0].bold = false;
        labelElementPDF.stack[0]?.stack[0]?.bold = false;
        labelElementPDF.stack[0]?.stack[0]?.fontSize = tableLabel?.fontSize || 8;
        labelElementPDF.stack[0]?.stack[0]?.stack[0]?.fontSize = tableLabel?.fontSize || 8;
        labelElementPDF.stack[0].props?.type = '';
        let headerNodesPDF = []
        debugger
        labelElementPDF.stack[1]?.fontSize = tableHeader?.fontSize || 7;
        labelElementPDF.stack[1]?.stack[0]?.fontSize = tableHeader?.fontSize || 7;
        labelElementPDF.stack[1]?.margin = [tableHeader?.marginLeft || 0, tableHeader?.marginTop || 3.5, tableHeader?.marginRight || 0, tableHeader?.marginBottom || 3.5];
        headerNodesPDF.push(labelElementPDF.stack[1])
        
        let contentNodes = Array.from(Array.from(tableParrElChilds[1].childNodes)[0].childNodes)
        let contentNodesPDF = []
        for (let i = 0; i < contentNodes.length; i++) {
          let nodeToPdfJSON = await generatePDFData(contentNodes[i], citableTable, {parentWidth: pageWidth - 2 * leftRightPadd - 2 * vLineWidthPT, ...style});
          contentNodesPDF.push(nodeToPdfJSON)
        }
        let footerNodes = Array.from(Array.from(tableParrElChilds[2].childNodes)[0].childNodes)
        let footerNodesPDF = []
        for (let i = 0; i < footerNodes.length; i++) {
          let nodeToPdfJSON = await generatePDFData(footerNodes[i], citableTable, {parentWidth: pageWidth - 2 * leftRightPadd - 2 * vLineWidthPT, ...style});
          nodeToPdfJSON.fontSize = tableFooter?.fontSize || 7;
          nodeToPdfJSON.margin = [tableFooter?.marginLeft || 0, tableFooter?.marginTop || 3.5, tableFooter?.marginRight || 0, tableFooter?.marginBottom || 3.5];
          footerNodesPDF.push(nodeToPdfJSON)
        }

        let LabelStack = {
          fillColor: '#fafaf8',
          borderColor: ['#e2e2dc', '#e2e2dc', '#e2e2dc', '#e2e2dc'],
          margin: [tableHeader?.marginLeft || 0, tableHeader?.marginTop || 3.5, tableHeader?.marginRight || 0, tableHeader?.marginBottom || 3.5],
          stack: [labelElementPDF.stack[0]]
        }
        let HeaderStack = {
          fillColor: '#fafaf8',
          borderColor: ['#e2e2dc', '#e2e2dc', '#e2e2dc', '#e2e2dc'],
          stack: headerNodesPDF
        }
        let ContentStack = {
          fillColor: '#fafaf8',
          borderColor: ['#e2e2dc', '#e2e2dc', '#e2e2dc', '#e2e2dc'],
          margin: [-6, -6, -6, -6],
          stack: contentNodesPDF
        }
        let FooterStack = {
          fillColor: '#fafaf8',
          margin: [tableFooter?.marginLeft || 0, tableFooter?.marginTop || 3.5, tableFooter?.marginRight || 0, tableFooter?.marginBottom || 3.5],
          borderColor: ['#e2e2dc', '#e2e2dc', '#e2e2dc', '#e2e2dc'],
          stack: footerNodesPDF
        }
        // let tableElement = tablesObj[table_id];
        let loopNode = (node) => {
          if (node.body) {      
            for (let i = 0; i < node.body.length; i++) {
              let row = node.body[i];
              for (let j = 0; j < row.length; j++) {
                let cell = row[j];
                cell.fillColor = 'white';
                cell.stack[0].stack[0].fontSize = tableContent?.fontSize || 7;
                cell.borderColor = ['#e2e2dc', '#e2e2dc', '#e2e2dc', '#e2e2dc'];
              }
            }
          } else if (node instanceof Array) {
            for (let i = 0; i < node.length; i++) {
              loopNode(node[i])
            }
          } else if (typeof node == 'object' && Object.keys(node).length > 0) {
            Object.keys(node).forEach((key) => {
              loopNode(node[key]);
            })
          }
        }

        loopNode(ContentStack)

        citableTable.table.body = [
          [
            LabelStack
          ],
          [HeaderStack],
          [ContentStack],
          [FooterStack],
        ]
        return Promise.resolve(citableTable);
      }

      let attachStylesToNode = (
        node,
        nodeStyles,
        parentStyle,
        element,
        appendParentStyles,
        parentElement,
        provideTag) => {
        let tag = element.tagName.toLocaleLowerCase()

        if (provideTag !== '') {
          tag = provideTag
        }
        if (parentStyle && parentStyle.parentWidth) {
          nodeStyles.parentWidth = parentStyle.parentWidth
        }
        if (parentStyle && !parentStyle.parentHasMargin && pdfSettings.nodes[tag]) {
          let nS = pdfSettings.nodes[tag] // node settings
          if(node.margin) {
            node.margin[1] = nS.marginTop;
            node.margin[3] = nS.marginBottom;
          } else {
            let margin = [0, nS.marginTop, 0, nS.marginBottom];
            node.margin = margin;
          }
          /* if(nS.fontSize !=='auto'){
            let fontSize = +nS.fontSize;
            nodeStyles.fontSize = fontSize;
          } */
          nodeStyles.parentHasMargin = true;
          node.lineHeight = nS.lineHeight;
        }
        if (parentStyle && parentStyle.parentHasMargin) {
          nodeStyles.parentHasMargin = true;
        }
        if (parentStyle && appendParentStyles) {
          Object.keys(parentStyle).forEach((key) => {
            if (!nodeStyles[key] &&
              key !== 'text' &&
              key !== 'stack' &&
              key !== 'table' &&
              key !== 'columns' &&
              key !== 'margin' &&
              key !== 'image'
            ) {
              nodeStyles[key] = parentStyle[key];
            }
          })
        }
        if (
          parentElement &&
          parentStyle &&
          parentStyle.parentHasMargin &&
          pdfSettings.nodes[tag]
        ) {
          let parrChArr = Array.from(parentElement.childNodes)
          let parrChLength = parrChArr.length;
          let childIndex = parrChArr.indexOf(element);
          if (parrChLength > 1) {
            let nS = pdfSettings.nodes[tag] // node settings
            let margin
            if (childIndex == 0) {
              margin = [0, 0, 0, nS.marginBottom || 0];
            } else if (childIndex == parrChLength - 1) {
              margin = [0, nS.marginTop || 0, 0, 0];
            } else {
              margin = [0, nS.marginTop || 0, 0, nS.marginBottom || 0];
            }
            if(nS.marginLeft) {
              margin[0] = nS.marginLeft;
            }
            if(nS.marginRight) {
              margin[0] = nS.marginRight;
            }
            if(node.margin) {
              node.margin[1] = margin[1];
              node.margin[3] = margin[3];
            } else {
              node.margin = margin;
            }
            
            nodeStyles.parentHasMargin = true;
          }
        }
        if (parentStyle.dontApplyAnyMargin) {
          nodeStyles.dontApplyAnyMargin = true;
          nodeStyles.margin = [0, 0, 0, 0]
        }
        Object.assign(node, nodeStyles);
        let nS = pdfSettings.nodes[tag]
        if (nS && nS.fontSize && nS.fontSize !== 'auto') {
          let fontSize = +nS.fontSize;
          node.fontSize = fontSize;
          nodeStyles.fontSize = fontSize;
        }
        if (parentElement &&/* nS&&nS.fontSize&& */
          pdfSettings.nodes[parentElement?.tagName.toLocaleLowerCase()] && parentStyle &&
          typeof parentStyle.fontSize == 'number' &&
          typeof node.fontSize == 'number') {
          if (pdfSettings.nodes[parentElement?.tagName.toLocaleLowerCase()].fontSize !== 'auto') {
            node.fontSize = parentStyle.fontSize;
          }
        }
        if(tag == "strong" || tag == "u" || element.className == 'taxon') {
          node.fontSize = undefined
        }
      }
     

      let loopNodeChildrenAndRunFunc = async (element, whenTagEquals, func) => {
        let tag = element.tagName ? element.tagName.toLocaleLowerCase() : undefined;
        if (tag && ((typeof whenTagEquals == "string" && whenTagEquals == tag) || (whenTagEquals instanceof Array && whenTagEquals.includes(tag)))) {
          await func(element)
        }
        if (element.childNodes.length > 0) {
          let ch = Array.from(element.childNodes);
          for (let i = 0; i < ch.length; i++) {
            let child = ch[i];
            await loopNodeChildrenAndRunFunc(child, whenTagEquals, func);
          }
        }
        return Promise.resolve(true)
      }

      let headerCh = []
      let footerCh = []
      let headernode = schema.nodeFromJSON(this.ydocData.headerPmNodesJson);
      headernode.content.content.forEach(ch => {
        let chdom = PMDOMSerializer.serializeNode(ch);
        headerCh.push(chdom);
      })
      let footernode = schema.nodeFromJSON(this.ydocData.footerPmNodesJson);
      footernode.content.content.forEach(ch => {
        let chdom = PMDOMSerializer.serializeNode(ch);
        footerCh.push(chdom);
      })

      let generatePDFData = async (element, parentPDFel, parentStyle, parentElement) => {
        let defaultView = (element.ownerDocument || document).defaultView

        let tag = element.tagName.toLocaleLowerCase()
        if (
          tag == 'p' || tag == 'h1' || tag == 'h2' || tag == 'h3' || tag == 'h4' || tag == 'h5' ||
          tag == 'h6' || tag == 'span' || tag == 'strong' || tag == 'sub' || tag == 'sup' ||
          tag == 'code' || tag == 'citation' || tag == 'table-citation' || tag == 'supplementary-file-citation' || tag == 'end-note-citation' ||
          tag == 'u' || tag == 'em' || tag == 'form-field' ||
          tag == 'form-field-inline' || tag == 'form-field-inline-view' || tag == 'reference-citation' ||
          tag == 'reference-citation-end'
        ) {
          if (
            (tag == 'span' && element.classList.contains('ProseMirror__placeholder')) ||
            (tag == 'span' && element.className.includes('ProseMirror-yjs-cursor')) ||
            (tag == 'span' && element.className.includes('ProseMirror-yjs-cursor-inner-div'))
          ) {
            return Promise.resolve({text: ''})
          }
          let newEl = {}
          if(element && element.className == 'taxon') {
            newEl.italics = true;
          }
          let textStyles = this.getTextStyles(defaultView.getComputedStyle(element, null), element, parentStyle);

          attachStylesToNode(newEl, textStyles, parentStyle, element, true, parentElement, '')

          if (element.childNodes.length == 1 && element.childNodes[0] instanceof Text) {
            newEl.text = element.childNodes[0].textContent;
            //Object.assign(newEl, textStyles)
          } else if ((element.childNodes.length > 1 &&
            (
              tag == 'h1' ||
              tag == 'h2' ||
              tag == 'h3' ||
              tag == 'h4' ||
              tag == 'h5' ||
              tag == 'h6' ||
              tag == 'form-field'
            )) || (element.childNodes.length == 1 && (
            tag == 'h1' ||
            tag == 'h2' ||
            tag == 'h3' ||
            tag == 'h4' ||
            tag == 'h5' ||
            tag == 'h6' ||
            tag == 'form-field'
          ))) {
            let children = element.childNodes;


            for (let i = 0; i < children.length; i++) {
              let node = children[i];
              let n
              if (node instanceof Text) {
                n = node.textContent
              } else if (node instanceof Element) {
                n = await generatePDFData(node, newEl, textStyles, element)
              }
              if (!newEl.stack) {
                newEl.stack = [];
              }
              newEl.stack.push(n);
            }

            //Object.assign(newEl, textStyles)
          } else {
            //serch for inline img , math , video or svg node;
            let inlineBreakableNodes = ['img', 'video', 'svg', 'math-inline'];
            let elementHasLBN = false
            let serchNodes = (el) => {
              if (el.tagName) {
                let eltag = el.tagName.toLocaleLowerCase()
                if (inlineBreakableNodes.includes(eltag)) {
                  elementHasLBN = true
                }
              }
              if (el.childNodes.length > 0) {
                el.childNodes.forEach((child) => {
                  serchNodes(child);
                })
              }
            }
            serchNodes(element);

            if (!newEl.text) {
              newEl.text = [];
            }
            let children = element.childNodes;
            for (let i = 0; i < children.length; i++) {
              let node = children[i];
              let n
              if (node instanceof Text) {
                n = node.textContent
              } else if (node instanceof Element) {
                n = await generatePDFData(node, newEl, textStyles, element)
              }
              newEl.text.push(n);
            }
            //Object.assign(newEl, textStyles)
          }
          let parentElTag;
          if (parentElement) {
            parentElTag = parentElement.tagName.toLocaleLowerCase();
          }
          if ((
            tag == 'h1' ||
            tag == 'h2' ||
            tag == 'h3' ||
            tag == 'h4' ||
            tag == 'h5' ||
            tag == 'h6' ||
            tag == 'form-field')) {
            if (!newEl.props) {
              newEl.props = {};
            }
            if (!newEl.props.type) {
              newEl.props.type = 'heading';
            }
          }
          if (newEl.background == '#ffd0d0' && newEl.decoration == 'lineThrough') {
            newEl.decoration = undefined;
          }
          if (newEl.background) {
            newEl.background = undefined;
          }
          if (newEl.color) {
            newEl.color = undefined;
          }
          /* if (typeof newEl.text == 'string' && newEl.text.includes('Cited item deleted')) {
            newEl.text = '';
          } */
          if (tag == 'p') {
            if (!newEl.props) {
              newEl.props = {};
            }
            if (!newEl.props.type) {
              newEl.props.type = 'paragraph';
            }
          }
          return Promise.resolve(newEl)
        } else if (tag == 'img') {
          if (element.className == "ProseMirror-separator") {
            return Promise.resolve({text: ''});
          }
          let img = element
          
          //let dataURL = await this.getDataUrl(img)
          let url = img.src
          let urlShort = url.replace(/\//gm,'q')
          /*let dataURL = await new Promise((resolve, reject) => {
            //https://img.youtube.com/vi/GDae7zmUHlc/sddefault.jpg
            ///vi/GDae7zmUHlc/sddefault.jpg
            fetch(urlShort).then((loadedImage) => {
              return loadedImage.blob()
            }).then((blob) => {
              let reader = new FileReader()
              let saveFunc = (url, result) => {
                resolve(result)
              }
              reader.addEventListener("load", function () {
                //@ts-ignore
                saveFunc(data.imageURL, this.result);
              }, false);
              reader.readAsDataURL(blob);
            })
          })
          // get dataURL with fetch with proxy*/
          let width = img.getAttribute('width')
          let w = (width&&width.length>0)?+width:img.getBoundingClientRect().width;
          ImagesByKeys[urlShort] = url;
          let node = {
            image: urlShort,
            width: w
          };
          /* if (parentStyle && !parentStyle.parentHasMargin && margingsByTags[tag]) {
            result.margin = margingsByTags[tag]
          } */
          attachStylesToNode(node, {}, parentStyle, element, false, parentElement, '');
          return Promise.resolve(node);
        } else if (tag == 'iframe'){
          let vid = element
          let url = vid.getAttribute('thumbnail')
          if(url.length == 0){url = 'https://no.video/thubnail';}
          let urlShort = url.replace(/\//gm,'q')
          ImagesByKeys[urlShort] = url;
          let node = {
            image: urlShort,
            width: 70
          };
          attachStylesToNode(node, {}, parentStyle, element, false, parentElement, '');
          return Promise.resolve(node);
        }else if (tag == 'block-figure') {
          let figureStyling = {parentHasMargin: true};
          attachStylesToNode(figureStyling, figureStyling, parentStyle, element, false, parentElement, '');
          let pdfFigure = await generateFigure(element, figureStyling);
          return Promise.resolve(pdfFigure)
        } else if (tag == 'block-table') {
          let citableTalbeStyling = {parentHasMargin: true};
          attachStylesToNode(citableTalbeStyling, citableTalbeStyling, parentStyle, element, false, parentElement, '');
          let pdfFigure = await generateCitableTable(element, citableTalbeStyling);
          return Promise.resolve(pdfFigure)
        } else if (tag == 'table' || (tag == 'div' && element.className == 'tableWrapper')) {
          let tableElement
          if ((tag == 'div' && element.className == 'tableWrapper')) {
            tableElement = element.firstChild
          } else {
            tableElement = element
          }
          let sectionName = tableElement.getAttribute('section-name');
          /* let tableMargin = {};
          let tableTag = 'table'

          if (parentStyle && !parentStyle.parentHasMargin && margingsByTags[tableTag]) {
            tableMargin.margin = margingsByTags[tableTag]
            tableMargin.parentHasMargin = true;
          }
          if (parentStyle.parentHasMargin) {
            tableMargin.parentHasMargin = true;
          } */
          if (sectionName == 'Taxonomic coverage') {
            let tabbleCellWidth = '4.16667%'
            let tabbleCellWidthNumber = +tabbleCellWidth.replace('%', '')
            let taxonomicTable = {
              color: 'black',
              table: {
                dontBreakRows: true,
                keepWithHeaderRows: 1,
                headerRows: 1,
                widths: [],
                body: [],
                props: {type: 'taxonomicTable'}
              },
              tableType: 'taxonomicTable',
              layout: {
                paddingBottom: function paddingBottom(i, node) {
                  return 3;
                },
              },
              alingment: 'center',
            }
            attachStylesToNode(taxonomicTable, {}, parentStyle, element, false, parentElement, 'table');

            for (let i = 0; i < 24; i++) {
              taxonomicTable.table.widths.push(tabbleCellWidth)
            }
            let tbody = tableElement.getElementsByTagName('tbody').item(0);
            let tbodyCh = tbody.childNodes;
            for (let i = 0; i < tbodyCh.length; i++) {
              let el = tbodyCh[i]

              let outerWidth = parentStyle && parentStyle.parentWidth ? parentStyle.parentWidth : pageWidth

              let col1Span = 4
              let stack1 = []
              let cell1Nodes = el.childNodes.item(0).childNodes
              for (let j = 0; j < cell1Nodes.length; j++) {
                let cellnode = cell1Nodes[j];
                let val = await generatePDFData(cellnode, taxonomicTable, {parentWidth: (col1Span * tabbleCellWidthNumber) * outerWidth / 100}, tableElement)
                stack1.push(val);
              }
              let col2Span = 10
              let stack2 = []
              let cell2Nodes = el.childNodes.item(1).childNodes
              for (let j = 0; j < cell2Nodes.length; j++) {
                let cellnode = cell2Nodes[j];
                let val = await generatePDFData(cellnode, taxonomicTable, {parentWidth: (col2Span * tabbleCellWidthNumber) * outerWidth / 100}, tableElement)
                stack2.push(val);
              }
              let col3Span = 10
              let stack3 = []
              let cell3Nodes = el.childNodes.item(2).childNodes
              for (let j = 0; j < cell3Nodes.length; j++) {
                let cellnode = cell3Nodes[j];
                let val = await generatePDFData(cellnode, taxonomicTable, {parentWidth: (col3Span * tabbleCellWidthNumber) * outerWidth / 100}, tableElement)
                stack3.push(val);
              }
              taxonomicTable.table.body.push([
                {
                  stack: stack1,
                  colSpan: col1Span,
                  borderColor: ['#e2e2dc', '#e2e2dc', '#e2e2dc', '#e2e2dc'],
                }, {}, {}, {},
                {
                  stack: stack2,
                  colSpan: col2Span,
                  borderColor: ['#e2e2dc', '#e2e2dc', '#e2e2dc', '#e2e2dc'],
                }, {}, {}, {}, {}, {}, {}, {}, {}, {},
                {
                  stack: stack3,
                  colSpan: col3Span,
                  borderColor: ['#e2e2dc', '#e2e2dc', '#e2e2dc', '#e2e2dc'],
                }, {}, {}, {}, {}, {}, {}, {}, {}, {}])
            }
            return Promise.resolve(taxonomicTable)
          } else {
            let tbody = tableElement.getElementsByTagName('tbody').item(0);
            let nOfColums = tbody.childNodes.item(0).childNodes.length;
            let baseTable = {
              color: 'black',
              table: {
                dontBreakRows: true,
                keepWithHeaderRows: 1,
                headerRows: 1,
                widths: 'auto',
                body: [],
                props: {},
              },
              tableType: 'normalTable',
              layout: {
                paddingBottom: function paddingBottom(i, node) {
                  return 3;
                },
              },
              alingment: 'center',
            }
            let tableStyle = {}
            attachStylesToNode(baseTable, tableStyle, parentStyle, element, false, parentElement, 'table');


            let tabbleCellWidthNumber
            let parrentWidth = (parentStyle && parentStyle.parentWidth) ? parentStyle.parentWidth : pageWidth;
            if (parentStyle && parentStyle.parentWidth) {
              tabbleCellWidthNumber = ((1 / nOfColums) * parentStyle.parentWidth) - 6;
            } else {
              tabbleCellWidthNumber = ((1 / nOfColums) * pageWidth) - 6;
            }
            let widths = getTableWidths(tableElement);
            baseTable.table.widths = widths
            let rows = tbody.childNodes;
            for (let i = 0; i < rows.length; i++) {
              let htmlrow = rows[i];
              let row = []
              let columns = htmlrow.childNodes;
              for (let j = 0; j < columns.length; j++) {
                let cell = columns[j];
                let stack = []
                let cellNodes = cell.childNodes
                for (let k = 0; k < cellNodes.length; k++) {
                  let cellnode = cellNodes[k]

                  let val = await generatePDFData(cellnode, baseTable, {parentWidth: tabbleCellWidthNumber, ...tableStyle}, tableElement)
                  stack.push(val);
                }
                row.push({stack, borderColor: ['#e2e2dc', '#e2e2dc', '#e2e2dc', '#e2e2dc'],})
              }
              baseTable.table.body.push(row)
            }
            return Promise.resolve(baseTable)
          }
        } else if (tag == 'ul' || tag == 'ol') {
          let listTemplate = {}
          listTemplate[tag] = []
          let elChildren = element.childNodes;
          let listStyles = {}
          /*let listMargin = {}
           if (parentStyle && !parentStyle.parentHasMargin && margingsByTags[tag]) {
            listMargin.margin = margingsByTags[tag]
            listMargin.parentHasMargin = true;
          }
          if (parentStyle.parentHasMargin) {
            listMargin.parentHasMargin = true;
          }
          if (listMargin.margin) {
            listTemplate.margin = listMargin.margin;
            listMargin.margin = undefined
          } */
          attachStylesToNode(listTemplate, listStyles, parentStyle, element, false, parentElement, '');
          for (let i = 0; i < elChildren.length; i++) {
            let chnode = elChildren[i];
            let listEl = {stack: []}
            let itemNodes = chnode.childNodes;
            for (let j = 0; j < itemNodes.length; j++) {
              let nodeInItem = itemNodes[j];
              if (nodeInItem.textContent?.trim() !== '') {
                let itemWidth
                if (parentStyle && parentStyle.parentWidth) {
                  itemWidth = parentStyle.parentWidth - 50;
                } else {
                  itemWidth = pageWidth - 50;
                }
                let pdfFromNode = await generatePDFData(nodeInItem, listTemplate, {parentWidth: itemWidth, ...listStyles}, element);
                listEl.stack.push(pdfFromNode);
              }
            }
            listTemplate[tag].push(listEl);
          }

          return Promise.resolve(listTemplate);
        } else if (tag == 'br') {
          /*let brMargin = {}
         if (parentStyle && !parentStyle.parentHasMargin && margingsByTags[tag]) {
           brMargin.margin = margingsByTags[tag]
         } */
          let br = {text: ' \n'}
          attachStylesToNode(br, {}, parentStyle, element, true, parentElement, '');
          /* if (brMargin.margin) {
            br.margin = brMargin.margin
          } */
          return Promise.resolve(br)
        } else if (tag == 'a') {
          let link = {
            text: element.textContent,
            link: element.getAttribute('href'),
            color: '#1B8AAE',
            decoration: 'underline'
          }
          /* let linkMargin = {}
          if (parentStyle && !parentStyle.parentHasMargin && margingsByTags[tag]) {
            linkMargin.margin = margingsByTags[tag]
          }
          link.margin = linkMargin.margin; */
          attachStylesToNode(link, {}, parentStyle, element, true, parentElement, '');

          //let linkTemplate = { text: [{ text: element.textContent, color: 'blue' }, { text: element.getAttribute('href'), color: 'lightblue', decoration: 'underline' }] }
          return Promise.resolve(link)
        } else if (tag == 'math-inline' || tag == 'math-display') {
          let width = pxToPt((element.getElementsByClassName('katex-display')[0] || element.getElementsByClassName('math-render')[0] || element).getBoundingClientRect().width);
          let height = pxToPt((element.getElementsByClassName('katex-display')[0] || element.getElementsByClassName('math-render')[0] || element).getBoundingClientRect().height);
          let canvasWidth = width;
          let katexFormula = element.textContent
          let result = {
            katexFormula,
            svg: undefined,
            width: canvasWidth,
            props: {canvasDims: [width, height]},
            svgType: 'katex'
          }
          if (tag == 'math-display') {
            let katexelRect = (element.getElementsByClassName('katex-display')[0] || element.getElementsByClassName('math-render')[0] || element).getBoundingClientRect()
            result.width = pxToPt(katexelRect.width);
            let img = result;
            img.katexType = 'block'
            img.props.canvasDims = [pxToPt(katexelRect.width), pxToPt(katexelRect.height)]
            result = {
              columns: [
                {
                  text: '', width: "*"
                },
                {
                  width: 'auto',
                  stack: [img]
                },
                {
                  text: '', width: "*"
                }
              ],
              props: {type: "block-math"},
            }
            img.katexType = 'block'

          }
          /* if (!math_data_url_obj[element.getAttribute('mathid')!] || 'data:,' == math_data_url_obj[element.getAttribute('mathid')!]) {
            result = {
              columns: [
                {
                  text: '', width: "*"
                },
                {
                  width: 'auto',
                  stack: ['(empty)'], color: 'red'
                },
                {
                  text: '', width: "*"
                }
              ],
              props: {

              }
            }
          } */
          /*  let blockMathMargin = {}
           if (parentStyle && !parentStyle.parentHasMargin && margingsByTags[tag]) {
             blockMathMargin.margin = margingsByTags[tag]
           }
           result.margin = blockMathMargin.margin; */
          attachStylesToNode(result, {}, parentStyle, element, false, parentElement, '');
          if (tag == 'math-inline') {


            let elementFontSize = (element.parentElement?.style.fontSize && element.parentElement?.style.fontSize !== '') ? element.parentElement?.style.fontSize :
              (window.getComputedStyle(element.parentElement).fontSize) ? window.getComputedStyle(element.parentElement).fontSize : undefined
            if (elementFontSize && elementFontSize.includes('px')) {
              elementFontSize = +elementFontSize.replace('px', '');
            }
            result.katexType = 'inline'
            let scaleDown = parentStyle.scaleDown/* ||(ptToPx(parentStyle.fontSize) / elementFontSize); */
            result.width = result.width /* * scaleDown */
            result.margin = [0, 0, 0, 0];
            let elFont = window.getComputedStyle(element).fontSize
            let elHeight = element.getBoundingClientRect().height
            /* if(elementFontSize){
              result.margin[1] = elementFontSize*0.00
              if(height){
              result.margin[1] = elementFontSize*0.00
              }
            } */

          }
          return Promise.resolve(result);

        } else if (tag == 'button') {
          return Promise.resolve({text: ''})
        } else if (tag == 'supplementary-files-nodes-container' || tag == 'end-notes-nodes-container') {
          let stack = {
            stack: []
          }
          let ch = Array.from(element.childNodes)

          for (let i = 0; i < ch.length; i++) {
            let pdfCh = await generatePDFData(ch[i], parentPDFel, parentStyle, element);
            stack.stack.push(pdfCh)
          }
          return Promise.resolve(stack)
        } else if (tag == 'block-supplementary-file') {
          parentStyle = {dontApplyAnyMargin: true}
          let supplementaryFileId = element.getAttribute('supplementary_file_id');
          let supplementaryFileData = this.ydocData.supplementaryFiles[supplementaryFileId];

          let titleContainer = document.createElement('h3');
          titleContainer.innerHTML = '<p>Suppl. material ' + (supplementaryFileData.supplementary_file_number + 1) + ': ' + supplementaryFileData.title + '</p>';
          let titlePDFel = await generatePDFData(titleContainer, parentPDFel, parentStyle, element);

          let authorsContainer = document.createElement('form-field');
          authorsContainer.innerHTML = '<p><strong>Authors: </strong>' + supplementaryFileData.authors + '</p>';
          let authorsPDFel = await generatePDFData(authorsContainer, parentPDFel, parentStyle, element);

          let dataTypeContainer = document.createElement('form-field');
          dataTypeContainer.innerHTML = '<p><strong>Data type: </strong>' + supplementaryFileData.data_type + '</p>';
          let dataTypePDFel = await generatePDFData(dataTypeContainer, parentPDFel, parentStyle, element);

          let str1 = /<\b(\w+)\s?[^>]*>([^<]*)<\/\1>/gm.exec(supplementaryFileData.brief_description);
          let forReplace = /<[^>]+>/gm.exec(str1[0]);
          let noteContent = supplementaryFileData.brief_description.replace(forReplace, forReplace + `<strong>Brief description: </strong> `);
          let contentContainer = document.createElement('form-field');
          contentContainer.innerHTML = noteContent
          let descPDFel = await generatePDFData(contentContainer, parentPDFel, parentStyle, element);

          let urlContainer = element.getElementsByTagName('supplementary-file-url')[0];
          let downloadLinkPDFel = await generatePDFData(urlContainer, parentPDFel, parentStyle, element);

          let content = {
            margin: [12,12, 0, 0],
            stack: [
              authorsPDFel,
              dataTypePDFel,
              descPDFel,
              downloadLinkPDFel
            ]
          }

          return Promise.resolve({
            stack: [
              titlePDFel,
              content
            ],
            margin: [0, 0, 0, 15]
          })
        } else if (tag == 'block-end-note') {
          parentStyle = {dontApplyAnyMargin: true}
          let endNoteId = element.getAttribute('end_note_id');
          let endNoteData = this.ydocData.endNotes[endNoteId];
          let str1 = /<\b(\w+)\s?[^>]*>([^<]*)<\/\1>/gm.exec(endNoteData.end_note);
          let forReplace = /<[^>]+>/gm.exec(str1[0]);
          let noteContent = endNoteData.end_note.replace(forReplace, forReplace + `<span><sup><strong>*${endNoteData.end_note_number + 1}&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;</strong></sup></span><span>`)
          noteContent = noteContent.replace("</p>", "</span></p>");

          let contentContainer = document.createElement('form-field');
          contentContainer.innerHTML = noteContent
          let noteConetnPdfEl = await generatePDFData(contentContainer, parentPDFel, parentStyle, element);
          let body = [];
          let t;
          if(noteConetnPdfEl.stack[0].text[1]) {
            noteConetnPdfEl.stack[0].text[0].borderColor = ["#FFF", "#FFF", "#FFF", "#FFF"];
            noteConetnPdfEl.stack[0].text[0].width = 20 + "%";
            noteConetnPdfEl.stack[0].text[0].margin = [0, 2, 0, 0]
            t = {
              borderColor: ["#FFF", "#FFF", "#FFF", "#FFF"],
              width: "80%",
              text: noteConetnPdfEl.stack[0].text.map((t, i) => i > 0 ? t : '')
            }
            // noteConetnPdfEl.stack[0].text[1].borderColor = ["#FFF", "#FFF", "#FFF", "#FFF"];
            // noteConetnPdfEl.stack[0].text[1].width = 80 + "%";
            body.push(noteConetnPdfEl.stack[0].text[0], t);
          } else {
            noteConetnPdfEl.stack[0].text[0].text[0].borderColor = ["#FFF", "#FFF", "#FFF", "#FFF"];
            noteConetnPdfEl.stack[0].text[0].text[0].width = 20 + "%";
            noteConetnPdfEl.stack[0].text[0].text[0].margin = [0, 2, 0, 0];
            t = {
              borderColor: ["#FFF", "#FFF", "#FFF", "#FFF"],
              width: "80%",
              text: noteConetnPdfEl.stack[0].text[0].text.map((t, i) => i > 0 ? t : '')
            }
            body.push(noteConetnPdfEl.stack[0].text[0].text[0], t)
            // noteConetnPdfEl.stack[0].text[0].text[1].borderColor = ["#FFF", "#FFF", "#FFF", "#FFF"];
            // noteConetnPdfEl.stack[0].text[0].text[1].width = 80 + "%";
            // body.push(noteConetnPdfEl.stack[0].text[0].text[0], noteConetnPdfEl.stack[0].text[0].text[1], ...noteConetnPdfEl.stack[0].text[0].text.map((t, i) => i > 0 ? t : ''));
          }
          
            let simpleTable = {
              color: 'black',
              borderColor: ["#FFF", "#FFF", "#FFF", "#FFF"],
              table: {
                body: [
                  body
                ],
                widths: 'auto',
                props: {}
              },
              props: {type: 'endnotes'},
              tableType: 'simple-table',
              alingment: 'left',
            };

          return Promise.resolve({
            props: {type: 'endnotes'},
            stack: [simpleTable],
            margin: [2, 0, 0, 0],
          })
        } else if (tag == 'tbody'){
          let table = document.createElement("table");
          table.appendChild(element)
          let nOfColums = element.childNodes.length;
          let tableContent = pdfSettings.nodes?.['tableContent'];

          let baseTable = {
              color: 'black',
              table: {
                  dontBreakRows: true,
                  keepWithHeaderRows: 1,
                  headerRows: 1,
                  widths: 'auto',
                  body: [],
                  props: {},
              },
              tableType: 'normalTable',
              layout: {
                  paddingBottom: function paddingBottom(i, node) {
                      return 3;
                  },
              },
              alingment: 'center',
          };
          let tableStyle = {};
          attachStylesToNode(baseTable, tableStyle, parentStyle, element, false, parentElement, 'table');
          let tabbleCellWidthNumber;
          let parrentWidth = (parentStyle && parentStyle.parentWidth) ? parentStyle.parentWidth : pageWidth;
          if (parentStyle && parentStyle.parentWidth) {
              tabbleCellWidthNumber = ((1 / nOfColums) * parentStyle.parentWidth) - 6;
          }
          else {
              tabbleCellWidthNumber = ((1 / nOfColums) * pageWidth) - 6;
          }
          let widths = getTableWidths(table);
          baseTable.table.widths = widths;
          let rows = element.childNodes;
          for (let i = 0; i < rows.length; i++) {
              let htmlrow = rows[i];
              let row = [];
              let columns = htmlrow.childNodes;
              for (let j = 0; j < columns.length; j++) {
                  let cell = columns[j];
                  let stack = [];
                  let cellNodes = cell.childNodes;
                  for (let k = 0; k < cellNodes.length; k++) {
                      let cellnode = cellNodes[k];
                      let val = await generatePDFData(cellnode, baseTable, Object.assign({ parentWidth: tabbleCellWidthNumber }, tableStyle), table);
                      val.margin = [tableContent?.marginLeft || 2, tableContent?.marginTop || 3, tableContent?.marginRight || 2,tableContent?.marginBottom || 3]
                      stack.push(val);
                  }
                  row.push({ stack, borderColor: ['#e2e2dc', '#e2e2dc', '#e2e2dc', '#e2e2dc'] });
              }
              baseTable.table.body.push(row);
          }
          return Promise.resolve(baseTable);
        } else {
          let stack = {
            stack: []
          }
          let ch = Array.from(element.childNodes)

          for (let i = 0; i < ch.length; i++) {
            let pdfCh = await generatePDFData(ch[i], parentPDFel, parentStyle, parentElement);
            stack.stack.push(pdfCh)
          }
          return Promise.resolve(stack)
        }
      }

      let margFooter = [pxToPt(this.pageMarg[0]), 15, pxToPt(this.pageMarg[2]), 15];
      let margHeader = [pxToPt(+this.pageMarg[0]), 20, pxToPt(+this.pageMarg[2]), 15];
      if (pdfSettings.pdf.footer) {
        margFooter = [pxToPt(this.pageMarg[0]), pdfSettings.pdf.footer.marginTop, pxToPt(this.pageMarg[2]), pdfSettings.pdf.footer.marginBottom];
      }
      this.pdfMetaData.margFooter = margFooter
      if (pdfSettings.pdf.header) {
        margHeader = [pxToPt(+this.pageMarg[0]), pdfSettings.pdf.header.marginTop, pxToPt(+this.pageMarg[2]), pdfSettings.pdf.header.marginTop];
      }
      this.pdfMetaData.margHeader = margHeader
      let headerStack = []
      let footerStack = []


      for (let i = 0; i < headerCh.length; i++) {
        headerStack.push(await generatePDFData(headerCh[i], {}, {parentHasMargin: true}, undefined))
      }
      this.pdfMetaData.headerStack = headerStack
      for (let i = 0; i < footerCh.length; i++) {
        footerStack.push(await generatePDFData(footerCh[i], {}, {parentHasMargin: true}, undefined))
      }
      this.pdfMetaData.footerStack = footerStack

      let footerFontSize = 9;
      let headerFontSize = 9;
      if (pdfSettings.pdf.footer && pdfSettings.pdf.footer.fontSize !== 'auto') {
        footerFontSize = pdfSettings.pdf.footer.fontSize
      }
      this.pdfMetaData.footerFontSize = footerFontSize
      if (pdfSettings.pdf.header && pdfSettings.pdf.header.fontSize !== 'auto') {
        headerFontSize = pdfSettings.pdf.header.fontSize
      }
      this.pdfMetaData.headerFontSize = headerFontSize;

      this.pdfFunctions.footer = function (currentPage, pageCount) {
        return [{
          margin: margFooter,
          columnGap: 10,
          columns: [
            {
              width: 'auto',
              alignment: 'left',
              text: '',
              fontSize: footerFontSize,
              color: '#0B542D'
            },
            {
              width: '*',
              alignment: 'center',
              stack: footerStack,
              fontSize: footerFontSize,
              color: '#0B542D'
            },
            {
              width: 'auto',
              alignment: 'right',
              text: '',
              fontSize: footerFontSize,
              color: '#0B542D'
            }
          ]
        }]
      }
      this.pdfFunctions.header = function (currentPage, pageCount, pageSize) {
        // you can apply any logic and return any valid pdfmake element
        return [{
          margin: margHeader,
          columnGap: 10,
          columns: [
            {
              width: 'auto',
              alignment: 'left',
              text: currentPage.toString(),
              fontSize: headerFontSize,
              color: '#0B542D'
            },
            {
              width: '*',
              alignment: 'center',
              stack: headerStack,
              fontSize: headerFontSize,
              color: '#0B542D'
            },
            {
              width: 'auto',
              alignment: 'right',
              text: '',
              fontSize: headerFontSize,
              color: '#0B542D'
            }
          ]
        }]
      }
      let renderArticleHeadMetaData = (cont) => {
        let heading = cont.shift();

        if(typeof heading?.stack[0]?.text == 'object') {
          heading.stack[0].fontSize = +pdfSettings.nodes["h1"]?.fontSize || 20;
          heading.stack[0].text.forEach(text => {
            if(text.fontSize) {
              text.fontSize = +pdfSettings.nodes["h1"]?.fontSize || 20;
            }
          })
        } else {
          heading.stack[0].fontSize = +pdfSettings.nodes["h1"].fontSize;
        }

        let fontSize
        if (pdfSettings.nodes && pdfSettings.nodes.p && pdfSettings.nodes.p.fontSize) {
          fontSize = pdfSettings.nodes.p.fontSize
        } else {
          fontSize = 10
        }
        let smallFontSize = pdfSettings?.authorsSection || fontSize - 1.5;
        let smallerFontSize = pdfSettings?.corespondentAuthors || fontSize - 3.5;

        let authors = this.ydocData.authors;
        let collaborators = this.ydocData.collaborators;

        let authorsAndSymbols = []
        let affiliationsFound = [];

        let getAffiliationKey = (affiliation) => {
          return affiliation.affiliation + affiliation.city + affiliation.country;
        }
        let affiliationsSymbolMapping = ["‡", "§", "|", "¶", "#", "¤", "«", "»", "˄", "˅", "¦", "ˀ", "ˁ", "₵", "ℓ", "₰", "₱", "₳", "₴", "₣", "₮", "₦", "₭", "₲", "‽", "₩", "₸"]

        let fillAffiliationsData = (authors, collaborators, affiliationsFound, authorsAndSymbols) => {
          authors.forEach((author) => {
            let prop
            let val
            if (author.authorId) {
              prop = 'id';
              val = author.authorId;
            } else {
              prop = 'email';
              val = author.authorEmail;
            }

            let collaborator = (collaborators || []).find((user) => user[prop] == val);
            if (collaborator) {
              let userAffiliationSymbols = []
              if (collaborator.affiliations) {
                collaborator.affiliations.forEach((affiliation) => {
                  let affilKey = getAffiliationKey(affiliation);
                  let affilSymbol
                  if (!affiliationsFound.some(x => x.key == affilKey)) {
                    affilSymbol = affiliationsSymbolMapping[affiliationsFound.length]
                    affiliationsFound.push({
                      key: affilKey,
                      displayTxt: `${affilSymbol} ${affiliation.affiliation}, ${affiliation.city}, ${affiliation.country}`,
                      symbol: affilSymbol,
                      affiliation
                    })
                  } else {
                    affilSymbol = affiliationsFound.find(x => x.key == affilKey).symbol
                  }
                  userAffiliationSymbols.push(affilSymbol);
                })
              }
              authorsAndSymbols.push({collaborator, affiliationSymbols: userAffiliationSymbols});
            } else {
              console.error('No callaborator with ' + prop + " " + val);
            }
          })
        }

        fillAffiliationsData(authors, collaborators, affiliationsFound, authorsAndSymbols);
        let articleHeadData = {
          stack: [
            heading,
            {
              text: authorsAndSymbols.reduce((prev, userWithSymbols, index) => {
                let collaboratorData = userWithSymbols.collaborator;
                let userSymbols = userWithSymbols.affiliationSymbols.join(', ');
                let userName = collaboratorData.name;
                let userPdfData
                if (userSymbols.length > 0) {
                  userPdfData = {text: [{text: userName, color: '#0B542C'}, {text: userSymbols, sup: true}]}
                } else {
                  userPdfData = {text: [{text: userName, color: '#0B542C'}]}
                }
                if (index > 0) {
                  prev.push({text: ', '}, userPdfData);
                } else {
                  prev.push(userPdfData)
                }
                return prev
              }, []),
              fontSize
            },
            {
              stack: affiliationsFound.reduce((prev, curr) => {
                let affiliationPdfItem = {
                  text: curr.displayTxt,
                  margin: [0, 3, 0, 0]
                }
                prev.push(affiliationPdfItem)
                return prev
              }, []),
              margin: [15, 5, 0, 6],
              color: '#535253',
              fontSize: smallerFontSize
            },
            {
              table:
                {
                  body:
                    [
                      [
                        {
                          border: [true, true, true, true],
                          fillColor: '#FAFAF8',
                          borderColor: ['#E1E2DD', '#E1E2DD', '#E1E2DD', '#E1E2DD'],
                          stack: [
                            {
                              text: ['Corresponding author: ',
                                ...(authorsAndSymbols.reduce((prev, userWithSymbols, index) => {
                                  let collaboratorData = userWithSymbols.collaborator;
                                  let userEmail = collaboratorData.email;
                                  let userName = collaboratorData.name;
                                  let userPdfData = {
                                    text: [{text: userName}, {text: ' ('}, {
                                      text: userEmail,
                                      color: '#1D89AE',
                                      decoration: 'underline'
                                    }, {text: ')'}]
                                  }
                                  if (index > 0) {
                                    prev.push({text: ', '}, userPdfData);
                                  } else {
                                    prev.push(userPdfData)
                                  }
                                  return prev
                                }, []))
                              ], margin: [0, 0, 0, 0]
                            },
                            {
                              text: ['© ',
                                ...(authorsAndSymbols.reduce((prev, userWithSymbols, index) => {
                                  let collaboratorData = userWithSymbols.collaborator;
                                  let userName = collaboratorData.name;
                                  let userPdfData = {text: userName};
                                  if (index > 0) {
                                    prev.push({text: ', '}, userPdfData);
                                  } else {
                                    prev.push(userPdfData)
                                  }
                                  return prev
                                }, []))
                              ], margin: [0, 6, 0, 0]
                            },
                          ],
                          margin: [10, 10, 10, 10],
                          color: '#535253',
                          fontSize: smallFontSize
                        }
                      ]
                    ],
                  widths: ['*']
                },
              margin: [0, 10, 0, 0]
            }
          ]
        }
        cont.unshift(articleHeadData)
      }
      let val = await new Promise(async (resolve, reject) => {
        try {
          let cont = [];

          let mainNodes = this.elements;
          let pbs = 0 // page breaks
          for (let i = 0; i < mainNodes.length; i++) {
            let el = mainNodes[i];
            if (el.tagName.toLocaleLowerCase() == 'page-break') {
              if (cont[i - 1 - pbs]) {
                cont[i - 1 - pbs].pageBreak = 'after';
              }
              pbs++;
            } else {
              let pdfElement = await generatePDFData(el, {}, {}, undefined);
              if (!pdfElement.props) {
                pdfElement.props = {}
              }
              if(pdfElement.stack && pdfElement.stack[0] && pdfElement.stack[0].stack && pdfElement.stack[0].stack[0].text == 'Endnotes') {
                 pdfElement.props.type = 'endnotes';
              } else if (pdfElement.stack && pdfElement.stack[0] && pdfElement.stack[0].stack && pdfElement.stack[0].stack[0].text.includes('Supplementary')) {
                pdfElement.props.type = 'supplementary';
              }
              pdfElement.props.main = true;

              cont.push(pdfElement)
            }
            if (i == mainNodes.length - 1) {
            }
          }

          renderArticleHeadMetaData(cont)

          let checkIfHeadingIsLastNodeOnNonLastPage = (node, nodesAfterNodeOnSamePage) => {
            if (node.positions.length > 1) return false;// more than one line in paragraph / heading
            if (nodesAfterNodeOnSamePage.length > 0) return false;//node is not last node on the page
            if (!node.positions[0] || node.nodeInfo.pages == node.positions[0].pageNumber) return false//node is on the last page
            node.pageBreak = 'before'
            return true;
          }
          this.pdfFunctions.checkIfHeadingIsLastNodeOnNonLastPage = checkIfHeadingIsLastNodeOnNonLastPage

          let checkNodesBeforeIfHeadingAndMove = (node, nodesBefore) => {
            let c = 0
            let nonHeading = false
            while (nodesBefore[nodesBefore.length - 1 - c] && c < 1 && !nonHeading) {
              let nodeBefore = nodesBefore[nodesBefore.length - 1 - c];
              //should probably check inner nodes if its a nested header
              if ((nodeBefore.props.type == 'heading' || nodeBefore.props.type == 'paragraph' || nodeBefore.props.type == 'paragraphTable') &&
                nodeBefore.positions.length == 1) {
                nodeBefore.pageBreak = 'before'
                node.pageBreak = undefined;
                if (c == 1) {
                  nodesBefore[nodesBefore.length - 1].pageBreak = undefined;
                } else if (c == 2) {
                  nodesBefore[nodesBefore.length - 1].pageBreak = undefined;
                  nodesBefore[nodesBefore.length - 2].pageBreak = undefined;
                }
              } else {
                nonHeading = true;
              }
              c++;
            }
          }
          this.pdfFunctions.checkNodesBeforeIfHeadingAndMove = checkNodesBeforeIfHeadingAndMove
          this.pdfMetaData.pdfSettings = pdfSettings
          this.pdfFunctions.isNumeric = isNumeric
          this.pdfFunctions.pxToPt = pxToPt
          this.pdfFunctions.orderNodes = (node, nodeFunc) => {
            let nodeInfo = node.nodeInfo;
            if (nodeInfo.table && nodeInfo.table.props && nodeInfo.table.props.type == 'figure' && node.pageBreak == 'before') {
              /* let scaling = false;
              if (2 !== node.scaleTry && node.nodeInfo.pageNumbers.length > 1) {
                scaling = true;
                node.pageOrderCalculated = false;
              } */


              let structuredNodes = nodeFunc.getContent();
              let nodesBefore = nodeFunc.getAllNodesBefore();
              let nodesAfter = nodeFunc.getAllNodesAfter();
              if (nodesBefore.length > 0) {
                let lastNodeBefore = nodesBefore[nodesBefore.length - 1];
                let availableHeightAfterLastNode = lastNodeBefore.props.availableHeight;

                // check if there is space above for the figure
                if (availableHeightAfterLastNode > node.props.height) {
                  node.pageBreak = undefined;
                  return true
                }

                // try scale the images and then the above operations again

                let loopTableAndChangeWidth = (nodeToChange) => {
                  let availableHeightOnLastPage = nodesBefore[nodesBefore.length - 1].props.availableHeight;
                  let figureHeight = nodeToChange.props.height;
                  let imagesTable = nodeToChange.table.body[0][0].columns[1]
                  let descriptionTable = nodeToChange.table.body[1][0]

                  let imageTableHeight = imagesTable.props.height;
                  let descriptionHeight = figureHeight - imageTableHeight;
                  let imageNewHeight = availableHeightOnLastPage - descriptionHeight - 3;

                  //let figureImageInitHeight = nodeToChange.table.body[0][0].props.initRect[1];
                  //let figureDescriptionHeight = figureHeight - figureImageInitHeight;
                  let dawnScalePercent = imageNewHeight / imageTableHeight;

                  //let imageNewHeight = availableHeightOnLastPage - figureDescriptionHeight - 3;
                  //let dawnScalePercent = imageNewHeight / figureImageInitHeight;
                  let scaleFromUserInput = pdfSettings.pdf.maxFiguresImagesDownscale.replace("%", '');
                  let scale = 0.8;
                  if (isNumeric(scaleFromUserInput)) {
                    scale = +scaleFromUserInput / 100
                  }
                  if (dawnScalePercent >= scale) {
                    nodeToChange.pageOrderCalculated = true;
                    nodeToChange.pageBreak = 'after';
                    for (let r = 0; r < imagesTable.table.body.length; r++) {
                      let row = imagesTable.table.body[r];
                      for (let c = 0; c < row.length; c++) {

                        let cell = row[c];
                        if (cell.fit && cell.fit[1]) {
                          cell.fit[1] = cell.fit[1] * dawnScalePercent;
                        }
                      }
                    }
                    //imagesTable.table.body
                    //nodeToChange.table.body[0][0].fit = [nodeToChange.table.body[0][0].props.initRect[0] * dawnScalePercent, imageNewHeight]
                    return true
                  } else {
                    //nodeToChange.pageOrderCalculated = true;
                    //nodeToChange.pageBreak = undefined;
                    return false
                  }
                }


                if (node.scaleTry == 2) {
                  //loopTableAndChangeWidth(node, singleimgOnRowWidth)
                  //return true
                } else {
                  node.scaleTry = 2;
                  if (loopTableAndChangeWidth(node)) {
                    return true
                  }

                  /* if (!node.scaleTry) {
                    node.scaleTry = 1
                  } else {
                    node.scaleTry = 2
                  }
                  if (node.scaleTry == 1) {
                    node.pageOrderCalculated = false;
                    loopTableAndChangeWidth(node, twoImgOnRowWidth)
                    return true
                  } else {
                    node.pageOrderCalculated = false;
                    loopTableAndChangeWidth(node, threeImgOnRowWidth)
                    return true
                  } */
                }

                // try move text from uder the figure

                if (availableHeightAfterLastNode < 100) {
                  return true
                }

                let filledSpace = 0;
                let counter = 0;
                let movedIndexes = []
                let cannotMove = false
                while (counter < nodesAfter.length && !cannotMove) {
                  let nAfter = nodesAfter[counter]
                  if (nAfter.props.height < availableHeightAfterLastNode - filledSpace && !nAfter.table) {
                    filledSpace += nAfter.props.height
                    movedIndexes.push(1 + nodesBefore.length + counter);
                  } else {
                    cannotMove = true
                  }
                  counter++
                }
                movedIndexes.sort((a, b) => b - a);

                let editData = {moveFrom: movedIndexes, moveTo: nodesBefore.length};

                if (/* !scaling && */ movedIndexes.length > 0 && availableHeightAfterLastNode - filledSpace < 200 && lastNodeBefore.props.availableHeight > 200) {
                  let nodesToMove = editData.moveFrom;
                  let indexToMoveAt = editData.moveTo

                  let figureNode = structuredNodes.splice(nodesBefore.length, 1);
                  let biggestIndex = Math.max(...movedIndexes);


                  node.pageOrderCalculated = false;
                  structuredNodes.splice(biggestIndex, 0, figureNode);

                  //retrun true so we contonue to the next node
                  return true;
                }
                // try move figure above the text before it
                let freeSpaceBefore = availableHeightAfterLastNode;

                counter = nodesBefore.length - 1;
                movedIndexes = []
                cannotMove = false
                let enoughFreeSpace = false
                while (counter > -1 && !cannotMove && node.props.height < 650 && !enoughFreeSpace) {
                  let nBefore = nodesBefore[counter]
                  if (freeSpaceBefore < node.props.height && !nBefore.table && nBefore.nodeInfo.pageNumbers.length == 1 && nBefore.nodeInfo.pageNumbers[0] == node.nodeInfo.pageNumbers[0] - 1) {
                    if (freeSpaceBefore + nBefore.props.height > node.props.height) {
                      enoughFreeSpace = true;
                    }
                    freeSpaceBefore += nBefore.props.height
                    movedIndexes.push(counter);
                  } else {
                    cannotMove = true
                  }
                  counter--
                }
                if (/* !scaling && */ movedIndexes.length > 0 && enoughFreeSpace) {
                  let moveNodeFrom = nodesBefore.length;
                  for (let i = 0; i < movedIndexes.length; i++) {
                    structuredNodes[movedIndexes[i]].pageOrderCalculated = false;
                  }
                  let moveTo = Math.min(...movedIndexes);

                  let movingNode = structuredNodes.splice(moveNodeFrom, 1);
                  movingNode[0].pageBreak = undefined;
                  if (movingNode[0].stack && movingNode[0].stack[0]) {
                    movingNode[0].stack[0].pageBreak = undefined;
                  }

                  structuredNodes.splice(moveTo, 0, ...movingNode);

                  return true
                }

                return true


              }
            } else if (node.props.type == 'paragraph') {
              let followingNodes = nodeFunc.getFollowingNodesOnPage();
              let nodesBefore = nodeFunc.getAllNodesBefore();

              if (checkIfHeadingIsLastNodeOnNonLastPage(node, followingNodes)) {
                checkNodesBeforeIfHeadingAndMove(node, nodesBefore)
                return true
              }
              let maxLinesOnLastPage = pdfSettings.pdf.minParagraphLinesAtEndOfPage ? +pdfSettings.pdf.minParagraphLinesAtEndOfPage : 1
              if (node.text && nodeInfo.pageNumbers.length > 1 && node.positions.length >= maxLinesOnLastPage) {
                let lines = [];
                nodeInfo.pageNumbers.forEach((page, index) => {
                  lines[index] = 0
                  node.positions.forEach((pos) => {
                    if (pos.pageNumber == page) {
                      lines[index]++;
                    }
                  })
                })
                if (lines[0] <= maxLinesOnLastPage) {
                  node.pageBreak = 'before'
                  checkNodesBeforeIfHeadingAndMove(node, nodesBefore)
                  return true
                }
              }
            } else if (node.props.type == 'paragraphTable' /* && nodeInfo.pageNumbers.length > 1 */) {
              let maxMathDownscale = pdfSettings.pdf.maxMathDownscale.replace("%", '');
              let scale = 0.8;
              if (isNumeric(maxMathDownscale)) {
                scale = +maxMathDownscale / 100
              }
              let structuredNodes = nodeFunc.getContent();
              let nodesBefore = nodeFunc.getAllNodesBefore();
              let nodesAfter = nodeFunc.getAllNodesAfter();
              let followingNodes = nodeFunc.getFollowingNodesOnPage();

              if (checkIfHeadingIsLastNodeOnNonLastPage(node, followingNodes)) {
                checkNodesBeforeIfHeadingAndMove(node, nodesBefore)
                return true
              }

              let minLinesLeftOnLastPage = +pdfSettings.pdf.minParagraphLinesAtEndOfPage;

              let nodeOrLineOnLastPage
              let lineOnNewPage

              let hasMathImages = (node) => {
                let tableBody;
                if (node.table) {
                  tableBody = node.table.body
                } else if (node.columns) {
                  node.columns.forEach((col) => {
                    if (col.table) {
                      tableBody = col.table.body
                    }
                  })
                }
                let hasMathImage = false;
                tableBody[0].forEach((cell) => {
                  if (cell.image && cell.props && cell.props.canvasDims) {
                    hasMathImage = true
                  }
                })
                return hasMathImage
              }
              let isBreakingLine = (node, i, nodeBefore, i1) => {
                let isOnMoreThanOnePage = node.nodeInfo.pageNumbers.length > 1;
                let actualTop = node.nodeInfo.startPosition.top - pxToPt(pdfSettings.pdf.pageMargins.marginTop);
                let nodeH = node.props.height;
                let pageH = node.nodeInfo.startPosition.pageInnerHeight;
                let isBiggerThanLeftSpaceOnPage = pageH < nodeH + actualTop;
                let isBiggerThanLeftSpaceAfterLastNode = false;
                if (nodeBefore && nodeBefore.props.availableHeight) {
                  let leftSpace = nodeBefore.props.availableHeight;
                  if (leftSpace < nodeH) {
                    isBiggerThanLeftSpaceAfterLastNode = true
                  }
                }
                if (node.fixedParagraphTable) {
                  return false
                }
                if (isOnMoreThanOnePage && isBiggerThanLeftSpaceAfterLastNode) {
                  return true
                } else {
                  if (isBiggerThanLeftSpaceOnPage || isBiggerThanLeftSpaceAfterLastNode) {
                    return true;
                  }
                }
              }
              let findImageLinesOnNewPages = (node) => {
                for (let i = 0; i < node.stack.length; i++) {
                  let hasMath = hasMathImages(node.stack[i])
                  let isbreaking = isBreakingLine(node.stack[i], i, node.stack[i - 1] || nodesBefore[nodesBefore.length - 1], i - 1)
                  if (hasMath && isbreaking) {
                    lineOnNewPage = node.stack[i];
                    nodeOrLineOnLastPage = node.stack[i - 1] || nodesBefore[nodesBefore.length - 1];
                    return true;
                  }
                }
                return false;
              }
              let findImgCellNodes = (lineNode) => {
                let imagecells = []
                let tableBody;
                if (lineNode.table) {
                  tableBody = lineNode.table.body
                } else if (lineNode.columns) {
                  lineNode.columns.forEach((col) => {
                    if (col.table) {
                      tableBody = col.table.body
                    }
                  })
                }
                tableBody[0].forEach((cell) => {
                  if (cell.image && cell.props && cell.props.canvasDims) {
                    imagecells.push(cell)
                  }
                })
                return imagecells
              }
              if (node.nodeInfo.pageNumbers.length == 1) {
                return false;
              }
              let countLinesOnFirtPage = (node) => {
                let linesOnFirstPage = 0;
                let firstPage = node.nodeInfo.pageNumbers[0];
                for (let i = 0; i < node.stack.length; i++) {
                  let line = node.stack[i];
                  let lineNumber = line.nodeInfo.pageNumbers[0];
                  if (lineNumber == firstPage && line.nodeInfo.pageNumbers.length == 1) {
                    linesOnFirstPage++;
                  }
                }
                return linesOnFirstPage;
              }
              if (node.nodeInfo.pageNumbers.length > 1 && !node.lineLeftOnFirstPageChecked) {//move lines if there are more left on last page
                node.lineLeftOnFirstPageChecked = true;
                let linesOnFirstPage = countLinesOnFirtPage(node);
                if (linesOnFirstPage <= minLinesLeftOnLastPage) {
                  if (node.stack[linesOnFirstPage - 1]) {
                    node.pageBreak = 'before'
                    //check 3 nodes before if they are headings and move the on the next page with the paragraph
                    checkNodesBeforeIfHeadingAndMove(node, nodesBefore)
                  }
                }
                if (linesOnFirstPage > 0) {
                  node.pageOrderCalculated = false;
                  return true
                }
              }
              if (typeof node.calculatedTimes !== 'number' || node.calculatedTimes < 2) {
                if (typeof node.calculatedTimes !== 'number') {
                  node.calculatedTimes = 0
                } else {
                  node.calculatedTimes++
                }
                node.pageOrderCalculated = false;
                return true
              } else if (node.calculatedTimes == 2) {
                if (findImageLinesOnNewPages(node) && !lineOnNewPage.fixedParagraphTable) {  // fix the breaking lines
                  let sp = nodeOrLineOnLastPage.nodeInfo.startPosition
                  //let freeSpaceOnLastPage = sp.pageInnerHeight -sp.top+  pxToPt(pdfSettings.pdf.pageMargins.marginTop)-nodeOrLineOnLastPage.props.height;
                  let freeSpaceOnLastPage = nodeOrLineOnLastPage.props.availableHeight;
                  let imagesInLine = findImgCellNodes(lineOnNewPage);
                  if (imagesInLine.length > 0) {
                    let biggestImage = imagesInLine.reduce((prev, curr, i, arr) => {
                      return prev.props.canvasDims[1] < curr.props.canvasDims[1] ? curr : prev
                    }, {props: {canvasDims: [0, 0]}})
                    let bigH = biggestImage._height;
                    let cH = biggestImage.props.canvasDims[1];
                    let adds = bigH - cH;
                    let biggreqSc = (freeSpaceOnLastPage - adds) / cH;
                    if (biggreqSc < scale) {
                      lineOnNewPage.pageBreak = 'before'
                      node.calculatedTimes = undefined
                      lineOnNewPage.fixedParagraphTable = true
                      node.pageOrderCalculated = false;
                      return true;
                    } else {
                      imagesInLine.forEach((img) => {
                        let imageHeight = img._height;
                        if (imageHeight > freeSpaceOnLastPage) {
                          let canvasHeight = img.props.canvasDims[1];
                          let addedSpace = imageHeight - canvasHeight;
                          let requiredScale = (freeSpaceOnLastPage - addedSpace - 10) / canvasHeight;
                          img.props.canvasDims[0] = img.props.canvasDims[0] * requiredScale;
                          img.props.canvasDims[1] = img.props.canvasDims[1] * requiredScale;
                          img.props.offsetBot = img.props.offsetBot * requiredScale;
                          img.props.offsetTop = img.props.offsetTop * requiredScale;
                          img.width = img.props.canvasDims[0]
                        }
                      })
                      node.pageOrderCalculated = false;
                      node.calculatedTimes = undefined;
                      lineOnNewPage.fixedParagraphTable = true
                      return true;
                    }
                  }
                }
              }

            } else if (node.props.type == 'block-math') {
              let maxMathDownscale = pdfSettings.pdf.maxMathDownscale.replace("%", '');
              let scale = 0.8;
              if (isNumeric(maxMathDownscale)) {
                scale = +maxMathDownscale / 100
              }
              let structuredNodes = nodeFunc.getContent();
              let nodesBefore = nodeFunc.getAllNodesBefore();
              let nodesAfter = nodeFunc.getAllNodesAfter();
              let nodeBeforeMath = nodesBefore.length > 0 ? nodesBefore[nodesBefore.length - 1] : undefined;
              if (nodeBeforeMath && nodeBeforeMath.nodeInfo.pageNumbers[nodeBeforeMath.nodeInfo.pageNumbers.length - 1] < node.nodeInfo.pageNumbers[0]) {
                let availableHeightOnPageBeforeMath = nodeBeforeMath.props.availableHeight - 10;
                let imagePdf = node.columns[1].stack[0];
                let imgDims = imagePdf.props.canvasDims;//[width,height]
                let mathWidth = imagePdf.width
                let imageHeight = (imgDims[1] / imgDims[0]) * mathWidth;
                let requiredScalePercent = availableHeightOnPageBeforeMath / imageHeight;
                if (requiredScalePercent > scale && requiredScalePercent < 1) {
                  let newWidth = mathWidth * requiredScalePercent
                  imagePdf.width = newWidth;
                  imagePdf.fit = [newWidth, availableHeightOnPageBeforeMath]
                  return true;
                }
              }
            } else if (node.props.type == 'heading') {
              let followingNodes = nodeFunc.getFollowingNodesOnPage();
              let nodesBefore = nodeFunc.getAllNodesBefore();
              if (checkIfHeadingIsLastNodeOnNonLastPage(node, followingNodes)) {
                checkNodesBeforeIfHeadingAndMove(nodeInfo, nodesBefore)
                return true
              }
            }
            return true;
          }

          this.pdfFunctions.pageBreakBefore = (nodeInfo, nodeFunc) => {
            let followingNodes = nodeFunc.getFollowingNodesOnPage();
            let nodesBefore = nodeFunc.getAllNodesBefore();
            if (nodeInfo.table && nodeInfo.table.props && nodeInfo.table.props.type == 'figure' || nodeInfo.props.type == 'heading') {
              if (checkIfHeadingIsLastNodeOnNonLastPage(nodeInfo, followingNodes)){
                checkNodesBeforeIfHeadingAndMove(nodeInfo, nodesBefore)
                return true
              }
              if (nodeInfo.pageNumbers.length == 2) {
                return true
              }
            }
            return false;
          }

          this.data = {...this.pdfFunctions};
          this.data.images = ImagesByKeys;
          this.data.content = cont;
          this.data.threeImgOnRowWidth = threeImgOnRowWidth;
          this.data.fourImgOnRowWidth = fourImgOnRowWidth;
          this.data.singleimgOnRowWidth = singleimgOnRowWidth;
          this.data.pageSize = this.pageSize;

          resolve({pdfMetaData: this.pdfMetaData, pdfData: this.data});
        } catch (e){
          console.error(e);
          reject(new Error(e));
        }
      })

      return Promise.resolve(val)
    } catch (e) {
      return Promise.reject(e);
    }
  }

  getTextStyles(elementStyles, element, parentStyle) {
    //margin: [left, top, right, bottom]
    let tag = element.tagName.toLocaleLowerCase();
    let elementMargin = [+elementStyles.marginLeft.replace('px', ''), +elementStyles.marginTop.replace('px', ''), +elementStyles.marginRight.replace('px', ''), +elementStyles.marginBottom.replace('px', '')];


    let style = elementStyles.getPropertyValue('font-size');
    let align = elementStyles.getPropertyValue('text-aling');
    let fontSize = parentStyle.fontSize ? parentStyle.fontSize : parseFloat(style);
    let sub
    let sup
    if (element.tagName && (element.tagName == "SUB" || element.tagName == "SUP" || element.tagName == "END-NOTE-CITATION")) {
      if (element.tagName == "SUB") {
        sub = { offset: '0%' };
        sub = true;
      } else if (element.tagName == "SUP"||element.tagName == "END-NOTE-CITATION") {
        sup = { offset: '0%' };
        sup = true;
      }
    }
    let font
    if (element.tagName == 'CODE') {
      font = 'CodeFont'
    }
    // now you have a proper float for the font size (yes, it can be a float, not just an integer)

    (element).style.textAlign
    let textStyles = {
      fontSize: (sub || sub) ? undefined : pxToPt(fontSize),
      sub,
      font,
      sup,
      //lineHeight: pxToPt(getLineHeight(element)),
      bold:
        elementStyles.font.split(' ')[0] >= 500 ||
        element.tagName == 'STRONG' ||
        element.tagName == 'H1' ||
        element.tagName == 'H2' ||
        element.tagName == 'H3' ||
        element.tagName == 'H4' ||
        element.tagName == 'H5' ||
        element.tagName == 'H6',
      italics: element.tagName == 'EM',
      alignment: element.style.textAlign == 'left' ? 'justify' : element.style.textAlign,
      color: (elementStyles.color && elementStyles.color.trim() !== "") ? rgbToHex(...elementStyles.color.replace('rgb', '').replace('(', '').replace(')', '').replace('a', '').split(', ').map((el) => +el)) : undefined,
      background: (elementStyles.backgroundColor && elementStyles.backgroundColor.trim() !== "") ? rgbToHex(...elementStyles.backgroundColor.replace('rgb', '').replace('a', '').replace('(', '').replace(')', '').split(', ').map((el) => +el)) : undefined,
      decoration: elementStyles.textDecorationLine == 'line-through' ? 'lineThrough' : element.tagName == 'U' ? 'underline' : elementStyles.textDecorationLine == 'overline' ? 'overline' : undefined,
      decorationStyle: elementStyles.textDecorationStyle !== 'solid' ? elementStyles.textDecorationStyle : undefined,
      decorationColor: (elementStyles.textDecorationColor && elementStyles.textDecorationColor.trim() !== '') ? rgbToHex(...elementStyles.textDecorationColor.replace('rgb', '').replace('a', '').replace('(', '').replace(')', '').split(', ').map((el) => +el)) : undefined,
    }
    if (textStyles.background == '#ecb9b9') textStyles.background = undefined;
    let clearedStyles = {}

    Object.keys(textStyles).forEach((key) => {
      let val = textStyles[key]
      if (val && `${val}`.trim() !== '') {
        clearedStyles[key] = val
      }
    })
    if (elementStyles.textAlign == 'left' || elementStyles.textAlign == 'right' || elementStyles.textAlign == 'center' || elementStyles.textAlign == 'justify') {
      if (elementStyles.textAlign == 'left') {
        clearedStyles.alignment = 'justify'
      } else {
        clearedStyles.alignment = elementStyles.textAlign;
      }
    }

    let margin = elementMargin.map((el) => {
      if (typeof el == 'number') {
        return pxToPt(el);
      } else {
        return 0;
      }
    })
    if (margin.reduce((p, m) => { return m !== 0 ? false : p }, true)) {
      if (tag == 'p' || tag == 'form-field') {
        margin = [0, 0, 0, 5]
      } else if (tag == 'h1' ||
        tag == 'h2') {
        margin = [0, 0, 0, 15]
      } else if (tag == 'h3' ||
        tag == 'h4' ||
        tag == 'h5' || tag == 'h6') {
        margin = [0, 0, 0, 10]
      }
    }
    //clearedStyles.margin = margin;
    if (element.tagName && (element.tagName == "SUB" || element.tagName == "SUP")) {
      clearedStyles.decoration = undefined
    }
    return clearedStyles
  }
}
