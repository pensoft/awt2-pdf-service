/* eslint-disable prettier/prettier */
const { parseGenericAttributes, getGenericAttributes, genericAttributtesToDom }  = require('../helpers');




const tables_nodes_container = {
  content: "block*",
  group: 'block',
  inline: false,
  isolating: true,

  attrs: {
    containerid: { default: '' },
    ...getGenericAttributes(),
  },
  parseDOM: [{
    tag: "tables-nodes-container", getAttrs(dom) {
      return {
        containerid: dom.getAttribute('containerid'),
        ...parseGenericAttributes(dom)
      }
    }
  }],
  toDOM(node) {
    return ["tables-nodes-container", {
      'containerid': node.attrs.containerid,
      ...genericAttributtesToDom(node)
    }, 0]
  }
}

const block_table = {
  group: 'block',
  content: "block+",
  inline: false,
  isolating: true,
  attrs: {
    table_number: {},
    table_id: {},
    viewed_by_citat: { default: "" },
    ...getGenericAttributes(),
  },
  parseDOM: [{
    tag: "block-table", getAttrs(dom) {
      return {
        table_number: dom.getAttribute('table_number'),
        table_id: dom.getAttribute('table_id'),
        viewed_by_citat: dom.getAttribute('viewed_by_citat'),
        ...parseGenericAttributes(dom)
      }
    }
  }],
  toDOM(node) {
    return ["block-table", {
      'table_number': node.attrs.table_number,
      'table_id': node.attrs.table_id,
      'viewed_by_citat': node.attrs.viewed_by_citat,
      ...genericAttributtesToDom(node)
    }, 0]
  }
}

const table_header_container = {
  group: 'block',
  content: "table_description+",
  isolating: true,
  inline: false,
  attrs: {
    ...getGenericAttributes(),
  },
  parseDOM: [{
    tag: "table-header-container", getAttrs(dom) {
      return {
        ...parseGenericAttributes(dom)
      }
    }
  }],
  toDOM(node) {
    return ["table-header-container", {
      ...genericAttributtesToDom(node)
    }, 0]
  }
}

const table_footer_container = {
  group: 'block',
  content: "table_description+",
  isolating: true,
  inline: false,
  attrs: {
    ...getGenericAttributes(),
  },
  parseDOM: [{
    tag: "table-footer-container", getAttrs(dom) {
      return {
        ...parseGenericAttributes(dom)
      }
    }
  }],
  toDOM(node) {
    return ["table-footer-container", {
      ...genericAttributtesToDom(node)
    }, 0]
  }
}

const table_description = {
  content: "block+",
  group: "paragraph",
  isolating: true,
  inline: false,
  attrs: {
    ...getGenericAttributes()
  },
  parseDOM: [{
    tag: "table-description", getAttrs(dom) {
      return {
        ...parseGenericAttributes(dom),
      }
    },
  }],
  toDOM(node) {
    let attributesToDom = {
      ...genericAttributtesToDom(node),
      style: 'display:block;'

    }
    return ["table-description", attributesToDom, 0];
  }
}

const table_container = {
  content: "table*",
  group: "block",
  isolating: true,
  inline: false,
  attrs: {
    ...getGenericAttributes()
  },
  parseDOM: [{
    tag: "table-container", getAttrs(dom) {
      return {
        ...parseGenericAttributes(dom),
      }
    },
  }],
  toDOM(node) {
    let attributesToDom = {
      ...genericAttributtesToDom(node),
      style: 'display:block;'

    }
    return ["table-container", attributesToDom, 0];
  }
}

const table_content = {
  content: "table_container",
  group: "block",
  isolating: true,
  inline: false,
  attrs: {
    ...getGenericAttributes()
  },
  parseDOM: [{
    tag: "table-content", getAttrs(dom) {
      return {
        ...parseGenericAttributes(dom),
      }
    },
  }],
  toDOM(node) {
    let attributesToDom = {
      ...genericAttributtesToDom(node),
      style: 'display:block;'

    }
    return ["table-content", attributesToDom, 0];
  }
}




exports.citableTableNodes = {
  tables_nodes_container,
  block_table,
  table_header_container,
  table_footer_container,
  table_description,
  table_content,
  table_container,
}

