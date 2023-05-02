/* eslint-disable no-param-reassign */


/* eslint-disable radix */
const delFromPopup = {
  attrs: {
    class: { default: 'del-from-popup' },
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
  parseDOM: [
    {
      tag: 'span.del-from-popup',
      getAttrs(dom) {
        return {
          class: dom.getAttribute('class'),
          style: dom.getAttribute('style'),
          id: dom.dataset.id,
          user: dom.dataset.user,
          username: dom.dataset.username,
          date: parseInt(dom.dataset.date),
          group: dom.dataset.group,
          viewid: dom.dataset.viewid,
          color: dom.dataset.color,
        }
      },
    },
  ],
  toDOM(node) {
    /* let deletionSpan = document.createElement('span');
    Object.keys(node.attrs).forEach((key:string)=>{
      deletionSpan.setAttribute(key,node.attrs[key]);
    })
    deletionSpan.addEventListener('mouseover',(e)=>{
      let mouseX = e.clientX
      let mouseY = e.clientY
    })
    return deletionSpan */
    return [
      'span',
      {
        class: node.attrs.class,
        'data-id': node.attrs.id,
        'data-user': node.attrs.user,
        'data-username': node.attrs.username,
        'data-date': node.attrs.date,
        'data-group': node.attrs.group,
        'data-viewid': node.attrs.viewid,
        style: node.attrs.style,
      },
    ];
  },
};
exports.delFromPopup = delFromPopup;
