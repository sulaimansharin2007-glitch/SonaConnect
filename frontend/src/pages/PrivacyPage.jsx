import { Link } from 'react-router-dom';
import { Shield, ArrowLeft } from 'lucide-react';

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-dark text-white py-12 px-4">
      <div className="max-w-3xl mx-auto">

        {/* Back */}
        <Link to="/" className="inline-flex items-center gap-2 text-white/50 hover:text-white text-sm mb-8 transition-colors">
          <ArrowLeft size={16} /> Back to SonaConnect
        </Link>

        {/* Header */}
        <div className="flex items-center gap-3 mb-8">
          <div className="w-12 h-12 rounded-2xl bg-primary-500/20 flex items-center justify-center">
            <Shield size={24} className="text-primary-400" />
          </div>
          <div>
            <h1 className="text-3xl font-bold">Privacy Policy</h1>
            <p className="text-white/50 text-sm">Last updated: July 2025</p>
          </div>
        </div>

        <div className="space-y-8 text-white/80 leading-relaxed">

          <section className="glass rounded-2xl p-6 border border-white/10">
            <h2 className="text-xl font-semibold text-white mb-3">1. About SonaConnect</h2>
            <p>
              SonaConnect is a college event management platform built for Sona College of Technology, Salem. It helps students, faculty, and club administrators discover, publish, and manage college events in one place.
            </p>
          </section>

          <section className="glass rounded-2xl p-6 border border-white/10">
            <h2 className="text-xl font-semibold text-white mb-3">2. Information We Collect</h2>
            <ul className="list-disc list-inside space-y-2">
              <li><strong className="text-white">Name</strong> — to personalize your account.</li>
              <li><strong className="text-white">Email address</strong> — to authenticate your account and send notifications.</li>
              <li><strong className="text-white">WhatsApp phone number</strong> — collected only for Faculty and Club Admin accounts to enable WhatsApp Bot event publishing.</li>
              <li><strong className="text-white">Department and role</strong> — to show you relevant events and grant appropriate access.</li>
              <li><strong className="text-white">Roll number</strong> — optionally provided by students for identification.</li>
            </ul>
          </section>

          <section className="glass rounded-2xl p-6 border border-white/10">
            <h2 className="text-xl font-semibold text-white mb-3">3. How We Use Your Information</h2>
            <ul className="list-disc list-inside space-y-2">
              <li>To create and manage your SonaConnect account.</li>
              <li>To send WhatsApp OTP verification codes during Faculty/Admin registration.</li>
              <li>To authorize WhatsApp Bot event publishing for verified faculty and club admins.</li>
              <li>To display events, clubs, workshops, and hackathons relevant to your role and department.</li>
              <li>To send in-platform notifications about events you have registered for.</li>
            </ul>
          </section>

          <section className="glass rounded-2xl p-6 border border-white/10">
            <h2 className="text-xl font-semibold text-white mb-3">4. WhatsApp Integration</h2>
            <p>
              SonaConnect uses the <strong className="text-white">Meta WhatsApp Business API</strong> to send OTP verification messages to faculty and club admins during signup, and to receive event poster images from authorized faculty members via WhatsApp. Your WhatsApp phone number is stored securely and is only used for the purposes described above.
            </p>
          </section>

          <section className="glass rounded-2xl p-6 border border-white/10">
            <h2 className="text-xl font-semibold text-white mb-3">5. Data Sharing</h2>
            <p>
              We do <strong className="text-white">not</strong> sell, trade, or share your personal information with any third parties. Data is only used within the SonaConnect platform and the Meta WhatsApp API for the stated purposes.
            </p>
          </section>

          <section className="glass rounded-2xl p-6 border border-white/10">
            <h2 className="text-xl font-semibold text-white mb-3">6. Data Security</h2>
            <p>
              All data is stored securely in a MongoDB database hosted on MongoDB Atlas. Passwords are encrypted using bcrypt. WhatsApp tokens and API keys are stored as environment variables and are never exposed publicly.
            </p>
          </section>

          <section className="glass rounded-2xl p-6 border border-white/10">
            <h2 className="text-xl font-semibold text-white mb-3">7. Your Rights</h2>
            <p>
              You may request deletion of your account and associated data at any time by contacting us. Once deleted, your personal information will be permanently removed from our systems.
            </p>
          </section>

          <section className="glass rounded-2xl p-6 border border-white/10">
            <h2 className="text-xl font-semibold text-white mb-3">8. Contact Us</h2>
            <p>
              If you have any questions about this Privacy Policy, please contact the SonaConnect development team at Sona College of Technology, Salem, Tamil Nadu, India.
            </p>
            <p className="mt-2">
              Email: <a href="mailto:sonaconnect@sonatech.ac.in" className="text-primary-400 hover:underline">sonaconnect@sonatech.ac.in</a>
            </p>
          </section>

        </div>

        <p className="text-center text-white/30 text-sm mt-12">
          © {new Date().getFullYear()} SonaConnect — Sona College of Technology
        </p>

      </div>
    </div>
  );
}
