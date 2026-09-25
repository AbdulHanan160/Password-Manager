const mongoose = require('mongoose');

const PasswordSchema = new mongoose.Schema(
  {
    site: { type: String, required: true },
    username: { type: String, required: true },
    password: { type: String, required: true }
  },
  { timestamps: true }
);

module.exports = mongoose.model('Password', PasswordSchema);
