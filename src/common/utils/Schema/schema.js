let  { Schema } = require('prosemirror-model');
let { nodes } = require('./nodes');
let { marks } = require('./marks');

exports.nodes = nodes ;
exports.marks = marks ;
exports.schema = new Schema({ nodes, marks }); 