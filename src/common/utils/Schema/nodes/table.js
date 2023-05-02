/* eslint-disable prettier/prettier */
const { parseGenericAttributes, getGenericAttributes, genericAttributtesToDom }  = require('../helpers')

function getCellAttrs(dom, extraAttrs) {
    var widthAttr = dom.getAttribute("data-colwidth");
    var widths = widthAttr && /^\d+(,\d+)*$/.test(widthAttr) ? widthAttr.split(",").map(function (s) {
        return Number(s);
    }) : null;
    var colspan = Number(dom.getAttribute("colspan") || 1);
    var result = {
        colspan: colspan,
        rowspan: Number(dom.getAttribute("rowspan") || 1),
        colwidth: widths && widths.length == colspan ? widths : null,
        ...parseGenericAttributes(dom),
        tablewidth : dom.getAttribute('tablewidth')
    };
    for (var prop in extraAttrs) {
        var getter = extraAttrs[prop].getFromDOM;
        var value = getter && getter(dom);
        if (value != null) {
            result[prop] = value;
        }
    }
    return result
}

function setCellAttrs(node, extraAttrs) {
    var attrs = {
        ...genericAttributtesToDom(node),
        tablewidth : node.attrs.tablewidth
    };
    if (node.attrs.colspan != 1) {
        attrs.colspan = node.attrs.colspan;
    }
    if (node.attrs.rowspan != 1) {
        attrs.rowspan = node.attrs.rowspan;
    }
    if (node.attrs.colwidth) {
        attrs["data-colwidth"] = node.attrs.colwidth.join(",");
    }
    for (var prop in extraAttrs) {
        var setter = extraAttrs[prop].setDOMAttr;
        if (setter) {
            setter(node.attrs[prop], attrs);
        }
    }
    return attrs
}

let tableNodes = function(options) {
    var extraAttrs = options.cellAttributes || {};
    var cellAttrs = {
        colspan: { default: 1 },
        rowspan: { default: 1 },
        colwidth: { default: null },
        ...getGenericAttributes(),
    };
    for (var prop in extraAttrs) {
        cellAttrs[prop] = { default: extraAttrs[prop].default };
    }

    return {
        table: {
            content: "table_row+",
            tableRole: "table",
            isolating: true,
            attrs: {
                ...getGenericAttributes(),
            },
            group: options.tableGroup,
            parseDOM: [{
                tag: "table", getAttrs(dom) {
                    let attrs = {...parseGenericAttributes(dom)}
                    return attrs
                }
            }],
            toDOM(node) {
                let attrs = {...genericAttributtesToDom(node)}
                return ["table", attrs, ["tbody",attrs, 0]]
            }
        },
        table_row: {
            content: "(table_cell | table_header)*",
            tableRole: "row",
            attrs: {
                ...getGenericAttributes(),
                tablewidth:{default:0},
            },
            parseDOM: [{
                tag: "tr", getAttrs(dom) {
                    return {
                        ...parseGenericAttributes(dom),
                        tablewidth : dom.getAttribute('tablewidth')
                    }
                }
            }],
            toDOM: function toDOM(node) {
                return ["tr", {
                    ...genericAttributtesToDom(node),
                    tablewidth : node.attrs.tablewidth
                }, 0]
            }
        },
        table_cell: {
            content: options.cellContent,
            attrs: {...cellAttrs,tablewidth:{default:0}},
            tableRole: "cell",
            selectable:false,
            isolating: true,
            parseDOM: [{
                tag: "td", getAttrs: function (dom) {
                    return getCellAttrs(dom, extraAttrs);
                }
            }],
            toDOM: function toDOM(node) {
                return ["td", setCellAttrs(node, extraAttrs), 0]
            }
        },
        table_header: {
            content: options.cellContent,
            attrs: cellAttrs,
            tableRole: "header_cell",
            isolating: true,
            parseDOM: [{
                tag: "th", getAttrs: function (dom) {
                    return getCellAttrs(dom, extraAttrs);
                }
            }],
            toDOM: function toDOM(node) {
                return ["th", setCellAttrs(node, extraAttrs), 0]
            }
        }
    }
}

exports.tableNodes = tableNodes

exports.TableNodesBuild = tableNodes({
    tableGroup: "block",
    cellContent: "block+",
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
})