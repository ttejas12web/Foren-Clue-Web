import { SEO } from "@/components/layout/SEO";

export default function Services() {
  const services = [
    { title: "Workshops & Webinars", desc: "Live sessions with industry veterans and investigators." },
    { title: "Certification Programs", desc: "Recognized certificates to boost your career profile." },
    { title: "College Collaborations", desc: "Partner with us to bring forensic programs to your institute." }
  ];

  return (
    <div className="py-20 px-4 max-w-7xl mx-auto">
      <SEO 
        title="Forensic Workshops, Certifications, and College Collaborations"
        description="Boost your profile with recognized forensic certification credentials, live webinars, physical hands-on workshops, and institutional university affiliations."
        keywords="forensic science workshops, forensic science certified online, forensic university collaboration, study forensics program"
        canonicalPath="/services"
      />
      <h1 className="text-4xl md:text-6xl font-heading font-black mb-16 text-center uppercase tracking-tight">
        Our <span className="text-warning">Services</span>
      </h1>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {services.map((service, i) => (
          <div key={i} className="bg-surface p-10 border border-black/10 dark:border-white/5 hover:border-warning transition-colors group">
            <h2 className="text-2xl font-heading font-bold mb-4">{service.title}</h2>
            <p className="text-text-muted mb-8">{service.desc}</p>
            <button className="text-sm font-bold text-warning uppercase tracking-widest flex items-center gap-2 group-hover:gap-4 transition-all">
              Learn More <span>→</span>
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
