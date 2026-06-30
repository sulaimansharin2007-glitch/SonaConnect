const mongoose = require('mongoose');

const registrationSchema = new mongoose.Schema(
  {
    student: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    event: { type: mongoose.Schema.Types.ObjectId, ref: 'Event', required: true },
    registrationDate: { type: Date, default: Date.now },
    attendanceStatus: {
      type: String,
      enum: ['registered', 'attended', 'absent'],
      default: 'registered',
    },
    qrCode: { type: String, default: '' },
    qrData: { type: String, default: '' },
  },
  { timestamps: true }
);

registrationSchema.index({ student: 1, event: 1 }, { unique: true });

module.exports = mongoose.model('Registration', registrationSchema);
