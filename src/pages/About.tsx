import { motion, useMotionValue, useSpring, useTransform } from 'motion/react';
import { SEO } from '@/components/layout/SEO';

const TeamCard = ({ member }: { member: any }) => {
  const x = useMotionValue(0);
  const y = useMotionValue(0);

  const mouseXSpring = useSpring(x, { stiffness: 300, damping: 30 });
  const mouseYSpring = useSpring(y, { stiffness: 300, damping: 30 });

  const rotateX = useTransform(mouseYSpring, [-0.5, 0.5], ["15deg", "-15deg"]);
  const rotateY = useTransform(mouseXSpring, [-0.5, 0.5], ["-15deg", "15deg"]);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const width = rect.width;
    const height = rect.height;
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;
    
    const xPct = mouseX / width - 0.5;
    const yPct = mouseY / height - 0.5;
    
    x.set(xPct);
    y.set(yPct);
  };

  const handleMouseLeave = () => {
    x.set(0);
    y.set(0);
  };

  return (
    <motion.div 
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      style={{
        rotateX,
        rotateY,
        transformStyle: "preserve-3d"
      }}
      className="bg-surface p-8 mx-auto border border-black/10 dark:border-white/5 flex flex-col gap-6 items-center shadow-2xl relative overflow-hidden max-w-sm w-full"
    >
      <div className="absolute top-0 right-0 w-32 h-32 bg-warning/5 rounded-full blur-[50px]"></div>
      
      <motion.div 
        style={{ transform: "translateZ(50px)" }}
        className="w-40 h-40 bg-black/5 dark:bg-white/10 rounded-full flex items-center justify-center overflow-hidden shrink-0 border-4 border-warning/20 shadow-xl"
      >
        {member.image ? (
          <img src={member.image} alt={member.name} className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full bg-base/50 flex items-center justify-center text-3xl font-heading font-black text-text-main/20 uppercase tracking-widest">
            {member.name.split(' ').map((n: string) => n[0]).join('')}
          </div>
        )}
      </motion.div>
      
      <motion.div 
        style={{ transform: "translateZ(30px)" }}
        className="relative z-10 text-center"
      >
        <h3 className="text-2xl font-bold font-heading drop-shadow-md">{member.name}</h3>
        <p className="text-warning mb-4 uppercase tracking-widest text-xs font-bold drop-shadow-md">{member.role}</p>
        <div className="flex flex-col gap-2">
          {member.points.map((point: string, i: number) => (
            <p key={i} className="text-text-muted shadow-black drop-shadow-sm text-sm">&bull; {point}</p>
          ))}
        </div>
      </motion.div>
    </motion.div>
  );
};

