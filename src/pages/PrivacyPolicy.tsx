import { Shield } from 'lucide-react';
import { SEO } from '@/components/layout/SEO';

export default function PrivacyPolicy() {
  return (
    <div className="py-20 px-4 max-w-4xl mx-auto">
      <SEO 
        title="Privacy Policy"
        description="ForenClue Privacy Policy. Understand how we secure your credential records, payment details, course logs, and educational progress profiles."
        keywords="forenclue privacy, forensic platform legal"
        canonicalPath="/privacy"
      />
      <div className="text-center mb-16">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-warning/10 border border-warning/20 mb-6 shadow-[0_0_30px_rgba(255,165,0,0.2)]">
          <Shield className="text-warning" size={32} />
        </div>
        <h1 className="text-4xl md:text-5xl font-heading font-black mb-4 uppercase tracking-tight">
          Privacy <span className="text-warning">Policy</span>
        </h1>
      </div>

      <div className="space-y-12 text-lg text-text-muted leading-relaxed">
        <section className="bg-surface p-8 border border-black/10 dark:border-white/10 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-warning/5 rounded-full blur-[50px] -z-10"></div>
          <h2 className="text-2xl font-heading font-bold mb-4 text-warning uppercase tracking-widest relative z-10">1. Information We Collect</h2>
          <div className="space-y-4 relative z-10">
            <p>At ForenClue, we collect information to provide, maintain, and improve our services, courses, and educational community features. This includes:</p>
            <ul className="list-disc pl-6 space-y-2 text-text-main">
              <li><strong>Account Information:</strong> Name, email address, profile photo (if provided via Google Login), and credentials generated during registration.</li>
              <li><strong>Service & Course Data:</strong> Interaction data, progress in courses, quiz scores, certifications earned, case study participations, bookmarks, and purchased packages.</li>
              <li><strong>Community Data:</strong> Doubts, comments, reports, flags, and direct interactions in the Community Forum.</li>
              <li><strong>Technical Data:</strong> IP addresses, browser types, interaction tracking within the application boundaries.</li>
            </ul>
          </div>
        </section>

        <section className="bg-surface p-8 border border-black/10 dark:border-white/10 relative overflow-hidden">
          <h2 className="text-2xl font-heading font-bold mb-4 text-warning uppercase tracking-widest relative z-10">2. How We Use Your Information</h2>
          <div className="space-y-4 relative z-10">
            <p>Your information is used extensively to personalize your learning journey in ForenClue. We use it to:</p>
            <ul className="list-disc pl-6 space-y-2 text-text-main">
              <li>Deliver our structured forensic courses, interactive case studies, and career guidance content seamlessly.</li>
              <li>Track progress and reward you with achievement badges and certifications upon milestone completions.</li>
              <li>Operate the Forensic Community Forum efficiently, maintaining moderation constraints, and preventing malicious activity using strict rule enforcement blocks.</li>
              <li>Send critical notifications regarding account management or changes in platform features.</li>
              <li>Improve service quality by analyzing overarching platform usage statistics in anonymity.</li>
            </ul>
          </div>
        </section>

        <section className="bg-surface p-8 border border-black/10 dark:border-white/10 relative overflow-hidden">
          <h2 className="text-2xl font-heading font-bold mb-4 text-warning uppercase tracking-widest relative z-10">3. Information Sharing and Disclosure</h2>
          <div className="space-y-4 relative z-10">
            <p>ForenClue holds your data in strict confidence. We do NOT sell, rent, or trade personal data to third parties. Sharing strictly occurs in the following situations:</p>
            <ul className="list-disc pl-6 space-y-2 text-text-main">
              <li><strong>Within the Community:</strong> Display names, profile icons, and public community posts (doubt threads and answers) will be open to other registered peers within the ForenClue ecosystem.</li>
              <li><strong>Legal Compliance:</strong> If demanded by law, subpoena, or standard regulatory procedures wherein explicit handover of accounts related to illegal activity applies.</li>
              <li><strong>Trusted Providers:</strong> Hosting and infrastructure providers (like Google Firebase) operating under enterprise-grade security protocols restricted exclusively to servicing this app.</li>
            </ul>
          </div>
        </section>

        <section className="bg-surface p-8 border border-black/10 dark:border-white/10 relative overflow-hidden">
          <h2 className="text-2xl font-heading font-bold mb-4 text-warning uppercase tracking-widest relative z-10">4. Your Data, Your Choices</h2>
          <div className="space-y-4 relative z-10">
            <p>We respect the sovereignty of your data. You possess the right to:</p>
            <ul className="list-disc pl-6 space-y-2 text-text-main">
              <li>Review the account activity and adjust visibility settings within user configurations.</li>
              <li>Reach out securely requesting total removal or export of personal platform data associated strictly with services and forensic coursework completions.</li>
              <li>Manage cookie settings or device-level tracking capabilities locally through respective browsers or software systems.</li>
            </ul>
          </div>
        </section>

        <section className="bg-surface p-8 border border-black/10 dark:border-white/10 relative overflow-hidden">
           <div className="absolute bottom-0 left-0 w-32 h-32 bg-warning/5 rounded-full blur-[50px] -z-10"></div>
          <h2 className="text-2xl font-heading font-bold mb-4 text-warning uppercase tracking-widest relative z-10">5. Contact Us</h2>
          <div className="space-y-4 relative z-10">
            <p>
              If you have any questions, concerns, or requests relating to privacy constraints within ForenClue, including the handling of community interactions, forensic case studies, or related educational features, please refer to our <a href="/contact" className="text-warning hover:underline">Contact Page</a> or submit a query directly within the community parameters.
            </p>
          </div>
        </section>
      </div>
    </div>
  );
}
