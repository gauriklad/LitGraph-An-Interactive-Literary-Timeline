const express = require('express');
const Author = require('../models/authors');
const Connection = require('../models/Connection');
const Era = require('../models/Era');

const router = express.Router();

router.get('/', async (req, res) => {
  try {
    // Fetch all data
    const authors = await Author.find();
    const connections = await Connection.find();
    const eras = await Era.find();

    // Create era lookup map
    const eraMap = {};
    eras.forEach(era => {
      eraMap[era._id.toString()] = era.name.toLowerCase();
    });

    // Helper function to get initials
    function getInitials(name) {
      return name
        .split(' ')
        .map(word => word[0])
        .join('')
        .toUpperCase();
    }

    // Format nodes with era information and shortDescription
    const nodes = authors.map(author => ({
      id: author._id.toString(),
      name: author.name,
      initials: getInitials(author.name),
      era: eraMap[author.eraId.toString()] || 'neoclassical',
      birthYear: author.birthYear,
      deathYear: author.deathYear,
      shortDescription: author.shortDescription  // Added this line
    }));

    // Format connections
    const formattedConnections = connections.map(conn => ({
      source: conn.sourceAuthorId.toString(),
      target: conn.targetAuthorId.toString(),
      type: conn.type
    }));

    res.json({
      nodes: nodes,
      connections: formattedConnections
    });

  } catch (error) {
    console.error('Error fetching graph data:', error);
    res.status(500).json({ error: 'Failed to fetch graph data' });
  }
});

module.exports = router;