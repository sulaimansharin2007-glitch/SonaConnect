require('dotenv').config();
const mongoose = require('mongoose');
const connectDB = require('../config/db');
const User = require('../models/User');
const Club = require('../models/Club');
const Event = require('../models/Event');
const Notification = require('../models/Notification');

const clubs = [
  { name: 'Music Club', description: 'Celebrating musical talent through performances, concerts and workshops. Open to all music enthusiasts.', category: 'cultural' },
  { name: 'Programming Club', description: 'Fostering coding skills through hackathons, competitive programming and tech talks.', category: 'technical' },
  { name: 'Readers Club', description: 'Promoting the love of reading through book discussions, author interactions and literary events.', category: 'literary' },
  { name: 'Yoga Club', description: 'Promoting physical and mental wellness through yoga sessions and meditation workshops.', category: 'sports' },
  { name: 'Sports Club', description: 'Organizing inter-college sports events, tournaments and fitness activities.', category: 'sports' },
  { name: "Women's Club", description: 'Empowering women students through leadership programs, skill development and awareness campaigns.', category: 'social' },
  { name: 'Tremors Club', description: 'The adventure and trekking club organizing outdoor expeditions and nature activities.', category: 'sports' },
  { name: 'English Club', description: 'Enhancing English communication skills through debates, elocution and literary competitions.', category: 'literary' },
  { name: 'Science Club', description: 'Encouraging scientific curiosity through experiments, science fairs and innovation challenges.', category: 'technical' },
  { name: 'IQ Club', description: 'Developing analytical and problem-solving skills through quizzes and brain games.', category: 'literary' },
  { name: 'Dexturs Club', description: 'The robotics and automation club building innovative machines and participating in national competitions.', category: 'technical' },
  { name: 'Modern Theatre Club', description: 'Creating powerful theatrical performances including plays, street theatre and mime acts.', category: 'arts' },
  { name: 'Tamil Mandram', description: 'Promoting Tamil language, culture and heritage through literary and cultural events.', category: 'cultural' },
  { name: 'Sona Readers Club', description: 'The official book club of Sona College fostering a reading culture among students.', category: 'literary' },
  { name: 'Sona Radio', description: 'Campus radio station run by students covering news, entertainment and talk shows.', category: 'cultural' },
  { name: 'Blood Donors Club', description: 'Organizing blood donation camps and spreading awareness about the importance of blood donation.', category: 'social' },
];

const seedDB = async () => {
  await connectDB();
  console.log('🌱 Starting seed...');

  // Clear existing data
  await User.deleteMany({});
  await Club.deleteMany({});
  await Event.deleteMany({});
  await Notification.deleteMany({});
  console.log('🗑️  Cleared existing data');

  // Create users
  const superAdmin = await User.create({
    name: 'Super Admin',
    email: 'admin@sona.edu.in',
    password: 'Admin@123',
    role: 'super_admin',
    department: 'Administration',
  });


  console.log('👥 Users created');

  // Create clubs
  const createdClubs = [];
  for (const club of clubs) {
    const c = await Club.create({ ...club });
    createdClubs.push(c);
  }
  console.log(`🏛️  ${createdClubs.length} clubs created`);

  // Create events (future dates)
  // No events added by default as requested.
  console.log(`🎉 0 events created`);

  // Create notifications
  // No notifications added by default as requested.
  console.log('🔔 0 Notifications created');

  console.log('\n✅ Seed completed successfully!');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('Demo Accounts:');
  console.log('  Super Admin: admin@sona.edu.in / Admin@123');

  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

  mongoose.connection.close();
};

seedDB().catch((err) => {
  console.error('Seed error:', err);
  mongoose.connection.close();
});
