const express = require('express');
const Author = require('../models/authors'); // Keeping your file path
const extractDNA = require('../dna/extractdna');
const cosineSimilarity = require('../dna/similarity');

const router = express.Router();

router.post('/analyze', async (req, res) => {
  try {
    const { text } = req.body;

    if (!text) return res.status(400).json({ message: "Text required" });

    // 1. Extract DNA stats from input
    const userDNA = extractDNA(text);
    
    // 2. Fetch authors from DB
    const authors = await Author.find();

    let bestMatch = null;
    let bestScore = -1;

    // Helper to ensure vector order is ALWAYS: [vocab, complexity, pacing, abstraction]
    const toVector = (obj) => [
      obj.vocab || 0, 
      obj.complexity || 0, 
      obj.pacing || 0, 
      obj.abstraction || 0
    ];

    const userVector = toVector(userDNA);
    const debugResults = [];

    authors.forEach(author => {
      if (!author.dnastats) return;

      const authorVector = toVector(author.dnastats);
      
      const score = cosineSimilarity(userVector, authorVector);

      // Keep track of scores for debugging
      debugResults.push({ name: author.name, score: score });

      if (score > bestScore) {
        bestScore = score;
        bestMatch = author;
      }
    });

    // 3. Sort debug results to see runners-up
    debugResults.sort((a, b) => b.score - a.score);

    res.json({
      user: userDNA,
      match: bestMatch,
      score: Math.round(bestScore * 100),
      debug: debugResults.slice(0, 5) // Send top 5 matches for inspection
    });

  } catch (error) {
    console.error("Analysis Error:", error);
    res.status(500).json({ message: "Server Error", error: error.message });
  }
});

module.exports = router;