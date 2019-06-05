var mongoose = require("mongoose");

var Schema = mongoose.Schema;

var bleacherReportSchema = new Schema({
  sportHeadline: {
    type: String,
    trim: true
  },
  sportURL: {
    type: String
  },
  
  sportImage: {
    type: String,
  },

});

var topStories = mongoose.model("bleacherReportTopStories", bleacherReportSchema);
module.exports = topStories;