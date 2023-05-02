const insFromPopup = {
  attrs: {
    class: { default: 'ins-from-popup' },
    id: { default: '' },
    user: { default: 0 },
    username: { default: '' },
    date: { default: 0 },
    group: { default: '' },
    viewid: { default: '' },
    style: { default: null },
  },
  inclusive: false,
  group: 'track',
  parseDOM: [{
    tag: "span.ins-from-popup", getAttrs(dom) {
      return {
        src: dom.getAttribute('class'),
        style: dom.getAttribute('style'),
        id: dom.dataset.id,
        user: dom.dataset.user,
        username: dom.dataset.username,
        date: parseInt(dom.dataset.date),
        group: dom.dataset.group,
        viewid: dom.dataset.viewid,
      }
    }
  }],
  toDOM(node) {
    return ["span", {
      class: node.attrs.class,
      'data-id': node.attrs.id,
      'data-user': node.attrs.user,
      'data-username': node.attrs.username,
      'data-date': node.attrs.date,
      'data-group': node.attrs.group,
      'data-viewid': node.attrs.viewid,
      style: node.attrs.style,
    }]
  }
};

exports.insFromPopup = insFromPopup;
