const mongoose = require('mongoose');

const pollSchema = new mongoose.Schema({
  title: { type: String, required: true },
  options: [
    {
      text: { type: String, required: true },
    },
  ],
  votes: [
    {
      userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
      optionIndex: { type: Number, required: true },
    },
  ],
  visibility: { type: String, enum: ['public', 'private'], default: 'public' },
  allowedUsers: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  expiresAt: { type: Date, required: true },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
}, { timestamps: true });

module.exports = mongoose.model('Poll', pollSchema);
