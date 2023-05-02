const {
  parseGenericAttributes,
  getGenericAttributes,
  genericAttributtesToDom,
} = require('../helpers');

const supplementary_files_nodes_container = {
  content: "block*",
  group: 'block',
  inline: false,
  isolating: true,
  attrs: {
    containerid: { default: '' },
    ...getGenericAttributes(),
  },
  parseDOM: [{
    tag: "supplementary-files-nodes-container", getAttrs(dom) {
      return {
        containerid: dom.getAttribute('containerid'),
        ...parseGenericAttributes(dom)
      }
    }
  }],
  toDOM(node) {
    return ["supplementary-files-nodes-container", {
      'containerid': node.attrs.containerid,
      ...genericAttributtesToDom(node)
    }, 0]
  }
}
exports.supplementary_files_nodes_container = supplementary_files_nodes_container;

const block_supplementary_file = {
  group: 'block',
  content: "block+",
  inline: false,
  isolating: true,
  attrs: {
    supplementary_file_number: {},
    supplementary_file_id: {},
    viewed_by_citat: { default: "" },
    ...getGenericAttributes(),
  },
  parseDOM: [{
    tag: "block-supplementary-file", getAttrs(dom) {
      return {
        supplementary_file_number: dom.getAttribute('supplementary_file_number'),
        supplementary_file_id: dom.getAttribute('supplementary_file_id'),
        viewed_by_citat: dom.getAttribute('viewed_by_citat'),
        ...parseGenericAttributes(dom)
      }
    }
  }],
  toDOM(node) {
    return ["block-supplementary-file", {
      'supplementary_file_number': node.attrs.supplementary_file_number,
      'supplementary_file_id': node.attrs.supplementary_file_id,
      'viewed_by_citat': node.attrs.viewed_by_citat,
      ...genericAttributtesToDom(node)
    }, 0]
  }
}
exports.block_supplementary_file = block_supplementary_file;

const supplementary_file_title = {
  group: 'block',
  content: "block+",
  isolating: true,
  inline: false,
  attrs: {
    ...getGenericAttributes(),
  },
  parseDOM: [{
    tag: "supplementary-file-title", getAttrs(dom) {
      return {
        ...parseGenericAttributes(dom)
      }
    }
  }],
  toDOM(node) {
    return ["supplementary-file-title", {
      ...genericAttributtesToDom(node)
    }, 0]
  }
}
exports.supplementary_file_title = supplementary_file_title;

const supplementary_file_authors = {
  group: 'block',
  content: "block+",
  isolating: true,
  inline: false,
  attrs: {
    ...getGenericAttributes(),
  },
  parseDOM: [{
    tag: "supplementary-file-authors", getAttrs(dom) {
      return {
        ...parseGenericAttributes(dom)
      }
    }
  }],
  toDOM(node) {
    return ["supplementary-file-authors", {
      ...genericAttributtesToDom(node)
    }, 0]
  }
}
exports.supplementary_file_authors = supplementary_file_authors;

const supplementary_file_data_type = {
  group: 'block',
  content: "block+",
  isolating: true,
  inline: false,
  attrs: {
    ...getGenericAttributes(),
  },
  parseDOM: [{
    tag: "supplementary-file-data-type", getAttrs(dom) {
      return {
        ...parseGenericAttributes(dom)
      }
    }
  }],
  toDOM(node) {
    return ["supplementary-file-data-type", {
      ...genericAttributtesToDom(node)
    }, 0]
  }
}
exports.supplementary_file_data_type = supplementary_file_data_type;

const supplementary_file_brief_description = {
  group: 'block',
  content: "block+",
  isolating: true,
  inline: false,
  attrs: {
    ...getGenericAttributes(),
  },
  parseDOM: [{
    tag: "supplementary-file-brief-description", getAttrs(dom) {
      return {
        ...parseGenericAttributes(dom)
      }
    }
  }],
  toDOM(node) {
    return ["supplementary-file-brief-description", {
      ...genericAttributtesToDom(node)
    }, 0]
  }
}
exports.supplementary_file_brief_description = supplementary_file_brief_description;

const supplementary_file_url = {
  group: 'block',
  content: "block+",
  isolating: true,
  inline: false,
  attrs: {
    ...getGenericAttributes(),
  },
  parseDOM: [{
    tag: "supplementary-file-url", getAttrs(dom) {
      return {
        ...parseGenericAttributes(dom)
      }
    }
  }],
  toDOM(node) {
    return ["supplementary-file-url", {
      ...genericAttributtesToDom(node)
    }, 0]
  }
}
exports.supplementary_file_url = supplementary_file_url;

exports.supplementaryFileNodes = {
  supplementary_files_nodes_container,
  block_supplementary_file,
  supplementary_file_title,
  supplementary_file_authors,
  supplementary_file_data_type,
  supplementary_file_brief_description,
  supplementary_file_url,
}

