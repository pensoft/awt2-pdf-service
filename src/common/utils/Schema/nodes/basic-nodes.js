const { parseGenericAttributes, getGenericAttributes, genericAttributtesToDom }  = require('../helpers')
exports.nodes = {
    blockquote: {
        content: "block+",
        group: "block",
        attrs:{
            ...getGenericAttributes()
        },
        defining: true,
        parseDOM: [{ tag: "blockquote" ,getAttrs: (dom) => {
            return {
                ...parseGenericAttributes(dom),
            };
        }}],
        toDOM: function toDOM(node) { return ["blockquote",{...genericAttributtesToDom(node)},0] }
    },
    horizontal_rule: {
        group: "block",
        attrs:{
            ...getGenericAttributes()
        },
        parseDOM: [{ tag: "hr" ,getAttrs: (dom) => {
            return {
                ...parseGenericAttributes(dom),
            };
        }}],
        toDOM: function toDOM(node) { return ["hr",{...genericAttributtesToDom(node)}] }
    },
    heading: {
        attrs: { tagName: { default: 'H1' },...getGenericAttributes() },
        content: "paragraph*",
        group: "block",
        defining: true,
        parseDOM: (function () {
            return ['H1','H2','H3','H4','H5','H6'].map((tagName) => {
                return {
                    tag: tagName,
                    getAttrs: (dom) => {
                        return {
                            ...parseGenericAttributes(dom),
                            tagName: dom.tagName
                        };
                    }
                }
            });
        })(),
        toDOM: function toDOM(node) { return [node.attrs.tagName,{...genericAttributtesToDom(node)}, 0] }
    },
    code_block: {
        content: "inline*",
        attrs:{
            ...getGenericAttributes()
        },
        marks: "",
        group: "block",
        code: true,
        defining: true,
        parseDOM: [{ tag: "pre", preserveWhitespace: "full" ,getAttrs(dom) {
            return {
                ...parseGenericAttributes(dom),
            }
        }}],
        toDOM: function toDOM(node) { return ["pre", {...genericAttributtesToDom(node)},["code", 0]] }
    },

    hard_break: {
        inline: true,
        group: "inline",
        attrs:{
            ...getGenericAttributes()
        },
        selectable: false,
        parseDOM: [{ tag: "br" ,getAttrs(dom) {
            return {
                ...parseGenericAttributes(dom),
            }
        }}],
        toDOM(node) { return ["br",{...genericAttributtesToDom(node)}] }
    },
    page_break:{
      group: "block",
      content:'block*',
      attrs:{
          ...getGenericAttributes()
      },
      selectable: false,
      parseDOM: [{ tag: "page-break" ,getAttrs(dom) {
          return {
              ...parseGenericAttributes(dom),
          }
      }}],
      toDOM(node) { return ["page-break",{...genericAttributtesToDom(node)},0] }
    },
    spacer:{
        inline: false,
        group: "block",
        attrs:{
            ...getGenericAttributes()
        },
        selectable: false,
        parseDOM: [{ tag: "spacer" ,getAttrs(dom) {
            return {
                ...parseGenericAttributes(dom),
            }
        }}],
        toDOM(node) { return ["spacer",{...genericAttributtesToDom(node)}] }
    }
};

