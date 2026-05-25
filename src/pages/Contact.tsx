import { Mail, MapPin } from "lucide-react";
import { SEO } from "@/components/layout/SEO";

export default function Contact() {
  return (
    <div className="py-20 px-4 max-w-7xl mx-auto">
      <SEO 
        title="Contact Forensic Education Support & Advisory"
        description="Reach out to ForenClue. Send your queries regarding forensic science certifications, institute partnerships, customized training, or handbook pre-orders."
        keywords="contact forenclue, forensic support portal, contact forensic advisory team, mumbai forensic institute"
        canonicalPath="/contact"
      />
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-16">
        <div>
          <h1 className="text-4xl md:text-6xl font-heading font-black mb-6 uppercase tracking-tight text-warning">
            Contact Us
          </h1>
          <p className="text-xl text-text-muted mb-12">
            Have a question? We're here to help you on your forensic journey.
          </p>

          <div className="space-y-6">
            <div className="flex items-center gap-4 bg-surface p-6 border border-black/10 dark:border-white/5">
              <div className="p-4 bg-warning/10 text-warning rounded-full"><Mail size={24} /></div>
              <div>
                <p className="text-sm text-text-muted mb-1">Email Support</p>
                <p className="font-medium text-lg">support@forenclue.com</p>
              </div>
            </div>
            <div className="flex items-center gap-4 bg-surface p-6 border border-black/10 dark:border-white/5">
              <div className="p-4 bg-warning/10 text-warning rounded-full"><MapPin size={24} /></div>
              <div>
                <p className="text-sm text-text-muted mb-1">Location</p>
                <p className="font-medium text-lg">Navi Mumbai, India</p>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-surface p-8 border border-black/10 dark:border-white/5 relative">
          <div className="absolute top-0 right-0 w-20 h-20 border-t border-r border-warning/30" />
          <h2 className="text-2xl font-bold font-heading mb-8">Send a Message</h2>
          <form className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-text-muted mb-2">Name</label>
              <input type="text" className="w-full bg-base border border-black/10 dark:border-white/10 px-4 py-3 text-text-main focus:border-warning focus:outline-none transition-colors" />
            </div>
            <div>
              <label className="block text-sm font-medium text-text-muted mb-2">Email</label>
              <input type="email" className="w-full bg-base border border-black/10 dark:border-white/10 px-4 py-3 text-text-main focus:border-warning focus:outline-none transition-colors" />
            </div>
            <div>
              <label className="block text-sm font-medium text-text-muted mb-2">Message</label>
              <textarea rows={4} className="w-full bg-base border border-black/10 dark:border-white/10 px-4 py-3 text-text-main focus:border-warning focus:outline-none transition-colors"></textarea>
            </div>
            <button className="w-full py-4 bg-warning text-crust font-black uppercase tracking-wider hover:bg-warning-dark transition-colors">
              Send Message
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
