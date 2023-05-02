const { parseGenericAttributes, getGenericAttributes, genericAttributtesToDom } = require('../helpers')

exports.reference_citation = {
  content: "inline",
  group: "inline",
  inline:true,
  isolating: true,
  attrs: {
    ...getGenericAttributes(),
    refCitationID:{default:''},
    citedRefsIds:{default:[]},
    nonexistingelement:{ default:'false' },
  },
  parseDOM: [{
    tag: "reference-citation", getAttrs(dom) {
      return {
        ...parseGenericAttributes(dom),
        nonexistingelement: dom.getAttribute('nonexistingelement'),
        refCitationID : dom.getAttribute('refCitationID'),
        citedRefsIds : dom.getAttribute('citedRefsIds')?dom.getAttribute('citedRefsIds').split(','):[],
      }
    },
  }],
  toDOM(node) {
    let attributesToDom = {
      ...genericAttributtesToDom(node),
      refCitationID:node.attrs.refCitationID,
      "nonexistingelement": node.attrs.nonexistingelement,
      citedRefsIds:node.attrs.citedRefsIds.join(','),
    }
    return ["reference-citation", attributesToDom, 0];
  }
}

exports.reference_container = {
  content: "block*",
  group: "block",
  attrs: {
    ...getGenericAttributes({contenteditableNode: { default: false }}),
  },
  parseDOM: [{
    tag: "ul.reference-container", getAttrs(dom) {
      return {
        ...parseGenericAttributes(dom),
      }
    },
  }],
  toDOM(node) {
    let attributesToDom = {
      class:'reference-container',
      ...genericAttributtesToDom(node),
    }
    return ["ul", attributesToDom, 0];
  }
}

exports.reference_block_container = {
  content: "block*",
  group: "block",
  attrs: {
    ...getGenericAttributes({contenteditableNode: { default: false }}),
  },
  parseDOM: [{
    tag: "li.reference-block-container", getAttrs(dom) {
      return {
        ...parseGenericAttributes(dom),
      }
    },
  }],
  toDOM(node) {
    let attributesToDom = {
      class:'reference-block-container',
      ...genericAttributtesToDom(node),
    }
    return ["li", attributesToDom, 0];
  }
}

exports.reference_citation_end = {
  content: "inline*",
  group: "block",
  attrs: {
    ...getGenericAttributes({contenteditableNode: { default: false }}),
    refInstance:{default:'local'},
    refCitationID:{default:''},
    referenceData:{default:''},
    referenceStyle:{default:''},
    referenceType:{default:''},
  },
  parseDOM: [{
    tag: "reference-citation-end", getAttrs(dom) {
      let refData = dom.getAttribute('referencedata').split('|!|');
      let refStyle = dom.getAttribute('referencestyle').split('|!|');
      let refType = dom.getAttribute('referencetype').split('|!|');

      let referenceData = {refId:refData[0],last_modified:refData[1]}
      let referenceStyle = {name:refStyle[0],last_modified:refStyle[1]}
      let referenceType = {name:refType[0],last_modified:refType[1]}
      return {
        ...parseGenericAttributes(dom),
        refCitationID : dom.getAttribute('refCitationID'),
        referenceData,
        referenceStyle,
        referenceType,
      }
    },
  }],
  toDOM(node) {
    let referenceData = node.attrs.referenceData.refId+'|!|'+node.attrs.referenceData.last_modified
    let referenceStyle = node.attrs.referenceStyle.name+'|!|'+node.attrs.referenceStyle.last_modified
    let referenceType = node.attrs.referenceType.name+'|!|'+node.attrs.referenceType.last_modified
    let attributesToDom = {
      ...genericAttributtesToDom(node),
      refCitationID:node.attrs.refCitationID,
      referenceData,
      referenceStyle,
      referenceType
    }
    return ["reference-citation-end", attributesToDom, 0];
  }
}