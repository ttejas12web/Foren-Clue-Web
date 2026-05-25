import { Scale } from 'lucide-react';
import { SEO } from '@/components/layout/SEO';

export default function TermsOfService() {
  return (
    <div className="py-20 px-4 max-w-4xl mx-auto">
      <SEO 
        title="Terms of Service"
        description="ForenClue Terms of Service. Review rules for using course materials, participating in community threads, and enrollment rules."
        keywords="forenclue terms, forensic platform rules"
        canonicalPath="/terms"
      />
      <div className="text-center mb-16">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-warning/10 border border-warning/20 mb-6 shadow-[0_0_30px_rgba(255,165,0,0.2)]">
          <Scale className="text-warning" size={32} />
        </div>
        <h1 className="text-4xl md:text-5xl font-heading font-black mb-4 uppercase tracking-tight">
          Terms of <span className="text-warning">Service</span>
        </h1>
      </div>

      <div className="space-y-12 text-lg text-text-muted leading-relaxed">
        <section className="bg-surface p-8 border border-black/10 dark:border-white/10 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-warning/5 rounded-full blur-[50px] -z-10"></div>
          <h2 className="text-2xl font-heading font-bold mb-4 text-warning uppercase tracking-widest relative z-10">1. Acceptance of Terms</h2>
          <div className="space-y-4 relative z-10">
            <p>
              By accessing and using ForenClue, you accept and agree to be bound by the terms and provision of this agreement. 
              In addition, when using ForenClue's particular services related to forensic education, you shall be subject to any posted guidelines or rules applicable to such services.
            </p>
          </div>
        </section>

        <section className="bg-surface p-8 border border-black/10 dark:border-white/10 relative overflow-hidden">
          <h2 className="text-2xl font-heading font-bold mb-4 text-warning uppercase tracking-widest relative z-10">2. Description of Services</h2>
          <div className="space-y-4 relative z-10">
            <p>ForenClue provides users with access to a rich collection of resources related to forensic science, including:</p>
            <ul className="list-disc pl-6 space-y-2 text-text-main">
              <li>Structured educational courses ranging from beginner to advanced forensics.</li>
              <li>Interactive simulated case studies and evidence analysis tools.</li>
              <li>Community forums for discussing doubts, theories, and professional development.</li>
              <li>Career guidance and certification pathways.</li>
            </ul>
            <p>You understand and agree that the service is provided "AS-IS" and that ForenClue assumes no responsibility for the timeliness, deletion, mis-delivery or failure to store any user communications or personalization settings.</p>
          </div>
        </section>

        <section className="bg-surface p-8 border border-black/10 dark:border-white/10 relative overflow-hidden">
          <h2 className="text-2xl font-heading font-bold mb-4 text-warning uppercase tracking-widest relative z-10">3. User Conduct and Community Guidelines</h2>
          <div className="space-y-4 relative z-10">
            <p>To maintain a professional and safe learning environment, you agree to:</p>
            <ul className="list-disc pl-6 space-y-2 text-text-main">
              <li><strong>Academic Integrity:</strong> Not share answers to graded case studies or quizzes. Collaboration is encouraged in the community, but cheating undermines the learning process.</li>
              <li><strong>Respectful Interaction:</strong> Treat all community members with respect. Harassment, hate speech, or discriminatory language will result in immediate account suspension.</li>
              <li><strong>Appropriate Content:</strong> Do not upload or share explicit, illegal, or genuinely harmful "real-world" gore. Evidence shared in the community must be educational, simulated, or publicly cleared for instruction.</li>
            </ul>
          </div>
        </section>

        <section className="bg-surface p-8 border border-black/10 dark:border-white/10 relative overflow-hidden">
          <h2 className="text-2xl font-heading font-bold mb-4 text-warning uppercase tracking-widest relative z-10">4. Intellectual Property Rights</h2>
          <div className="space-y-4 relative z-10">
            <p>
              All materials provided on ForenClue, including but not limited to course content, videos, text, graphics, logos, images, and software, are the property of ForenClue or its content suppliers and are protected by international copyright laws. 
            </p>
            <p>
              You may not reproduce, distribute, modify, create derivative works of, publicly display, publicly perform, republish, download, store, or transmit any of the material on our Site without express written consent.
            </p>
          </div>
        </section>

        <section className="bg-surface p-8 border border-black/10 dark:border-white/10 relative overflow-hidden">
           <div className="absolute bottom-0 left-0 w-32 h-32 bg-warning/5 rounded-full blur-[50px] -z-10"></div>
          <h2 className="text-2xl font-heading font-bold mb-4 text-warning uppercase tracking-widest relative z-10">5. Limitation of Liability</h2>
          <div className="space-y-4 relative z-10">
            <p>
              ForenClue operates as an educational platform. The knowledge gained here is for educational and theoretical purposes. We are not liable for how you apply this knowledge in real-world professional, legal, or personal situations. Always adhere to your local laws and professional ethical guidelines when conducting any form of investigation.
            </p>
          </div>
        </section>
      </div>
    </div>
  );
}
