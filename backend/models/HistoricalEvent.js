const mongoose = require("mongoose");

const historicalEventSchema = new mongoose.Schema({
  label: { type: String, required: true },
  year: Number,
  shortDescription: String,
  icon: String,
  eraId: { type: mongoose.Schema.Types.ObjectId, ref: 'Era' }
}, {
  collection: 'historicalEvents'  // Add this line to specify the exact collection name
});

module.exports = mongoose.model("HistoricalEvent", historicalEventSchema);