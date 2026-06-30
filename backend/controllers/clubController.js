const Club = require('../models/Club');
const User = require('../models/User');

// @desc    Get all clubs
// @route   GET /api/clubs
const getClubs = async (req, res) => {
  try {
    const clubs = await Club.find({ isActive: true }).populate('admin', 'name email');
    res.json(clubs);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get single club
// @route   GET /api/clubs/:id
const getClubById = async (req, res) => {
  try {
    const club = await Club.findById(req.params.id).populate('admin', 'name email').populate('members', 'name email department');
    if (!club) return res.status(404).json({ message: 'Club not found' });
    res.json(club);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Create club
// @route   POST /api/clubs
const createClub = async (req, res) => {
  try {
    const club = await Club.create(req.body);
    res.status(201).json(club);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Update club
// @route   PUT /api/clubs/:id
const updateClub = async (req, res) => {
  try {
    const club = await Club.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!club) return res.status(404).json({ message: 'Club not found' });
    res.json(club);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Delete club
// @route   DELETE /api/clubs/:id
const deleteClub = async (req, res) => {
  try {
    const club = await Club.findByIdAndDelete(req.params.id);
    if (!club) return res.status(404).json({ message: 'Club not found' });
    res.json({ message: 'Club removed' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Join a club
// @route   POST /api/clubs/:id/join
const joinClub = async (req, res) => {
  try {
    const club = await Club.findById(req.params.id);
    if (!club) return res.status(404).json({ message: 'Club not found' });
    if (club.members.includes(req.user._id)) {
      return res.status(400).json({ message: 'Already a member' });
    }
    club.members.push(req.user._id);
    club.memberCount = club.members.length;
    await club.save();
    res.json({ message: 'Joined club successfully', club });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Add announcement
// @route   POST /api/clubs/:id/announcements
const addAnnouncement = async (req, res) => {
  try {
    const { title, message } = req.body;
    const club = await Club.findById(req.params.id);
    if (!club) return res.status(404).json({ message: 'Club not found' });
    club.announcements.unshift({ title, message });
    await club.save();
    res.json(club);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get clubs managed by faculty
// @route   GET /api/clubs/my-managed-clubs
const getMyManagedClubs = async (req, res) => {
  try {
    const clubs = await Club.find({ facultyEmail: req.user.email }).populate('members', 'name email department rollNumber');
    res.json(clubs);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { getClubs, getClubById, createClub, updateClub, deleteClub, joinClub, addAnnouncement, getMyManagedClubs };
