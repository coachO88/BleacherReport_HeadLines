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

  Comments: {
    type: Array,
    default:null
  },
  
  Favorite: {
    type: Boolean,
    default:false
  },
  
  TimeStamp: {
    type:Date,
    default:Date.now
  }

});

var topStories = mongoose.model("bleacherReportTopStories", bleacherReportSchema);
module.exports = topStories;