const express = require('express');
const Poll=require('../models/poll.model');
const { authenticateToken } = require('../guards/auth.guard');
const router = express.Router();

// Admin: Create poll
router.post('/', authenticateToken,  async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Access denied' });
    }

    const { title, options, visibility, allowedUsers, expiresInMinutes } = req.body;

    // Validation here
    if (
      !title ||
      !options || !Array.isArray(options) ||
      options.length < 2 ||
      !expiresInMinutes || expiresInMinutes > 120
    ) {
      return res.status(400).json({
        error: 'Invalid poll data: title, at least 2 options, and duration (1–120 mins) are required.',
      });
    }

    const expiresAt = new Date(Date.now() + expiresInMinutes * 60 * 1000);
    const poll = new Poll({
      title,
      options,
      visibility,
      allowedUsers,
      expiresAt,
      createdBy: req.user.id,
    });

    await poll.save();
    res.status(201).json(poll);
  } catch (err) {
    console.error('Poll creation error:', err);
    res.status(500).json({ error: err.message });
  }
});

router.get('/available', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id;

    const polls = await Poll.find({
      $or: [
        { visibility: 'public' },
        { visibility: 'private', allowedUsers: userId }
      ]
    });

    res.json(polls);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});


// Admin: View polls created by the logged-in admin
router.get('/my', async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Access denied' });
    }

    const polls = await Poll.find({ createdBy: req.user.id });
    res.json(polls);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Admin: Edit active poll
router.put('/:id', authenticateToken, async (req, res) => {
  try {
    console.log('Edit request received with body:', req.body);

    const poll = await Poll.findById(req.params.id);
    if (!poll) return res.status(404).json({ error: 'Poll not found' });

    // Check permission
    if (poll.createdBy.toString() !== req.user.id) {
      return res.status(403).json({ error: 'Access denied' });
    }

    // Check if poll expired
    if (new Date(poll.expiresAt) <= new Date()) {
      return res.status(400).json({ error: 'Cannot edit expired poll' });
    }

    const { title, options, visibility, allowedUsers, expiresInMinutes } = req.body;

    // Update title
    if (title) poll.title = title;

    // Update options (handle both [{text: ""}] or [""] format)
    if (Array.isArray(options) && options.length >= 2) {
      poll.options = options.map(opt =>
        typeof opt === 'string' ? { text: opt } : opt
      );
    }

    // Update visibility and allowed users
    if (visibility) poll.visibility = visibility;
    if (visibility === 'private' && Array.isArray(allowedUsers)) {
      poll.allowedUsers = allowedUsers;
    }

    // Update expiry
    if (expiresInMinutes && expiresInMinutes <= 120) {
      poll.expiresAt = new Date(Date.now() + expiresInMinutes * 60 * 1000);
    }

    await poll.save();
    res.json(poll);
  } catch (err) {
    console.error('PUT /polls/:id failed:', err);
    res.status(500).json({ error: err.message });
  }
});

// Admin: Delete poll
router.delete('/:id', async (req, res) => {
  try {
    const poll = await Poll.findById(req.params.id);
    if (!poll) return res.status(404).json({ error: 'Poll not found' });

    if (poll.createdBy.toString() !== req.user.id)
      return res.status(403).json({ error: 'Access denied' });

    await poll.deleteOne();
    res.json({ message: 'Poll deleted' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /polls/:id/vote
router.post('/:id/vote', authenticateToken, async (req, res) => {
  try {
    const { optionIndex } = req.body;
    const userId = req.user.id;

    const poll = await Poll.findById(req.params.id);
    if (!poll) return res.status(404).json({ error: 'Poll not found' });

    if (!['user', 'admin'].includes(req.user.role)) {
      return res.status(403).json({ error: 'Not allowed to vote' });
    }

    if (new Date(poll.expiresAt) < new Date()) {
      return res.status(400).json({ error: 'Poll expired' });
    }

    const alreadyVoted = poll.votes.some(v => v.userId.toString() === userId);
    if (alreadyVoted) {
      return res.status(400).json({ error: 'You have already voted in this poll' });
    }

    // Check if optionIndex is valid
    if (optionIndex < 0 || optionIndex >= poll.options.length) {
      return res.status(400).json({ error: 'Invalid option selected' });
    }

    poll.votes.push({ userId, optionIndex });
    await poll.save();

    res.json({ message: 'Vote recorded' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/:id/status', authenticateToken, async (req, res) => {
  const poll = await Poll.findById(req.params.id);
  if (!poll) return res.status(404).json({ error: 'Poll not found' });

  const voteCounts = poll.options.map((opt) => ({
    option: opt,
    votes: poll.votes.filter((v) => v.option === opt).length,
  }));

  res.json({
    title: poll.title,
    expiresAt: poll.expiresAt,
    isExpired: new Date() > poll.expiresAt,
    voteCounts,
  });
});

router.get('/expired', authenticateToken, async (req, res) => {
  const userId = req.user.id;

  const polls = await Poll.find({
    expiresAt: { $lte: new Date() },
    votes: { $elemMatch: { userId } },
  });

  res.json(polls);
});


router.get('/:id/results', authenticateToken, async (req, res) => {
  try {
    const poll = await Poll.findById(req.params.id);
    if (!poll) return res.status(404).json({ error: 'Poll not found' });

    // Optional: hide results if poll is still active
    if (new Date() < new Date(poll.expiresAt)) {
      return res.status(403).json({ error: 'Results not available until poll expires' });
    }

    // Count votes
    const results = poll.options.map((opt) => ({
      option: opt,
      votes: poll.votes.filter((v) => v.option === opt).length,
    }));

    res.json({ pollId: poll._id, title: poll.title, results });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});


module.exports = router;
