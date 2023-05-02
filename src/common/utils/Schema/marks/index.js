const { trackChangesMarks } = require('./trackChangesMarks');
const { comment, overlapComment } = require('./comment');
const { taxon } = require('./taxon-nodes');
const basicmarks  = require('./basic-marks').marks;
const delFromPopup = require("./trackChangesMarks/delFromPopupMark").delFromPopup;
const insFromPopup = require("./trackChangesMarks/insFromPopup").insFromPopup;
const citation = require("./trackChangesMarks/citation").citation;
const table_citation = require("./trackChangesMarks/table-citation").table_citation;
const end_note_citation = require('./trackChangesMarks/end-note-citation').end_note_citation;
const supplementary_file_citation = require('./trackChangesMarks/supplementary-file-citation').supplementary_file_citation;
const calcYChangeStyle = (ychange) => {
    switch (ychange.type) {
        case 'removed':
            return `color:${ychange.color.dark}`
        case 'added':
            return `background-color:${ychange.color.light}`
        case null:
            return ''
    }
}

const hoverWrapper = (ychange, els) =>
  ychange === null ? els : [['span', { class: 'ychange-hover', style: `background-color:${ychange.color.dark}` }, ychange.user || 'Unknown'], ['span', ...els]]


const calcYchangeDomAttrs = (attrs, domAttrs = {}) => {
    domAttrs = Object.assign({}, domAttrs)
    if (attrs.ychange !== null) {
        domAttrs.ychange_user = attrs.ychange.user
        domAttrs.ychange_type = attrs.ychange.type
        domAttrs.ychange_color = attrs.ychange.color.light
        domAttrs.style = calcYChangeStyle(attrs.ychange)
    }
    return domAttrs
}

exports.marks = {
    math_select: {
        toDOM() {
            return ["math-select", 0]
        },
        parseDOM: [{ tag: "math-select" }]
    },
    subscript: {
        toDOM() {
            return ["sub", 0]
        },
        parseDOM: [{ tag: "sub" }]
    },
    superscript: {
        toDOM() {
            return ["sup", 0]
        },
        parseDOM: [{ tag: "sup" }]
    },
    comment,
    overlapComment,
    ...trackChangesMarks,
    delFromPopup,
    table_citation,
    insFromPopup,
    end_note_citation,
    taxon,
    citation,
    supplementary_file_citation,
    ...basicmarks,
    invalid: {

        parseDOM: [
            { tag: 'div.invalid' },
        ],
        toDOM(node) {
            return [
                'div',
                {
                    class: 'invalid',
                },
            ];
        },
    },
    anchorTag: {
        attrs: {
            class: { default: 'anchor_tag' },
            id: {},
        },
        inclusive: false,
        parseDOM: [{
            tag: "span.anchor_tag", getAttrs(dom) {
                return { id: dom.getAttribute("id"), class: dom.getAttribute('class') }
            }
        }],
        toDOM(node) {
            return ["span", { id: node.attrs.id, class: node.attrs.class }, 0]
        }
    },
    underline: {
        parseDOM: [{ tag: 'u' }, { style: 'text-decoration=underline' }],
        toDOM() {
            return ['u', 0]
        },
    },
    ychange: {
        attrs: {
            user: { default: null },
            type: { default: null },
            color: { default: null }
        },
        inclusive: false,
        parseDOM: [{ tag: 'ychange' }],
        toDOM(node) {
            return ['ychange', { ychange_user: node.attrs.user, ychange_type: node.attrs.type, style: calcYChangeStyle(node.attrs), ychange_color: node.attrs.color.light }, ...hoverWrapper(node.attrs, [0])]
        }
    }
}