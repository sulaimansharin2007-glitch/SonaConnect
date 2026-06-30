const mongoose = require('mongoose');

const eventSchema = new mongoose.Schema(
  {
    title: { type: String, trim: true, default: '' },
    description: { type: String, default: '' },
    category: {
      type: String,
      enum: ['hackathon', 'workshop', 'seminar', 'cultural', 'sports', 'speakers_forum', 'meeting', 'other'],
      default: 'other',
    },
    club: { type: mongoose.Schema.Types.ObjectId, ref: 'Club', default: null },
    clubName: { type: String, default: '' },
    posterUrl: { type: String, default: '' },
    date: { type: Date, default: null },
    time: { type: String, default: '' },
    venue: { type: String, default: '' },
    organizer: { type: String, default: '' },
    inchargeStaff: { type: String, default: '' },
    registrationLink: { type: String, default: '' },
    deadline: { type: Date, default: null },
    participationType: { type: String, enum: ['solo', 'team', ''], default: '' },
    prizes: { type: String, default: '' },
    eligibility: { type: String, default: '' },
    tags: [{ type: String }],
    status: {
      type: String,
      enum: ['upcoming', 'ongoing', 'completed', 'cancelled'],
      default: 'upcoming',
    },
    isApproved: { type: Boolean, default: false },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    isFeatured: { type: Boolean, default: false },
  },
  { timestamps: true }
);

// Auto-update status based on date
eventSchema.pre('save', function () {
  if (this.date) {
    const now = new Date();
    if (this.date < now && this.status === 'upcoming') {
      this.status = 'completed';
    }
  }
});

module.exports = mongoose.model('Event', eventSchema);
