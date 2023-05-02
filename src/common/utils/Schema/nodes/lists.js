const { parseGenericAttributes, getGenericAttributes, genericAttributtesToDom }  = require('../helpers')


let ordered_list = {
    content: "list_item+",
    group: 'block',
    attrs: {
        order: { default: 1 },
        ...getGenericAttributes(),
    },
    parseDOM: [{
        tag: "ol", getAttrs(dom) {
            return {
                order: dom.hasAttribute("start") ? +dom.getAttribute("start") : 1 ,
                ...parseGenericAttributes(dom)
            }
        }
    }],
    toDOM(node) {
        return node.attrs.order == 1 ? ["ol", {
            ...genericAttributtesToDom(node)
        }, 0] : ["ol", {
            start: node.attrs.order ,
            ...genericAttributtesToDom(node)
        }, 0]
    }
}

exports.ordered_list = ordered_list
let bullet_list = {
    group: 'block',
    content: "list_item+",
    attrs:{
        ...getGenericAttributes(),
    },
    parseDOM: [{ tag: "ul" ,getAttrs(dom){
        return{
            ...parseGenericAttributes(dom)
        }
    }}],
    toDOM(node) {
        return ["ul", {
            ...genericAttributtesToDom(node)
        },0]
    }
}
exports.bullet_list = bullet_list
let list_item = {
    content: "block*",
    attrs:{
        ...getGenericAttributes(),
    },
    parseDOM: [{ tag: "li" ,getAttrs(dom){
        return{
            ...parseGenericAttributes(dom)
        }
    }}],
    toDOM(node) {
        return ["li", {
            ...genericAttributtesToDom(node)
        },0]
    },
    defining: true
}
exports.list_item = list_item

exports.listNodes = {
    list_item,bullet_list,ordered_list
}
