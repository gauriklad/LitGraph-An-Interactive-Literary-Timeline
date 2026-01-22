const mongoose = require("mongoose");

const historicalEventSchema = new mongoose.Schema({
  label: { type: String, required: true },
  year: Number,
  shortDescription: String,
  icon: String
});

module.exports = mongoose.model("HistoricalEvent", historicalEventSchema);
