
let  { DOMParser } = require('prosemirror-model');
const { DOMSerializer } = require('prosemirror-model')
let { schema } = require('./schema')
exports.schema = schema;
exports.PMDomParser = DOMParser.fromSchema(schema);
exports.PMDOMSerializer = DOMSerializer.fromSchema(schema);

