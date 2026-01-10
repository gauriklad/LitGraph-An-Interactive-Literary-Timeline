const express = require('express');
const Author = require('../models/authors');
const Connection = require('../models/Connection');

const router = express.Router();

router.get('/', async (req, res) => {
  const authors = await Author.find();
  const connections = await Connection.find();

  res.json({
    nodes: authors,
    edges: connections
  });
});

module.exports = router;
