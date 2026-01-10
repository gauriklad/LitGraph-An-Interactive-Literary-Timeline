const mongoose = require('mongoose');

const ConnectionSchema = new mongoose.Schema({
  sourceAuthorId: mongoose.Schema.Types.ObjectId,
  targetAuthorId: mongoose.Schema.Types.ObjectId,
  type: String
});

module.exports = mongoose.model('Connection', ConnectionSchema);
