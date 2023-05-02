/* eslint-disable prettier/prettier */
var mathjax = require("mathjax-node"); 
var request = require("request").defaults({ encoding: null });
var sizeOf = require('image-size');

let {
  applyVerticalAlignment,
  applyVerticalAlignmentv2,
} = require("./alignFunc.js");

exports.loadImages = async function(images){
  return new Promise((resolve, reject) => {
    let rendered = 0;
    let imagesCount = Object.keys(images).length;
    if (imagesCount == 0) {
      resolve(true);
    }
    Object.keys(images).forEach((imgshort) => {
      request.get(images[imgshort], function (error, response, body) {
        if (
          !error &&
          response.statusCode == 200 &&
          response.headers["content-type"] != "image/webp"
        ) {
          let buffer = Buffer.from(body)
          img =
            "data:" +
            response.headers["content-type"] +
            ";base64," +
            buffer.toString("base64");
            
          images[imgshort] = img;
          rendered++;
        } else {
          images[imgshort] =
            "data:image/jpeg;base64,/9j/4AAQSkZJRgABAQEAYABgAAD/2wBDAAIBAQIBAQICAgICAgICAwUDAwMDAwYEBAMFBwYHBwcGBwcICQsJCAgKCAcHCg0KCgsMDAwMBwkODw0MDgsMDAz/2wBDAQICAgMDAwYDAwYMCAcIDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAz/wAARCAABAAEDASIAAhEBAxEB/8QAHwAAAQUBAQEBAQEAAAAAAAAAAAECAwQFBgcICQoL/8QAtRAAAgEDAwIEAwUFBAQAAAF9AQIDAAQRBRIhMUEGE1FhByJxFDKBkaEII0KxwRVS0fAkM2JyggkKFhcYGRolJicoKSo0NTY3ODk6Q0RFRkdISUpTVFVWV1hZWmNkZWZnaGlqc3R1dnd4eXqDhIWGh4iJipKTlJWWl5iZmqKjpKWmp6ipqrKztLW2t7i5usLDxMXGx8jJytLT1NXW19jZ2uHi4+Tl5ufo6erx8vP09fb3+Pn6/8QAHwEAAwEBAQEBAQEBAQAAAAAAAAECAwQFBgcICQoL/8QAtREAAgECBAQDBAcFBAQAAQJ3AAECAxEEBSExBhJBUQdhcRMiMoEIFEKRobHBCSMzUvAVYnLRChYkNOEl8RcYGRomJygpKjU2Nzg5OkNERUZHSElKU1RVVldYWVpjZGVmZ2hpanN0dXZ3eHl6goOEhYaHiImKkpOUlZaXmJmaoqOkpaanqKmqsrO0tba3uLm6wsPExcbHyMnK0tPU1dbX2Nna4uPk5ebn6Onq8vP09fb3+Pn6/9oADAMBAAIRAxEAPwD9/KKKKAP/2Q==";
          rendered++;
        }
        if (rendered == imagesCount) {
          resolve(true);
        }
      });
    });
  });
}

function changeImgWidH(rootobj){
  return async function(node){
    if(node&&node.image){
      let imagesData = rootobj.images;
      let imgName = node.image
      let img;
      let dimensions;
      try{
        img = Buffer.from(imagesData[imgName].split(';base64,')[1], 'base64');
        dimensions = sizeOf(img);
      }catch(e){
        console.error(e)
      }
      let maxDim = 150;
      if(dimensions){
        if(dimensions.width > maxDim||dimensions.height > maxDim){
          if(dimensions.width>dimensions.height){
            node.width = maxDim;
            node.height = (dimensions.height/dimensions.width)*maxDim;
          }else if(dimensions.width<dimensions.height){
            node.height = maxDim;
            node.width = (dimensions.width/dimensions.height)*maxDim;
          }else{
            node.width = maxDim;
            node.height = maxDim;
          }
        }else{
          if(dimensions.width == 1&&dimensions.height == 1){
            node.width = 80;
            node.height = 80;
          }else{
            node.width = 10;
            node.height = 10;
          }
        }
      }else{
        node.width = 10;
        node.height = 10;
      }
    }
    return Promise.resolve(true)
  }
}

async function loppNodes(node,svgs,rootobj) {
  //await loopAndLoadMath(node,svgs);
  loopAndAddTableLayouts(node);
  await loopAndRunFunc(node,changeImgWidH(rootobj))
  return Promise.resolve(true);
}

exports.loppNodes = loppNodes

let loopAndRunFunc = async function loopAndRunFunc(obj, fn) {
  await fn(obj);
  if (obj instanceof Array) {
    for (let i = 0; i < obj.length; i++) {
      await loopAndRunFunc(obj[i], fn);
    }
  } else if (
    typeof obj == "string" ||
    typeof obj == "number" ||
    (obj && Object.keys(obj).length == 0) ||
    !obj ||
    typeof obj == "boolean" ||
    typeof obj == "function"
  ) {
    return Promise.resolve(true);
  } else if (obj.svgType && obj.svgType == "katex") {
    return Promise.resolve(true);
  } else if (Object.keys(obj).includes("table")) {
    await loopAndRunFunc(obj.table.body, fn);
  } else if (Object.keys(obj).length > 0) {
    let keys = Object.keys(obj);
    for (let i = 0; i < keys.length; i++) {
      await loopAndRunFunc(obj[keys[i]], fn);
    }
  } else {
    return Promise.resolve(true);
  }
}

exports.loopAndRunFunc = loopAndRunFunc

