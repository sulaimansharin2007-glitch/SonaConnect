const Registration = require('../models/Registration');
const Event = require('../models/Event');
const generateQRCode = require('../utils/qrGenerator');
const { v4: uuidv4 } = require('uuid');

// @desc    Register for event
// @route   POST /api/registrations
const registerForEvent = async (req, res) => {
  try {
    const { eventId } = req.body;
    const event = await Event.findById(eventId);
    if (!event) return res.status(404).json({ message: 'Event not found' });

    const existing = await Registration.findOne({ student: req.user._id, event: eventId });
    if (existing) return res.status(400).json({ message: 'Already registered for this event' });

    const qrData = {
      registrationId: uuidv4(),
      studentId: req.user._id,
      studentName: req.user.name,
      eventId: event._id,
      eventTitle: event.title,
      eventDate: event.date,
      venue: event.venue,
    };

    const qrCode = await generateQRCode(qrData);

    const registration = await Registration.create({
      student: req.user._id,
      event: eventId,
      qrCode,
      qrData: JSON.stringify(qrData),
    });

    // Increment event registration count
    await Event.findByIdAndUpdate(eventId, { $inc: { registrationCount: 1 } });

    const populated = await registration.populate([
      { path: 'event', select: 'title date venue posterUrl' },
      { path: 'student', select: 'name email' },
    ]);

    res.status(201).json(populated);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get my registered events
// @route   GET /api/registrations/my-events
const getMyEvents = async (req, res) => {
  try {
    const registrations = await Registration.find({ student: req.user._id })
      .populate('event', 'title date time venue posterUrl category status organizer')
      .sort({ createdAt: -1 });
    res.json(registrations);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get registrations for an event (admin/faculty)
// @route   GET /api/registrations/event/:eventId
const getEventRegistrations = async (req, res) => {
  try {
    const registrations = await Registration.find({ event: req.params.eventId })
      .populate('student', 'name email department rollNumber')
      .sort({ createdAt: -1 });
    res.json(registrations);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Cancel registration
// @route   DELETE /api/registrations/:id
const cancelRegistration = async (req, res) => {
  try {
    const reg = await Registration.findOneAndDelete({ _id: req.params.id, student: req.user._id });
    if (!reg) return res.status(404).json({ message: 'Registration not found' });
    await Event.findByIdAndUpdate(reg.event, { $inc: { registrationCount: -1 } });
    res.json({ message: 'Registration cancelled' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { registerForEvent, getMyEvents, getEventRegistrations, cancelRegistration };
