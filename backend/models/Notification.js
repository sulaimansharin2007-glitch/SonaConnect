const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    message: { type: String, required: true },
    type: {
      type: String,
      enum: ['event', 'registration', 'announcement', 'reminder', 'system'],
      default: 'system',
    },
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
    isGlobal: { type: Boolean, default: false },
    isRead: { type: Boolean, default: false },
    link: { type: String, default: '' },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Notification', notificationSchema);
