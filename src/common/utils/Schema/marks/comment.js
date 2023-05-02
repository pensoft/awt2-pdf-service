exports.comment = {
    attrs: {
        class: { default: 'comment' },
        id: { default: '' },
        group: { default: '' },
        viewid: { default: '' },
        conversation: { default: [] },
        userColor: {default : ''},
        userContrastColor: {default:''},
        date: { default:''},
        userid: { default:''},
        username: { default:''},
        commentmarkid:{default:''}
    },
    inclusive: false,
    excludes: '',
    parseDOM: [{
        tag: 'span.comment',
        getAttrs(dom) {
            return {
                class: dom.getAttribute('class'),
                id: dom.dataset.id,
                group: dom.dataset.group,
                userContrastColor:dom.getAttribute('usercontrastcolor'),
                userColor: dom.getAttribute('usercolor'),
                viewid: dom.dataset.viewid,
                date: dom.dataset.date,
                userid: dom.dataset.userid,
                username: dom.dataset.username,
                commentmarkid: dom.dataset.commentmarkid,
                //conversation: JSON.parse(dom.dataset.conversation),
            }
        },
    }],
    toDOM(node) {
        return[
            'span',
            {
                class: node.attrs.class,
                'data-id': node.attrs.id,
                'data-conversation': JSON.stringify(node.attrs.conversation),
                'data-viewid': node.attrs.viewid,
                'usercontrastcolor': node.attrs.userContrastColor,
                'data-group': node.attrs.group,
                'usercolor': node.attrs.userColor,
                'data-date': node.attrs.date,
                'data-userid': node.attrs.userid,
                'data-username': node.attrs.username,
                'data-commentmarkid': node.attrs.commentmarkid,
                style: '--tooltip-background-color: ' + node.attrs.userColor + ";--tooltip-color: " + node.attrs.userContrastColor,
            },
        ];
    },
};

exports.overlapComment = {
    attrs: {
        class: { default: 'comment' },
        id: { default: '' },
        group: { default: '' },
        viewid: { default: '' },
        conversation: { default: [] },
        userColor: {default : ''},
        userContrastColor: {default:''},
        date: { default:''},
        userid: { default:''},
        username: { default:''},
        commentmarkid:{default:''}
    },
    inclusive: false,
    excludes: '',
    parseDOM: [{
        tag: 'span.comment',
        getAttrs(dom) {
            return {
                class: dom.getAttribute('class'),
                id: dom.dataset.id,
                group: dom.dataset.group,
                userContrastColor:dom.getAttribute('usercontrastcolor'),
                userColor: dom.getAttribute('usercolor'),
                viewid: dom.dataset.viewid,
                date: dom.dataset.date,
                userid: dom.dataset.userid,
                username: dom.dataset.username,
                commentmarkid: dom.dataset.commentmarkid,
                //conversation: JSON.parse(dom.dataset.conversation),
            }
        },
    }],
    toDOM(node) {
        return[
            'span',
            {
                class: node.attrs.class,
                'data-id': node.attrs.id,
                'data-conversation': JSON.stringify(node.attrs.conversation),
                'data-viewid': node.attrs.viewid,
                'usercontrastcolor': node.attrs.userContrastColor,
                'data-group': node.attrs.group,
                'usercolor': node.attrs.userColor,
                'data-date': node.attrs.date,
                'data-userid': node.attrs.userid,
                'data-username': node.attrs.username,
                'data-commentmarkid': node.attrs.commentmarkid,
                style: '--tooltip-background-color: ' + node.attrs.userColor + ";--tooltip-color: " + node.attrs.userContrastColor,
            },
        ];
    },
};