const helpers = require("../helpers")
let { genericAttributtesToDom, getGenericAttributes, parseGenericAttributes } = helpers
// :: Object
// [Specs](#model.NodeSpec) for the nodes defined in this schema.


var emDOM = ["em", 0], strongDOM = ["strong", 0], codeDOM = ["code", 0];

// :: Object [Specs](#model.MarkSpec) for the marks in the schema.
exports.marks = {
  // :: MarkSpec A link. Has `href` and `title` attributes. `title`
  // defaults to the empty string. Rendered and parsed as an `<a>`
  // element.
  link: {
    attrs: {
      href: {},
      download: {default: null},
      title: { default: null },
      ...getGenericAttributes(),
    },
    inclusive: false,
    parseDOM: [{
      tag: "a[href]", getAttrs: function getAttrs(dom) {
        return { href: dom.getAttribute("href"), title: dom.getAttribute("title"), download: dom.getAttribute("download"),...parseGenericAttributes(dom) }
      }
    }],
    toDOM: function toDOM(node) {
      var ref = node.attrs;
      var href = ref.href;
      var download = ref.download;
      var title = ref.title; return ["a", { href: href, title: title, download: download,...genericAttributtesToDom(node) }, 0]
    }
  },

  // :: MarkSpec An emphasis mark. Rendered as an `<em>` element.
  // Has parse rules that also match `<i>` and `font-style: italic`.
  em: {
    parseDOM: [{ tag: "i" }, { tag: "em" }, { style: "font-style=italic" }],
    toDOM: function toDOM() { return emDOM }
  },

  // :: MarkSpec A strong mark. Rendered as `<strong>`, parse rules
  // also match `<b>` and `font-weight: bold`.
  strong: {
    parseDOM: [{ tag: "strong" },
    // This works around a Google Docs misbehavior where
    // pasted content will be inexplicably wrapped in `<b>`
    // tags with a font-weight normal.
    //@ts-ignore
    { tag: "b", getAttrs: function (node) { return node.style.fontWeight != "normal" && null; } },
    { style: "font-weight", getAttrs: function (value) { return /^(bold(er)?|[5-9]\d{2,})$/.test(value) && null; } }],
    toDOM: function toDOM() { return strongDOM }
  },

  // :: MarkSpec Code font mark. Represented as a `<code>` element.
  code: {
    parseDOM: [{ tag: "code" }],
    toDOM: function toDOM() { return codeDOM }
  }
};

// :: Schema
// This schema roughly corresponds to the document schema used by
// [CommonMark](http://commonmark.org/), minus the list elements,
// which are defined in the [`prosemirror-schema-list`](#schema-list)
// module.
//
// To reuse elements from this schema, extend or read from its
// `spec.nodes` and `spec.marks` [properties](#model.Schema.spec).


//# sourceMappingURL=index.js.map
