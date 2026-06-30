const mongoose = require('mongoose');

const clubSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, unique: true, trim: true },
    description: { type: String, default: '' },
    category: {
      type: String,
      enum: ['cultural', 'technical', 'sports', 'literary', 'social', 'arts'],
      default: 'cultural',
    },
    admin: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
    facultyIncharge: { type: String, default: '' },
    facultyEmail: { type: String, default: '' },
    logoUrl: { type: String, default: '' },
    bannerUrl: { type: String, default: '' },
    members: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
    memberCount: { type: Number, default: 0 },
    announcements: [
      {
        title: String,
        message: String,
        createdAt: { type: Date, default: Date.now },
      },
    ],
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Club', clubSchema);
