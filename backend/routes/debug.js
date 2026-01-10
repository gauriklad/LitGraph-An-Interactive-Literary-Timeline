const express = require('express');
const Author = require('../models/authors');
const Connection = require('../models/Connection');

const router = express.Router();

router.get('/all', async (req, res) => {
  try {
    const authors = await Author.find();
    const connections = await Connection.find();

    res.json({
      authorsCount: authors.length,
      connectionsCount: connections.length,
      authors,
      connections
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
