const Event = require('../models/Event');
const Notification = require('../models/Notification');

// @desc    Get all events (with filters)
// @route   GET /api/events
const getEvents = async (req, res) => {
  try {
    // Auto-update events that are past their date to 'completed' status
    await Event.updateMany(
      { date: { $lt: new Date() }, status: 'upcoming' },
      { $set: { status: 'completed' } }
    );

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

// Helper: upload base64 image to ImgBB and return URL
const uploadToImgBB = async (base64OrUrl) => {
  try {
    if (!base64OrUrl || base64OrUrl.startsWith('http')) return base64OrUrl; // already a URL
    const imgbbKey = process.env.IMGBB_API_KEY;
    if (!imgbbKey) return base64OrUrl;
    const axios = require('axios');
    const FormData = require('form-data');
    const form = new FormData();
    const base64Data = base64OrUrl.replace(/^data:image\/\w+;base64,/, '');
    form.append('key', imgbbKey);
    form.append('image', base64Data);
    const res = await axios.post('https://api.imgbb.com/1/upload', form, { headers: form.getHeaders() });
    return res.data?.data?.display_url || res.data?.data?.url || base64OrUrl;
  } catch (err) {
    console.warn('ImgBB upload failed:', err.message);
    return base64OrUrl;
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

    // Upload poster to ImgBB if it's a base64 string
    if (eventData.posterUrl && eventData.posterUrl.startsWith('data:')) {
      eventData.posterUrl = await uploadToImgBB(eventData.posterUrl);
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

    const updateData = { ...req.body };
    // Upload poster to ImgBB if it's a new base64 string
    if (updateData.posterUrl && updateData.posterUrl.startsWith('data:')) {
      updateData.posterUrl = await uploadToImgBB(updateData.posterUrl);
    }

    const updatedEvent = await Event.findByIdAndUpdate(req.params.id, updateData, { new: true });
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
