const {
  parseGenericAttributes,
  getGenericAttributes,
  genericAttributtesToDom,
} = require('../helpers');

const image = {
  inline: true,
  attrs: {
    src: { default: 'https://www.kenyons.com/wp-content/uploads/2017/04/default-image-620x600.jpg' },
    alt: { default: '' },
    title: { default: 'default image' },
    width: {default:undefined},
    ...getGenericAttributes({styling:{default:'max-width: 100%;'}}),
  },
  group: "inline",
  draggable: true,
  parseDOM: [{
    tag: "img[src]", getAttrs: function getAttrs(dom) {
      let width = dom.getAttribute('width')
      return {
        src: dom.getAttribute("src"),
        title: dom.getAttribute("title"),
        alt: dom.getAttribute("alt"),
        width: (width&&width.length>0)?width:undefined,
        ...parseGenericAttributes(dom),
      }
    }
  }],
  toDOM: function toDOM(node) {
    var ref = node.attrs;
    var src = ref.src;
    var alt = ref.alt;
    var title = ref.title; 
    let domAttrs= { src: src, alt: alt, title: title, ...genericAttributtesToDom(node) }
    if(node.attrs.width && node.attrs.width.length>0){
      domAttrs.width = node.attrs.width
    }
    return ["img",domAttrs]
  }
}
exports.image = image
const video = {
  inline: true,
  attrs: {
    src: { default: 'https://www.youtube.com/embed/l_MtK_kPtNU' },
    pdfImgOrigin:{default:''},
    thumbnail:{default:''},
    ...getGenericAttributes()
  },
  group: "inline",
  draggable: true,
  parseDOM: [{
    tag: "iframe", getAttrs(dom) {
      return {
        src: dom.getAttribute('src'), 
        pdfImgOrigin: dom.getAttribute('pdfImgOrigin'), 
        thumbnail: dom.getAttribute('thumbnail'), 
        ...parseGenericAttributes(dom),
      }
    }
  }],
  toDOM(node) {
    let { src } = node.attrs;
    return ["iframe", {
      ...genericAttributtesToDom(node),
      controls: '', src,
      'pdfImgOrigin': node.attrs.pdfImgOrigin,
      'thumbnail': node.attrs.thumbnail,
    }]
  }
}
exports.video = video

const figures_nodes_container = {
  content: "block*",
  group: 'block',
  inline: false,
  isolating: true,

  attrs: {
    containerid: { default: '' },
    ...getGenericAttributes(),
  },
  parseDOM: [{
    tag: "figures-nodes-container", getAttrs(dom) {
      return {
        containerid: dom.getAttribute('containerid'),
        ...parseGenericAttributes(dom)
      }
    }
  }],
  toDOM(node) {
    return ["figures-nodes-container", {
      'containerid': node.attrs.containerid,
      ...genericAttributtesToDom(node)
    }, 0]
  }
}
exports.figures_nodes_container = figures_nodes_container

const block_figure = {
  content: "block+",
  group: 'block',
  inline: false,
  isolating: true,
  attrs: {
    figure_number: {},
    figure_id: {},
    figure_columns: { default: "" },
    viewed_by_citat: { default: "" },
    ...getGenericAttributes(),
  },
  parseDOM: [{
    tag: "block-figure", getAttrs(dom) {
      return {
        figure_number: dom.getAttribute('figure_number'),
        figure_id: dom.getAttribute('figure_id'),
        figure_columns: dom.getAttribute('figure_columns'),
        viewed_by_citat: dom.getAttribute('viewed_by_citat'),
        ...parseGenericAttributes(dom)
      }
    }
  }],
  toDOM(node) {
    return ["block-figure", {
      'figure_number': node.attrs.figure_number,
      'figure_id': node.attrs.figure_id,
      'figure_columns': node.attrs.figure_columns,
      'viewed_by_citat': node.attrs.viewed_by_citat,
      ...genericAttributtesToDom(node)
    }, 0]
  }
}
exports.block_figure = block_figure

const figure_components_container = {
  group: 'block',
  content: "block+",
  inline: false,
  attrs: {
    ...getGenericAttributes(),
  },
  parseDOM: [{
    tag: "figure-components-container", getAttrs(dom) {
      return {
        ...parseGenericAttributes(dom)
      }
    }
  }],
  toDOM(node) {
    return ["figure-components-container", {
      ...genericAttributtesToDom(node)
    }, 0]
  }
}
exports.figure_components_container = figure_components_container

const figure_component = {
  group: 'block',
  content: "inline+",
  inline: false,
  attrs: {
    component_number: {},
    viewed_by_citat: { default: "" },
    ...getGenericAttributes(),
  },
  parseDOM: [{
    tag: "figure-component", getAttrs(dom) {
      return {
        component_number: dom.getAttribute('component_number'),
        viewed_by_citat: dom.getAttribute('viewed_by_citat'),
        ...parseGenericAttributes(dom)
      }
    }
  }],
  toDOM(node) {
    return ["figure-component", {
      'viewed_by_citat': node.attrs.viewed_by_citat,
      'component_number': node.attrs.component_number,
      ...genericAttributtesToDom(node)
    }, 0]
  }
}
exports.figure_component = figure_component
const figure_descriptions_container = {
  group: 'block',
  content: "block+",
  isolating: true,
  inline: false,
  attrs: {
    ...getGenericAttributes(),
  },
  parseDOM: [{
    tag: "figure-descriptions-container", getAttrs(dom) {
      return {
        ...parseGenericAttributes(dom)
      }
    }
  }],
  toDOM(node) {
    return ["figure-descriptions-container", {
      ...genericAttributtesToDom(node)
    }, 0]
  }
}
exports.figure_descriptions_container = figure_descriptions_container

const figure_description = {
  content: "block+",
  group: "block",
  isolating: true,
  inline: false,
  attrs: {
    ...getGenericAttributes()
  },
  parseDOM: [{
    tag: "figure-description", getAttrs(dom) {
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
    return ["figure-description", attributesToDom, 0];
  }
}
exports.figure_description = figure_description

const figure_component_description = {
  content: "block+",
  isolating: true,
  group: "block",
  inline: false,
  attrs: {
    component_number: {},
    viewed_by_citat: { default: "" },
    ...getGenericAttributes()
  },
  parseDOM: [{
    tag: "figure-component-description", getAttrs(dom) {
      return {
        component_number: dom.getAttribute('component_number'),
        viewed_by_citat: dom.getAttribute('viewed_by_citat'),
        ...parseGenericAttributes(dom),
      }
    },
  }],
  toDOM(node) {
    let attributesToDom = {
      'viewed_by_citat': node.attrs.viewed_by_citat,
      'component_number': node.attrs.component_number,
      ...genericAttributtesToDom(node),
      style: 'display:flex;'

    }
    return ["figure-component-description", attributesToDom, 0];
  }
}
exports.figure_component_description = figure_component_description

exports.figureNodes = {
  image,
  video,
  block_figure,
  figure_components_container,
  figure_component,
  figures_nodes_container,
  figure_descriptions_container,
  figure_component_description,
  figure_description,
}
