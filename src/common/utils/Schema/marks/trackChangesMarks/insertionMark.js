exports.insertion = {
  attrs: {
    class: { default: 'insertion' },
    id: { default: '' },
    user: { default: 0 },
    username: { default: '' },
    userColor: { default: ''},
    userContrastColor: { default: '' },
    date: { default: 0 },
    group: { default: '' },
    viewid: { default: '' },
    style: { default: null },
    connectedTo: { default: '' },
  },
  inclusive: false,
  group: 'track',
  parseDOM: [{
    tag: "span.insertion", 
    getAttrs(dom) {
      let styleArr = dom.getAttribute('style').split(';')
      return {
        src: dom.getAttribute('class'),
        style: dom.getAttribute('style').split(';color ')[0],
        id: dom.dataset.id,
        userColor: dom.getAttribute('usercolor'),
        userContrastColor: dom.getAttribute('usercontrastcolor'),
        user: dom.getAttribute('user'),
        username: dom.dataset.username,
        date: parseInt(dom.dataset.date),
        group: dom.dataset.group,
        viewid: dom.dataset.viewid,
        connectedTo: dom.getAttribute('connectedto'),
      }
    }
  }],
  toDOM(node) {
    return ["span", {
      class: node.attrs.class,
      'data-id': node.attrs.id,
      'user': node.attrs.user,
      'connectedto': node.attrs.connectedTo,
      'usercolor': node.attrs.userColor,
      'usercontrastcolor': node.attrs.userContrastColor,
      'data-color': node.attrs.color,
      'data-username': node.attrs.username,
      'data-date': node.attrs.date,
      'data-group': node.attrs.group,
      'data-viewid': node.attrs.viewid,
      style: node.attrs.style + ';color: '+ node.attrs.userContrastColor + ';background: '+ node.attrs.userColor,
    }]
  }
};

