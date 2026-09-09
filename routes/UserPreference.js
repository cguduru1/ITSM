// ./models/UserPreference.js
import express from 'express';
import UserPreference from '../models/UserPreference.js';
import requireAuth from '../middleware/requireAuth.js';
import mongoose from 'mongoose';

const router = express.Router();
const { Schema } = mongoose;

const UserPreferenceSchema = new Schema({
  userId: { type: Schema.Types.ObjectId, required: true, index: true, unique: true },
  tileOrder: { type: [String], default: [] }, // array of tile ids in preferred order
  updatedAt: { type: Date, default: Date.now }
});

UserPreferenceSchema.pre('save', async function () {
  this.updatedAt = new Date();
});

// GET /api/me/tile-order
router.get('/tile-order', requireAuth, async (req, res) => {
  try {
    const userId = req.user._id;
    const pref = await UserPreference.findOne({ userId }).lean();
    return res.json({ tileOrder: pref?.tileOrder || [] });
  } catch (err) {
    return res.status(500).json({ error: err.message || 'Failed to fetch tile order' });
  }
});

// PUT /api/me/tile-order
router.put('/tile-order', requireAuth, async (req, res) => {
  try {
    const userId = req.user._id;
    const { tileOrder } = req.body;
    if (!Array.isArray(tileOrder)) return res.status(400).json({ error: 'tileOrder must be an array' });

    const updated = await UserPreference.findOneAndUpdate(
      { userId },
      { $set: { tileOrder, updatedAt: new Date() } },
      { upsert: true, new: true }
    ).lean();

    return res.json({ tileOrder: updated.tileOrder });
  } catch (err) {
    return res.status(400).json({ error: err.message || 'Failed to update tile order' });
  }
});

const UserPreference = mongoose.models?.UserPreference || mongoose.model('UserPreference', UserPreferenceSchema);
export default UserPreference;
