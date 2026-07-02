const Event = require('../models/Event');
const Notification = require('../models/Notification');

// @desc    Get all events (with filters)
// @route   GET /api/events
const getEvents = async (req, res) => {
  try {
    const { category, status, club, search } = req.query;
    let query = { isApproved: true };
    if (category) query.category = category;
    if (status) query.status = status;
    if (club) query.club = club;
    if (search) query.title = { $regex: search, $options: 'i' };

    const events = await Event.find(query)
      .populate('club', 'name logoUrl')
      .populate('createdBy', 'name')
      .sort({ date: 1 });
    res.json(events);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get all events for admin (including unapproved)
// @route   GET /api/events/all
const getAllEvents = async (req, res) => {
  try {
    const events = await Event.find()
      .populate('club', 'name logoUrl')
      .populate('createdBy', 'name email')
      .sort({ createdAt: -1 });
    res.json(events);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get single event
// @route   GET /api/events/:id
const getEventById = async (req, res) => {
  try {
    const event = await Event.findById(req.params.id)
      .populate('club', 'name logoUrl facultyIncharge')
      .populate('createdBy', 'name email');
    if (!event) return res.status(404).json({ message: 'Event not found' });
    res.json(event);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Create event
// @route   POST /api/events
const createEvent = async (req, res) => {
  try {
    const eventData = { ...req.body, createdBy: req.user._id };
    // Auto-approve events created by admins and faculty
    if (['super_admin', 'club_admin', 'faculty'].includes(req.user.role)) {
      eventData.isApproved = true;
    }

    const event = await Event.create(eventData);

    // Create global notification
    await Notification.create({
      title: `New Event: ${event.title}`,
      message: event.date
        ? `A new ${event.category} event has been added on ${new Date(event.date).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}`
        : `A new ${event.category} event has been added. Check it out!`,
      type: 'event',
      isGlobal: true,
      link: `/events/${event._id}`,
    });

    res.status(201).json(event);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Update event
// @route   PUT /api/events/:id
const updateEvent = async (req, res) => {
  try {
    const event = await Event.findById(req.params.id);
    if (!event) return res.status(404).json({ message: 'Event not found' });

    const updatedEvent = await Event.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json(updatedEvent);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Delete event
// @route   DELETE /api/events/:id
const deleteEvent = async (req, res) => {
  try {
    const event = await Event.findById(req.params.id);
    if (!event) return res.status(404).json({ message: 'Event not found' });

    await Event.findByIdAndDelete(req.params.id);
    res.json({ message: 'Event removed' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Approve event (super_admin)
// @route   PUT /api/events/:id/approve
const approveEvent = async (req, res) => {
  try {
    const event = await Event.findByIdAndUpdate(req.params.id, { isApproved: true }, { new: true });
    if (!event) return res.status(404).json({ message: 'Event not found' });
    res.json(event);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get stats
// @route   GET /api/events/stats
const getStats = async (req, res) => {
  try {
    const totalEvents = await Event.countDocuments({ isApproved: true });
    const upcomingEvents = await Event.countDocuments({ status: 'upcoming', isApproved: true });
    const completedEvents = await Event.countDocuments({ status: 'completed' });
    const hackathons = await Event.countDocuments({ category: 'hackathon', isApproved: true });
    res.json({ totalEvents, upcomingEvents, completedEvents, hackathons });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { getEvents, getAllEvents, getEventById, createEvent, updateEvent, deleteEvent, approveEvent, getStats };