let loopAndLoadMath = async function loopAndLoadMath(obj,svgs) {
  if (obj instanceof Array) {
    for (let i = 0; i < obj.length; i++) {
      await loopAndLoadMath(obj[i],svgs);
    }
  } else if (
    typeof obj == "string" ||
    typeof obj == "number" ||
    (obj && Object.keys(obj).length == 0) ||
    !obj ||
    typeof obj == "boolean" ||
    typeof obj == "function"
  ) {
    return Promise.resolve(true);
  } else if (obj.svgType && obj.svgType == "katex") {
    return new Promise((resolve, reject) => {
      let katexFormula = obj.katexFormula;
      if (obj.katexType == "inline") {
        mathjax.typeset(
          {
            math: katexFormula,
            format: "inline-TeX",
            svg: true,
          },
           (result) => {
            obj.svg = result.svg;
            let matchgroups = obj.svg.toString().match(/ (width="[^("|\s)]+"|height="[^("|\s)]+"|style="[^(")]+")/gm);
            let svgwidth = matchgroups[0].match(/[\d.]+/gm)[0];
            let svgheight = matchgroups[1].match(/[\d.]+/gm)[0];
            let svgverticalalign = matchgroups[2].match(/[\d.]+/gm)[0];
            obj.svgwidth = svgwidth
            obj.svgheight = svgheight
            obj.svgverticalalign = svgverticalalign
            obj.inlinesvg = true;
            svgs.push(obj)
            resolve(true);
          }
        );
      } else if (obj.katexType == "block") {
        mathjax.typeset(
          {
            math: katexFormula,
            format: "TeX",
            svg: true,
          },
          (result) => {
            obj.svg = result.svg;
            let matchgroups = obj.svg.toString().match(/ (width="[^("|\s)]+"|height="[^("|\s)]+"|style="[^(")]+")/gm);
            let svgwidth = matchgroups[0].match(/[\d.]+/gm)[0];
            let svgheight = matchgroups[1].match(/[\d.]+/gm)[0];
            let svgverticalalign = matchgroups[2].match(/[\d.]+/gm)[0];
            obj.svgwidth = svgwidth
            obj.svgheight = svgheight
            obj.svgverticalalign = svgverticalalign
            svgs.push(obj)
            resolve(true);
          }
        );
      }
    });
  } else if (Object.keys(obj).includes("table")) {
    await loopAndLoadMath(obj.table.body,svgs);
  } else if (Object.keys(obj).length > 0) {
    let keys = Object.keys(obj);
    for (let i = 0; i < keys.length; i++) {
      await loopAndLoadMath(obj[keys[i]],svgs);
    }
  } else {
    return Promise.resolve(true);
  }
}

exports.loopAndLoadMath = loopAndLoadMath

let loopAndAddTableLayouts = function loopAndAddTableLayouts(obj) {
  if (obj instanceof Array) {
    obj.forEach((child) => {
      loopAndAddTableLayouts(child);
    });
  } else if (
    typeof obj == "string" ||
    typeof obj == "number" ||
    (obj && Object.keys(obj).length == 0) ||
    !obj ||
    typeof obj == "boolean"
  ) {
  } else if (Object.keys(obj).includes("table")) {
    if (obj.tableType && obj.tableType == "inlineImgTable") {
      obj.layout = {
        paddingLeft: (i, node) => {
          if (obj.alignment == "center") {
            return obj.fontSize / 8;
          } else if (obj.alignment == "right") {
            return obj.fontSize / 8;
          }
          return 0;
        },
        paddingRight: (i, nodeQWE) => {
          if (obj.alignment == "center") {
            return obj.fontSize / 8;
          } else if (obj.alignment == "right") {
            return obj.fontSize / 8;
          }
          return 0;
        },
        paddingTop: (i1, node) => {
          applyVerticalAlignmentv2(node, i1);
          return 0;
        },
        paddingBottom: function paddingBottom(i, node) {
          return 0;
        },
        hLineWidth: function hLineWidth(i) {
          return 0;
        },
        vLineWidth: function vLineWidth(i) {
          return 0;
        },
      };
    } else if (obj.tableType && obj.tableType == "figureContainer") {
      obj.pageBreak = 'before'
      obj.table.dontBreakRows = true;
      obj.layout = {
        paddingBottom: function paddingBottom(i, node) {
          return 0;
        },
        hLineWidth: function hLineWidth(i) {
          return 0;
        },
        vLineWidth: function vLineWidth(i) {
          return 0;
        },
      };
    } else if (obj.tableType && obj.tableType == "figureImagesContainer") {
      obj.layout = {
        paddingBottom: function paddingBottom(i, node) {
          return 0;
        },
        paddingTop: function paddingBottom(i1, node) {
          applyVerticalAlignment(node, i1, "center");
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
      };
    } else if (
      obj.tableType &&
      (obj.tableType == "taxonomicTable" || obj.tableType == "normalTable")
    ) {
      if(obj.tableType == "taxonomicTable"){
        obj.table.keepWithHeaderRows = 1;
        obj.table.headerRows = 1;
      }
      obj.table.dontBreakRows = true;
      obj.layout = {
        paddingBottom: function paddingBottom(i, node) {
          return 3;
        },
      };
    }
    loopAndAddTableLayouts(obj.table.body);
  } else if (Object.keys(obj).length > 0) {
    Object.keys(obj).forEach((key) => {
      loopAndAddTableLayouts(obj[key]);
    });
  }
}

exports.loopAndAddTableLayouts = loopAndAddTableLayouts