const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const User = require('../models/user.model.js');

const registerUser = async ({ username, email, password, role }) => {
  const hash = await bcrypt.hash(password, 10);
  const user = new User({ username, email, password: hash, role });
  return await user.save();
};


const loginUser = async ({ email, password }) => {
  const user = await User.findOne({ email });
  if (!user) throw new Error('User not found');
  const valid = await bcrypt.compare(password, user.password);
  if (!valid) throw new Error('Invalid credentials');
  const token = jwt.sign(
    { id: user._id, role: user.role },
    process.env.JWT_SECRET_KEY,
    { expiresIn: '2h' }
  );
  return { token, role: user.role };
};

module.exports = {
  registerUser,
  loginUser,
};
