/* eslint-disable prettier/prettier */
const { NodeSpec } = require('prosemirror-model');
const { MathNodes } = require('./math');
const { tableNodes } = require('./table');
const {citableTableNodes} = require('./citable-tables');
const { listNodes } = require('./lists');
const basicNodes = require('./basic-nodes').nodes;
const { figureNodes } = require('./figure-nodes');
const { parseGenericAttributes, getGenericAttributes, genericAttributtesToDom }  = require('../helpers');
const { endNotesNodes } = require('./end-notes');
const { supplementaryFileNodes } = require('./supplementary-files')
const { reference_block_container, reference_citation, reference_citation_end, reference_container } = require('./ref-nodes')


const paragraph = {
  content: "inline*",
  group: 'block',
  attrs: {
    align: { default: 'set-align-left' },
    ...getGenericAttributes()
  },
  parseDOM: [{
    tag: "p", getAttrs(dom) {
      let classArray = dom.getAttribute('class')
      return {
        align: classArray,
        ...parseGenericAttributes(dom)
      }
    },
  }],
  toDOM(node) {
    let attributesToDom = {
      ...genericAttributtesToDom(node)
    }

    attributesToDom['class'] = node.attrs.align

    return ["p", attributesToDom, 0];
  }
}

const form_field_inline = {
  content: "inline*",
  group: "block",
  isolating: true,
  attrs: {
    ...getGenericAttributes()
  },
  parseDOM: [{
    tag: "form-field-inline", getAttrs(dom) {
      return {
        ...parseGenericAttributes(dom),

      }
    },
  }],
  toDOM(node) {
    let attributesToDom = {
      ...genericAttributtesToDom(node),

    }
    return ["form-field-inline", attributesToDom, 0];
  }
}

const form_field_inline_view = {
  content: "block*",
  group: "block",
  isolating: true,
  attrs: {
    ...getGenericAttributes()
  },
  parseDOM: [{
    tag: "form-field-inline-view", getAttrs(dom) {
      return {
        ...parseGenericAttributes(dom),
      }
    },
  }],
  toDOM(node) {
    let attributesToDom = {
      ...genericAttributtesToDom(node),

    }
    return ["form-field-inline-view", attributesToDom, 0];
  }
}

const form_field = {
  content: "(paragraph|block)+",
  group: "block",
  isolating: true,
  attrs: {
    ...getGenericAttributes()
  },
  parseDOM: [{
    tag: "form-field", getAttrs(dom) {
      return {
        ...parseGenericAttributes(dom),
      }
    },
  }],
  toDOM(node) {
    let attributesToDom = {
      ...genericAttributtesToDom(node),

    }
    return ["form-field", attributesToDom, 0];
  }
}

const inline_block_container = {
  content: "block+",
  group: "block",
  attrs: {
    ...getGenericAttributes()
  },
  parseDOM: [{
    tag: "inline-block-container", getAttrs(dom) {
      return {
        ...parseGenericAttributes(dom),
      }
    },
  }],
  toDOM(node) {
    let attributesToDom = {
      ...genericAttributtesToDom(node),
    }
    return ["inline-block-container", attributesToDom, 0];
  }
}

exports.nodes = {
  doc: {
    content: "block*"
  },
  form_field,
  inline_block_container,
  paragraph,
  form_field_inline,
  form_field_inline_view,
  reference_citation,
  reference_citation_end,
  reference_container,
  reference_block_container,
  ...tableNodes({
    tableGroup: "block",
    cellContent: "form_field{1}",
    cellAttributes: {
      background: {
        default: null,
        getFromDOM(dom) {
          return dom.style.backgroundColor || null
        },
        setDOMAttr(value, attrs) {
          if (value) attrs.style = (attrs.style || "") + `background-color: ${value};`
        }
      }
    }
  }),
  ...figureNodes,
  ...citableTableNodes,
  ...supplementaryFileNodes,
  ...endNotesNodes,
  text: {
    inline: true,
    group: "inline"
  },
  ...basicNodes,
  ...MathNodes,
  ...listNodes,
}



