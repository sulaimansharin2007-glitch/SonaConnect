const cron = require('node-cron');
const Event = require('../models/Event');
const Registration = require('../models/Registration');
const Notification = require('../models/Notification');
const sendWhatsAppMessage = require('../utils/whatsappService');

// Schedule daily check at 08:00 AM
const initDailyEventReminders = () => {
  cron.schedule('0 8 * * *', async () => {
    console.log('⏰ Running Daily Event Reminder Cron Job...');
    try {
      // Get today's date formatted as YYYY-MM-DD
      const today = new Date().toISOString().split('T')[0];

      // Find events happening today
      const todaysEvents = await Event.find({
        date: today,
        isApproved: true
      });

      if (!todaysEvents || todaysEvents.length === 0) {
        console.log('ℹ️ No events happening today.');
        return;
      }

      console.log(`📌 Found ${todaysEvents.length} events scheduled for today.`);

      const User = require('../models/User');
      const allUsers = await User.find({ isActive: true });

      for (const event of todaysEvents) {
        // 1. Create a global notification on SonaConnect website for all students/users
        await Notification.create({
          title: `🔔 Event Today: ${event.title}`,
          message: `"${event.title}" is happening TODAY at ${event.time || 'scheduled time'} in ${event.venue || 'campus venue'}. Check it out now!`,
          type: 'event',
          isGlobal: true,
          link: `/events/${event._id}`
        });

        // 2. Send WhatsApp Notification to ALL users who have a phone number on SonaConnect
        for (const user of allUsers) {
          if (user.phoneNumber) {
            const message = `🔔 *SonaConnect Daily Digest*\n\nHi ${user.name}!\nThere is an exciting event happening TODAY at Sona College!\n\n📌 *Event:* ${event.title}\n🕒 *Time:* ${event.time || 'TBD'}\n📍 *Venue:* ${event.venue || 'Campus Venue'}\n\nDon't miss out! Visit SonaConnect to view details and join now: https://sonaconnect.onrender.com/events/${event._id} 🎉`;
            
            await sendWhatsAppMessage(user.phoneNumber, message).catch(e => console.error(e));
          }
        }
      }
      console.log('✅ Broadcasted Today\'s Event notifications to all users successfully!');
    } catch (err) {
      console.error('❌ Error in daily event reminder cron job:', err);
    }
  });
};

module.exports = initDailyEventReminders;
