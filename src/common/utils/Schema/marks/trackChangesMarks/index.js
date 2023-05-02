let {insertion} = require("./insertionMark")
let {deletion} = require("./deletionMark")
let {format_change} = require("./formatChangeMark")

exports.trackChangesMarks = {
  format_change: format_change,
  insertion: insertion,
  deletion: deletion
}
