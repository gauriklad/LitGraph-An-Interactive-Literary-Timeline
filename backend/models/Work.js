const mongoose = require("mongoose");

const workSchema = new mongoose.Schema({
  title: { type: String, required: true },
  authorId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Author",
    required: true
  },
  eraId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Era",
    required: true
  },
  publicationYear: Number,
  coverImage: String,
  link: String
});

module.exports = mongoose.model("Work", workSchema);
