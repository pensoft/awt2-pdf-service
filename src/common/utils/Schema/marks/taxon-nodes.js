exports.taxon = {
  attrs: {
    class: { default: 'taxon' },
    taxmarkid: { default: '' },
    removedtaxon: { deafult: 'false' },
  },
  inclusive: false,
  excludes:"_",
  parseDOM: [{
    tag: 'span.taxon',
    getAttrs(dom) {
      return {
        class: dom.getAttribute('class'),
        taxmarkid: dom.getAttribute('taxmarkid'),
        taxonid: dom.getAttribute('taxonid'),
        removedtaxon: dom.getAttribute('removedtaxon'),
      }
    },
  }],
  toDOM(node) {
    return [
      'span',
      {
        class: node.attrs.class,
        'taxmarkid': node.attrs.taxmarkid,
        'taxonid': node.attrs.taxonid,
        'removedtaxon': node.attrs.removedtaxon
      },
    ];
  },
};
