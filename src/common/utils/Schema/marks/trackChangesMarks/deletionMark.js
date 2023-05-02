/* eslint-disable no-param-reassign */
/* eslint-disable radix */
exports.deletion = {
  attrs: {
    class: { default: 'deletion' },
    id: { default: '' },
    user: { default: 0 },
    username: { default: '' },
    date: { default: 0 },
    group: { default: '' },
    viewid: { default: '' },
    style: { default: null },
    connectedTo : { default : ''},
    userColor : { default : ''},
    userContrastColor:{ default:''},
  },
  inclusive: false,
  group: 'track',
  parseDOM: [
    {
      tag: 'span.deletion',
      getAttrs(dom) {
        return {
          class: dom.getAttribute('class'),
          style: dom.getAttribute('style'),
          userColor: dom.getAttribute('usercolor'),
          userContrastColor: dom.getAttribute('usercontrastcolor'),
          id: dom.dataset.id,
          user: dom.getAttribute('user'),
          connectedTo: dom.getAttribute('connectedto'),
          username: dom.dataset.username,
          date: parseInt(dom.dataset.date),
          group: dom.dataset.group,
          viewid: dom.dataset.viewid,
        }
      },
    },
  ],
  toDOM(node) {
    return [
      'span',
      {
        class: node.attrs.class,
        'data-id': node.attrs.id,
        'user': node.attrs.user,
        'usercontrastcolor': node.attrs.userContrastColor,
        'connectedto': node.attrs.connectedTo,
        'usercolor': node.attrs.userColor,
        'data-username': node.attrs.username,
        'data-date': node.attrs.date,
        'data-group': node.attrs.group,
        'data-viewid': node.attrs.viewid,
        style: node.attrs.style,
      },
    ];
  },
};
