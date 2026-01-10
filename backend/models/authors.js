const mongoose = require('mongoose');

const AuthorSchema = new mongoose.Schema({
  name: { type: String, required: true },
  birthYear: Number,
  deathYear: Number,
  image: String,
  shortDescription: String,
  eraId: { type: mongoose.Schema.Types.ObjectId, ref: 'Era' }, // Links to your Era collection
  dnastats: {
    vocab: { type: Number, required: true },      // 0-100
    complexity: { type: Number, required: true }, // 0-100
    pacing: { type: Number, required: true },     // 0-100
    abstraction: { type: Number, required: true } // 0-100
  }
});

module.exports = mongoose.model('Author', AuthorSchema);