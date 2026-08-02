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

      for (const event of todaysEvents) {
        // Find all registered students for this event
        const registrations = await Registration.find({ event: event._id }).populate('student');

        for (const reg of registrations) {
          const student = reg.student;
          if (!student) continue;

          // 1. Create In-App Notification
          await Notification.create({
            recipient: student._id,
            title: `🔔 Event Today: ${event.title}`,
            message: `Reminder: "${event.title}" is happening today at ${event.time || 'scheduled time'} in ${event.venue || 'campus venue'}. Don't forget your QR pass!`,
            type: 'event_update',
            link: `/events/${event._id}`
          });

          // 2. Send WhatsApp Notification if phone number exists
          if (student.phoneNumber) {
            const message = `🔔 *SonaConnect Event Reminder*\n\nHi ${student.name}!\nYour registered event *${event.title}* is happening TODAY!\n\n🕒 *Time:* ${event.time || 'TBD'}\n📍 *Venue:* ${event.venue || 'Campus Venue'}\n\nPlease keep your QR code pass ready on SonaConnect. See you there! 🎉`;
            
            await sendWhatsAppMessage(student.phoneNumber, message);
          }
        }
      }
      console.log('✅ Daily Event Reminders sent successfully!');
    } catch (err) {
      console.error('❌ Error in daily event reminder cron job:', err);
    }
  });
};

module.exports = initDailyEventReminders;