export default function About() {
  const team = [
    {
      name: "Tejas Tapse",
      role: "Founder of Foren Clue",
      image: "https://blogger.googleusercontent.com/img/b/R29vZ2xl/AVvXsEhBbTT3QCs_EHXasFjAT9pC1laU-vAIRhIQ7qjpQHS3ErsprqykE9eT63H-XnATqutTGhCjq-zzbmvCeFhHfE0_DZ1wtZmu8pmARltV1makLhdqyCwftxjW55J0qyPbmjn6H6Abb6OzIHPUrkbkYOwmDeVxLmGyH_0nbr9qOnWtWKEg3NaPIvEJKTNg8vU/s1323/IMG_0865.PNG",
      points: [
        "Creator of Neet Cracker",
        "Passionate about forensic education",
        "Dedicated to making learning stress-free"
      ]
    },
    {
      name: "Mrunmayee Bodhe",
      role: "Chief Executive Officer",
      image: "https://blogger.googleusercontent.com/img/b/R29vZ2xl/AVvXsEjt-N4hwGU4tzUkx9XwNKGHv2Te4J3tbfxJWFRXS6Z3KzdZX1f9VKZB88MYTeF4OqePRwDcGMbqjmOpoROSJlsSHaZJnLEIMnP2S98gBLOlP6IDs33SBqLf7yhLEyWCICI90IfGk5XV06fUYonMDC5zufGitO8-sTe1sIExdZcckiMh0VuZmmmPJpxhGQs/s1352/IMG_0866.PNG",
      points: [
        "CEO Of ForenClue Ventures",
        "Forensic Enthusiast",
        "Academic Counselor"
      ]
    },
    {
      name: "Ayush Gaikwad",
      role: "Co-Founder",
      image: "https://blogger.googleusercontent.com/img/b/R29vZ2xl/AVvXsEjsllQMEHs5qT_GJSyZnGVcFH64Zadagai4Y9rlbFHQ9vuaVgX-3CgkApXQu660nTDPB0C3mEMJoZSnhLnOpBtTOt5mlEEADPKcOZbzcem8pq3flsJWbG6adC-aDmg9tlmyu4nGyaDh-TLzHanJ4dde67VUggiI5rMCb-4dVVUzRhY-A_EJKmiQgLkJez4/s1462/IMG_0859%20(1).PNG",
      points: [
        "Forensic Science Student"
      ]
    },
    {
      name: "Sarth Mokashe",
      role: "CTO (chief technology officer)",
      image: "https://blogger.googleusercontent.com/img/b/R29vZ2xl/AVvXsEjBOD-MYdx8QLRJS5661FjsUWiJhE32YCEx_iL2c_GNKokQMOTwPp33kITBOmAiYNC7Ts32Y-0vMbLARycBesex9MiXce4lddvzBtTMceMrbCOX90EE-ogSVoGOebV4pJiIY6avW5JKbCA2n2EUPutGRzF3biG_oBRKPEf3tb78h_izZU8ZvN2DT7AvC5g/s1429/D7139389-0F3C-4CF7-A6EB-78FB8834BEA1.png",
      points: [
        "Chief Technology Officer"
      ]
    }
  ];

  return (
    <div className="py-20 px-4 max-w-7xl mx-auto relative perspective-[2000px]">
      <SEO 
        title="About Our Mission & Team"
        description="Learn about the visionaries, educators, and technology experts behind ForenClue. We are democratizing case-based and high-fidelity forensic science learning globally."
        keywords="forenclue founders, forenclue team, tejas tapse, mrunmayee bodhe, forensic learning platform, chief technology officer forensic"
        canonicalPath="/about"
      />
      <div className="max-w-4xl mx-auto mb-24 text-left">
        <h1 className="text-4xl md:text-5xl font-heading font-black mb-12 uppercase tracking-tight text-center">
          About <span className="text-warning">ForenClue</span>
        </h1>
        
        <div className="bg-surface p-8 border border-black/10 dark:border-white/10 mb-12 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-warning/5 rounded-full blur-[50px] -z-10"></div>
          <h2 className="text-2xl font-heading font-bold mb-4 text-warning uppercase tracking-widest">Our Vision</h2>
          <p className="text-lg text-text-muted leading-relaxed relative z-10">
            At ForenClue, we envision a future where top-tier forensic education is democratized and accessible to every passionate student. We aim to bridge the gap between theoretical knowledge and real-world application, cultivating a new generation of investigators equipped to solve the challenges of modern crime and digital forensics globally.
          </p>
        </div>

        <div className="bg-surface p-8 border border-black/10 dark:border-white/10 mb-12 relative overflow-hidden">
          <div className="absolute bottom-0 left-0 w-32 h-32 bg-warning/5 rounded-full blur-[50px] -z-10"></div>
          <h2 className="text-2xl font-heading font-bold mb-4 text-warning uppercase tracking-widest">Our Mission</h2>
          <p className="text-lg text-text-muted leading-relaxed mb-6 relative z-10">
            Our mission is to empower aspiring forensic scientists through practical, engaging, and career-driven learning experiences. We are dedicated to:
          </p>
          <ul className="space-y-4 text-text-muted text-base relative z-10">
            <li className="flex gap-4 items-start">
              <div className="w-1.5 h-1.5 rounded-full bg-warning mt-2 shrink-0"></div>
              <span><strong className="text-text-main">Demystifying Forensics:</strong> Breaking down complex scientific concepts into accessible, easy-to-understand modules.</span>
            </li>
            <li className="flex gap-4 items-start">
              <div className="w-1.5 h-1.5 rounded-full bg-warning mt-2 shrink-0"></div>
              <span><strong className="text-text-main">Practical Empowerment:</strong> Providing hands-on tools, simulated case studies, and real-world exposure that textbooks simply cannot offer.</span>
            </li>
            <li className="flex gap-4 items-start">
              <div className="w-1.5 h-1.5 rounded-full bg-warning mt-2 shrink-0"></div>
              <span><strong className="text-text-main">Community Building:</strong> Fostering India’s strongest inclusive network for forensic discussion, collaboration, and career mentorship.</span>
            </li>
             <li className="flex gap-4 items-start">
              <div className="w-1.5 h-1.5 rounded-full bg-warning mt-2 shrink-0"></div>
              <span><strong className="text-text-main">Career Advancement:</strong> Offering certifications and pathways that actively boost professional profiles.</span>
            </li>
          </ul>
        </div>
      </div>

      <div className="max-w-7xl mx-auto perspective-[2000px]">
        <h2 className="text-3xl font-heading font-black mb-12 text-center">Meet Our Team</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 justify-center">
          {team.map((member, i) => (
            <TeamCard key={i} member={member} />
          ))}
        </div>
      </div>
    </div>
  );
}
