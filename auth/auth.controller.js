const express = require('express');
const { registerUser, loginUser } = require('./auth.service.js');

const router = express.Router();

//  POST /auth/register
router.post('/register', async (req, res) => {
  try {
    const user = await registerUser(req.body);
    res.status(201).json(user);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});


// POST /auth/login
router.post('/login', async (req, res) => {
  try {
    const data = await loginUser(req.body);

    // Optionally: store JWT in cookie
    // res.cookie('token', data.token, {
    //   httpOnly: true,
    //   secure: process.env.NODE_ENV === 'production',
    //   sameSite: 'strict',
    //   maxAge: 2 * 60 * 60 * 1000 // 2 hours
    // });

    res.json(data); // { token, role }
  } catch (err) {
    res.status(401).json({ error: err.message });
  }
});

module.exports = router;
