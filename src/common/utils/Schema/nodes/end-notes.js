const {
  parseGenericAttributes,
  getGenericAttributes,
  genericAttributtesToDom,
} = require('../helpers');

const end_notes_nodes_container = {
  content: "block*",
  group: 'block',
  inline: false,
  isolating: true,
  attrs: {
    containerid: { default: '' },
    ...getGenericAttributes(),
  },
  parseDOM: [{
    tag: "end-notes-nodes-container", getAttrs(dom) {
      return {
        containerid: dom.getAttribute('containerid'),
        ...parseGenericAttributes(dom)
      }
    }
  }],
  toDOM(node) {
    return ["end-notes-nodes-container", {
      'containerid': node.attrs.containerid,
      ...genericAttributtesToDom(node)
    }, 0]
  }
}
exports.end_notes_nodes_container = end_notes_nodes_container;

const block_end_note = {
  group: 'block',
  content: "block+",
  inline: false,
  isolating: true,
  attrs: {
    end_note_number: {},
    end_note_id: {},
    viewed_by_citat: { default: "" },
    ...getGenericAttributes(),
  },
  parseDOM: [{
    tag: "block-end-note", getAttrs(dom) {
      return {
        end_note_number: dom.getAttribute('end_note_number'),
        end_note_id: dom.getAttribute('end_note_id'),
        viewed_by_citat: dom.getAttribute('viewed_by_citat'),
        ...parseGenericAttributes(dom)
      }
    }
  }],
  toDOM(node) {
    return ["block-end-note", {
      'end_note_number': node.attrs.end_note_number,
      'end_note_id': node.attrs.end_note_id,
      'viewed_by_citat': node.attrs.viewed_by_citat,
      ...genericAttributtesToDom(node)
    }, 0]
  }
}
exports.block_end_note = block_end_note;

const end_note = {
  group: 'block',
  content: "block+",
  isolating: true,
  inline: false,
  attrs: {
    ...getGenericAttributes(),
  },
  parseDOM: [{
    tag: "end-note", getAttrs(dom) {
      return {
        ...parseGenericAttributes(dom)
      }
    }
  }],
  toDOM(node) {
    return ["end-note", {
      ...genericAttributtesToDom(node)
    }, 0]
  }
}
exports.end_note = end_note;

exports.endNotesNodes = {
  end_notes_nodes_container,
  block_end_note,
  end_note,
}
