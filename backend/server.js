require('dotenv').config();
const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');

const Password = require('./models/Password');

const app = express();
app.use(cors());
app.use(express.json());

const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/password-manager';
const PORT = process.env.PORT || 5000;

mongoose
  .connect(MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log('Connected to MongoDB'))
  .catch((err) => console.error('MongoDB connection error:', err));

// GET /api/passwords - fetch all
app.get('/api/passwords', async (req, res) => {
  try {
    const docs = await Password.find().sort({ createdAt: -1 }).lean();
    const mapped = docs.map((d) => ({ id: d._id, site: d.site, username: d.username, password: d.password }));
    res.json(mapped);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

// POST /api/passwords - create
app.post('/api/passwords', async (req, res) => {
  try {
    const { site, username, password } = req.body;
    if (!site || !username || !password) return res.status(400).json({ message: 'Missing fields' });
    const doc = new Password({ site, username, password });
    await doc.save();
    res.status(201).json({ id: doc._id, site: doc.site, username: doc.username, password: doc.password });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

// PUT /api/passwords/:id - update
app.put('/api/passwords/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { site, username, password } = req.body;
    const updated = await Password.findByIdAndUpdate(id, { site, username, password }, { new: true }).lean();
    if (!updated) return res.status(404).json({ message: 'Not found' });
    res.json({ id: updated._id, site: updated.site, username: updated.username, password: updated.password });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

// DELETE /api/passwords/:id - delete
app.delete('/api/passwords/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const deleted = await Password.findByIdAndDelete(id).lean();
    if (!deleted) return res.status(404).json({ message: 'Not found' });
    res.json({ message: 'Deleted' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
