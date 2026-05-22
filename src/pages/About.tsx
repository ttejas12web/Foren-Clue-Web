import { motion, useMotionValue, useSpring, useTransform } from 'motion/react';

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
      role: "Founder of Foren Clue | Forensic Science Student",
      image: "https://blogger.googleusercontent.com/img/b/R29vZ2xl/AVvXsEjbA2bNXKfIxI7Qu74ewsnfg3DfivOnnt75Pzyd84TNf8UtCUVw0P9t-c-L9IGanpGt0Y_6B9p-3Bh8g3tAt1vSLMoZ9XMkTznEYGeEaQ-JCI3RgAmwKcEbvMQYxUYWc-Pa9htjJFIwHuaF87Zk1NejgEvwzoOF8GhPb-k7KI9tK2t1NP2IXhXWDLTv7qs/s1536/3E3F94BB-E3E0-4642-8D7D-95C9101B469F.jpg",
      points: [
        "Creator of Neet Cracker",
        "Passionate about forensic education",
        "Dedicated to making learning stress-free"
      ]
    },
    {
      name: "Mrunmayee Bodhe",
      role: "Chief Executive Officer",
      image: "https://blogger.googleusercontent.com/img/b/R29vZ2xl/AVvXsEitDO6DU6jqsjEi9qlT_F8Nnt-CURNLMWysqiQZaaBtuvQs8gTv34MFU4_EEhEAJp-_VMSheOmEWghWS0SEm21MUbS0l37WaoaLvZiqXt968mvmZ_1QHgvpbuuwHxMldrvKRfYbgtM4N-6jX88qJjnziD_OcMiPKs4jw75gcjsWy0jwaM7ARH0t-1Y4tyE/s1280/photo_6323596718204718711_y.jpg",
      points: [
        "CEO Of Foren Clue Ventures",
        "Forensic Enthusiast",
        "Academic Counselor"
      ]
    },
    {
      name: "Ayush Gaikwad",
      role: "Co-Founder",
      image: "https://blogger.googleusercontent.com/img/b/R29vZ2xl/AVvXsEgLYq3YLScCtq9eKGJP1cWrqOlYe3kxV9GUbm405NlbaO7i8tYUiwbDWFHLxKfvgNZcrxgDwnIUD0bWy61B7rmz2Re3s7ytJD14XzlL-_4TyE8DNXbCTlm1AOO8-AEr7pCTKYRAqM13pabc8OA7mSwauqBd6-pq8XUoAn3yBv_tbtfb_zdKPT3R5iOFwqA/s1142/IMG-20260510-WA0011.jpg",
      points: [
        "Forensic Science Student"
      ]
    }
  ];

  return (
    <div className="py-20 px-4 max-w-7xl mx-auto relative perspective-[2000px]">
      <div className="max-w-4xl mx-auto mb-24 text-left">
        <h1 className="text-4xl md:text-5xl font-heading font-black mb-12 uppercase tracking-tight text-center">
          About <span className="text-warning">Foren Clue</span>
        </h1>
        
        <div className="bg-surface p-8 border border-black/10 dark:border-white/10 mb-12 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-warning/5 rounded-full blur-[50px] -z-10"></div>
          <h2 className="text-2xl font-heading font-bold mb-4 text-warning uppercase tracking-widest">Our Vision</h2>
          <p className="text-lg text-text-muted leading-relaxed relative z-10">
            At Foren Clue, we envision a future where top-tier forensic education is democratized and accessible to every passionate student. We aim to bridge the gap between theoretical knowledge and real-world application, cultivating a new generation of investigators equipped to solve the challenges of modern crime and digital forensics globally.
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
