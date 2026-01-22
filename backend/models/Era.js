const mongoose = require("mongoose");

const eraSchema = new mongoose.Schema({
  name: { type: String, required: true },
  startYear: Number,
  endYear: Number,
  shortDescription: String,
  detailedDescription: String,
  themeColor: String,
  icon: String
});

module.exports = mongoose.model("Era", eraSchema);
