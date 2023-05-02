const { uuidv4 } = require('lib0/random');
const { parseGenericAttributes, getGenericAttributes, genericAttributtesToDom } = require('../helpers')


let math_inline = {
  group: "inline math",
  content: "text*",
  attrs: {
    ...getGenericAttributes(),
    math_id: { default: uuidv4() }
  },
  inline: true,
  marks: "",
  atom: true,
  parseDOM: [{
    tag: "math-inline", getAttrs(dom) {
      return {
        ...parseGenericAttributes(dom),
        math_id: dom.getAttribute('mathid')
      }
    }
  }],
  toDOM: (node) => {return ["math-inline", { class: "math-node", mathid: node.attrs.math_id, ...genericAttributtesToDom(node) }, 0]},
}

exports.math_inline = math_inline
let math_display = {
  group: "block math",
  content: "text*",
  atom: true,
  code: true,
  marks: "",
  attrs: {
    ...getGenericAttributes(),
    math_id: { default: uuidv4() }
  },
  parseDOM: [{
    tag: "math-display", getAttrs(dom) {
      return {
        ...parseGenericAttributes(dom),
        math_id: dom.getAttribute('mathid')
      }
    }
  }],
  toDOM: (node) => {
    return ["math-display", { class: "math-node", ...genericAttributtesToDom(node), mathid: node.attrs.math_id }, 0]
  },
}
exports.math_display = math_display

exports.MathNodes = {
  math_inline, math_display
}
