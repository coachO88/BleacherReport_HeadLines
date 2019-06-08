var mongoose = require("mongoose");

var Schema = mongoose.Schema;

var commentSchema = new Schema({
  sportHeadline: {
    type: String,
    trim: true
  },
  sportURL: {
    type: String,
    default:"Anonymous"
  },
  
  Comment: {
    type: String
  },
});

var comment = mongoose.model("bleacherReportComments", commentSchema);
module.exports = comment;