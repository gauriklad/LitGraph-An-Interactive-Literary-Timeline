const express = require('express');
const Era = require('../models/Era');
const Author = require('../models/authors');
const Work = require('../models/Work');
const HistoricalEvent = require('../models/HistoricalEvent');

const router = express.Router();

router.get('/', async (req, res) => {
  try {
    const eras = await Era.find().sort({ startYear: 1 });
    const events = await HistoricalEvent.find().sort({ year: 1 });

    res.json({
      eras: eras,
      events: events
    });
  } catch (error) {
    console.error('Error fetching timeline data:', error);
    res.status(500).json({ error: 'Failed to fetch timeline data' });
  }
});

router.get('/era/:eraId', async (req, res) => {
  try {
    const { eraId } = req.params;

    const works = await Work.find({ eraId }).populate('authorId', 'name');
    const worksWithAuthorName = works.map(work => ({
      _id: work._id,
      title: work.title,
      authorName: work.authorId.name,
      publicationYear: work.publicationYear
    }));

    const authors = await Author.find({ eraId });
    const authorsWithInitials = authors.map(author => ({
      _id: author._id,
      name: author.name,
      initials: author.name.split(' ').map(w => w[0]).join('').toUpperCase()
    }));

    res.json({
      works: worksWithAuthorName,
      authors: authorsWithInitials
    });
  } catch (error) {
    console.error('Error fetching era details:', error);
    res.status(500).json({ error: 'Failed to fetch era details' });
  }
});

module.exports = router;