const express = require('express');
const extractDNA = require('../dna/extractdna');
const cosineSimilarity = require('../dna/similarity');
const Author = require('../models/authors');
const Era = require('../models/Era');

const router = express.Router();

router.post('/analyze', async (req, res) => {
  try {
    const { text } = req.body;

    if (!text || text.trim().length < 20) {
      return res.status(400).json({ error: 'Text too short. Please provide at least 20 words.' });
    }

    // Extract DNA from user text
    const userDNA = extractDNA(text);

    // Get all authors with their eras
    const authors = await Author.find().populate('eraId', 'name startYear endYear');
    const eras = await Era.find().sort({ startYear: 1 });

    // Find best match overall
    let bestMatch = null;
    let bestScore = -1;

    authors.forEach(author => {
      if (!author.dnastats) return;
      
      const similarity = cosineSimilarity(userDNA, author.dnastats);
      const score = Math.round(similarity * 100);

      if (score > bestScore) {
        bestScore = score;
        bestMatch = {
          _id: author._id,
          name: author.name,
          dnastats: author.dnastats,
          birthYear: author.birthYear,
          deathYear: author.deathYear,
          shortDescription: author.shortDescription,
          image: author.image,
          era: author.eraId ? author.eraId.name : 'Unknown'
        };
      }
    });

    // Find best match per era
    const eraMatches = eras.map(era => {
      const eraAuthors = authors.filter(a => 
        a.eraId && a.eraId._id.toString() === era._id.toString()
      );

      let bestEraMatch = null;
      let bestEraScore = -1;

      eraAuthors.forEach(author => {
        if (!author.dnastats) return;
        
        const similarity = cosineSimilarity(userDNA, author.dnastats);
        const score = Math.round(similarity * 100);

        if (score > bestEraScore) {
          bestEraScore = score;
          bestEraMatch = {
            _id: author._id,
            name: author.name,
            dnastats: author.dnastats,
            birthYear: author.birthYear,
            deathYear: author.deathYear,
            shortDescription: author.shortDescription,
            image: author.image,
            era: era.name
          };
        }
      });

      return {
        eraId: era._id,
        eraName: era.name,
        startYear: era.startYear,
        endYear: era.endYear,
        match: bestEraMatch,
        score: bestEraScore
      };
    }).filter(em => em.match !== null); // Only include eras where we found a match

    res.json({
      user: userDNA,
      match: bestMatch,
      score: bestScore,
      eraMatches: eraMatches
    });

  } catch (error) {
    console.error('DNA Analysis Error:', error);
    res.status(500).json({ error: 'Analysis failed' });
  }
});

module.exports = router;