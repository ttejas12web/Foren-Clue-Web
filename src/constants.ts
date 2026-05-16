export interface Lesson {
  id: string;
  title: string;
  duration: string;
  videoUrl: string;
}

export interface Module {
  id: string;
  title: string;
  lessons: Lesson[];
}

export interface Course {
  id: number;
  title: string;
  instructor: string;
  price: number;
  originalPrice: number;
  level: string;
  duration: string;
  description: string;
  instructorImage: string;
  curriculum: string[];
  instructorBio: string;
  thumbnail: string;
  notices: { id: number; date: string; content: string }[];
  modules: Module[];
}

export const COURSES: Course[] = [
  {
    id: 1,
    title: "Introduction to Forensic Science",
    instructor: "Mrunmayee Bodhe",
    price: 0,
    originalPrice: 1999,
    level: "Beginner",
    duration: "4 Weeks",
    description: "Learn the fundamentals of forensic science, including evidence handling, crime scene analysis, and lab techniques.",
    instructorImage: "https://blogger.googleusercontent.com/img/b/R29vZ2xl/AVvXsEitDO6DU6jqsjEi9qlT_F8Nnt-CURNLMWysqiQZaaBtuvQs8gTv34MFU4_EEhEAJp-_VMSheOmEWghWS0SEm21MUbS0l37WaoaLvZiqXt968mvmZ_1QHgvpbuuwHxMldrvKRfYbgtM4N-6jX88qJjnziD_OcMiPKs4jw75gcjsWy0jwaM7ARH0t-1Y4tyE/s1280/photo_6323596718204718711_y.jpg",
    curriculum: [
      "History and Scope of Forensic Science",
      "Crime Scene Documentation and Photography",
      "Types of Evidence (Physical, Biological, Trace)",
      "Chain of Custody Procedures",
      "Introduction to Forensic Laboratory Analysis"
    ],
    instructorBio: "Mrunmayee Bodhe is the CEO Of Foren Clue Ventures, a passionate forensic enthusiast, and dedicated to making learning stress-free.",
    thumbnail: "https://images.unsplash.com/photo-1576086213369-97a306d36557?q=80&w=800&auto=format&fit=crop",
    notices: [
      { id: 1, date: "2024-03-20", content: "New module on 'Forensic Entomology' added. Check it out in the curriculum!" },
      { id: 2, date: "2024-03-15", content: "Live Q&A session scheduled for next Friday at 6 PM IST." }
    ],
    modules: [
      {
        id: "m1",
        title: "Week-1 Introduction to Forensics",
        lessons: [
          { id: "l1", title: "Forensic Science Introduction", duration: "15:00", videoUrl: "https://www.youtube.com/embed/m6_v3Z95YpM" },
          { id: "l2", title: "History and Evolution", duration: "12:30", videoUrl: "https://www.youtube.com/embed/8-WNoI5Iu70" },
          { id: "l3", title: "Scope of Investigation", duration: "10:45", videoUrl: "https://www.youtube.com/embed/m6_v3Z95YpM" }
        ]
      },
      {
        id: "m2",
        title: "Week-2 Evidence Collection",
        lessons: [
          { id: "l4", title: "Types of Evidence", duration: "20:00", videoUrl: "https://www.youtube.com/embed/8-WNoI5Iu70" },
          { id: "l5", title: "Chain of Custody", duration: "18:20", videoUrl: "https://www.youtube.com/embed/m6_v3Z95YpM" }
        ]
      }
    ]
  },
  {
    id: 2,
    title: "Digital Forensics & Incident Response",
    instructor: "Tejas Tapse",
    price: 100,
    originalPrice: 1999,
    level: "Beginner",
    duration: "6 Weeks",
    description: "Master the art of recovering and investigating material found in digital devices.",
    instructorImage: "https://blogger.googleusercontent.com/img/b/R29vZ2xl/AVvXsEjbA2bNXKfIxI7Qu74ewsnfg3DfivOnnt75Pzyd84TNf8UtCUVw0P9t-c-L9IGanpGt0Y_6B9p-3Bh8g3tAt1vSLMoZ9XMkTznEYGeEaQ-JCI3RgAmwKcEbvMQYxUYWc-Pa9htjJFIwHuaF87Zk1NejgEvwzoOF8GhPb-k7KI9tK2t1NP2IXhXWDLTv7qs/s1536/3E3F94BB-E3E0-4642-8D7D-95C9101B469F.jpg",
    curriculum: [
      "Digital Evidence Collection and Preservation",
      "File System Analysis (NTFS, FAT, EXT)",
      "Network Traffic Analysis and Spoofing detection",
      "Malware Analysis Fundamentals",
      "Incident Response Frameworks"
    ],
    instructorBio: "Tejas Tapse specializes in cyber security and digital forensic investigations, helping organizations respond to complex breaches.",
    thumbnail: "https://images.unsplash.com/photo-1550751827-4bd374c3f58b?q=80&w=800&auto=format&fit=crop",
    notices: [
      { id: 1, date: "2024-03-18", content: "Updated lab environments are now live. Please re-download the VM image." },
      { id: 2, date: "2024-03-10", content: "Special webinar on 'Ransomware Investigation' next Monday." }
    ],
    modules: [
      {
        id: "m1",
        title: "Module 1: Digital Footprints",
        lessons: [
          { id: "l1", title: "Intro to Digital Forensics", duration: "25:00", videoUrl: "https://www.youtube.com/embed/6eM3O6UIdh0" },
          { id: "l2", title: "Imaging and Preservation", duration: "30:00", videoUrl: "https://www.youtube.com/embed/6eM3O6UIdh0" }
        ]
      }
    ]
  },
  {
    id: 3,
    title: "Forensic Serology & DNA Analysis",
    instructor: "Tejas Tapse",
    price: 100,
    originalPrice: 2499,
    level: "Intermediate",
    duration: "5 Weeks",
    description: "Deep dive into biological evidence and DNA profiling technologies.",
    instructorImage: "https://blogger.googleusercontent.com/img/b/R29vZ2xl/AVvXsEjbA2bNXKfIxI7Qu74ewsnfg3DfivOnnt75Pzyd84TNf8UtCUVw0P9t-c-L9IGanpGt0Y_6B9p-3Bh8g3tAt1vSLMoZ9XMkTznEYGeEaQ-JCI3RgAmwKcEbvMQYxUYWc-Pa9htjJFIwHuaF87Zk1NejgEvwzoOF8GhPb-k7KI9tK2t1NP2IXhXWDLTv7qs/s1536/3E3F94BB-E3E0-4642-8D7D-95C9101B469F.jpg",
    curriculum: [
      "Identification of Biological Fluids (Blood, Semen, Saliva)",
      "Bloodstain Pattern Analysis (BPA)",
      "DNA Extraction and Quantification",
      "PCR and STR Profiling",
      "Interpreting DNA Evidence in Legal Contexts"
    ],
    instructorBio: "With a background in molecular biology, Tejas Tapse provides expert insights into the science of biological evidence.",
    thumbnail: "https://images.unsplash.com/photo-1530210124550-912dc1381cb8?q=80&w=800&auto=format&fit=crop",
    notices: [
      { id: 1, date: "2024-03-22", content: "New research paper on 'Rapid DNA Profiling' added to the reading material." }
    ],
    modules: [
      {
        id: "m1",
        title: "Module 1: Biological Evidence",
        lessons: [
          { id: "l1", title: "Serology Basics", duration: "22:00", videoUrl: "https://www.youtube.com/embed/m6_v3Z95YpM" }
        ]
      }
    ]
  },
  {
    id: 4,
    title: "Crime Scene Photography",
    instructor: "Tejas Tapse",
    price: 100,
    originalPrice: 1499,
    level: "Beginner",
    duration: "3 Weeks",
    description: "Essential techniques for documenting crime scenes accurately through photography.",
    instructorImage: "https://blogger.googleusercontent.com/img/b/R29vZ2xl/AVvXsEjbA2bNXKfIxI7Qu74ewsnfg3DfivOnnt75Pzyd84TNf8UtCUVw0P9t-c-L9IGanpGt0Y_6B9p-3Bh8g3tAt1vSLMoZ9XMkTznEYGeEaQ-JCI3RgAmwKcEbvMQYxUYWc-Pa9htjJFIwHuaF87Zk1NejgEvwzoOF8GhPb-k7KI9tK2t1NP2IXhXWDLTv7qs/s1536/3E3F94BB-E3E0-4642-8D7D-95C9101B469F.jpg",
    curriculum: [
      "Camera Settings and Exposure for Investigations",
      "Macro Photography for Trace Evidence",
      "Lighting Techniques (Direct, Oblique, Cross)",
      "Panoramic and Overall Scene Documentation",
      "Legal Admissibility of Photographic Evidence"
    ],
    instructorBio: "Tejas Tapse combines investigative experience with technical photography skills to teach precise scene documentation.",
    thumbnail: "https://images.unsplash.com/photo-1516035069371-29a1b244cc32?q=80&w=800&auto=format&fit=crop",
    notices: [
      { id: 1, date: "2024-03-15", content: "Submit your 'Lighting Practice' assignment by this Sunday." }
    ],
    modules: [
      {
        id: "m1",
        title: "Module 1: Documentation",
        lessons: [
          { id: "l1", title: "Photography Basics", duration: "19:00", videoUrl: "https://www.youtube.com/embed/m6_v3Z95YpM" }
        ]
      }
    ]
  },
  {
    id: 5,
    title: "Questioned Document Examination",
    instructor: "Tejas Tapse",
    price: 100,
    originalPrice: 2999,
    level: "Intermediate",
    duration: "4 Weeks",
    description: "Learn to identify forgeries, handwriting analysis, and paper/ink comparisons.",
    instructorImage: "https://blogger.googleusercontent.com/img/b/R29vZ2xl/AVvXsEjbA2bNXKfIxI7Qu74ewsnfg3DfivOnnt75Pzyd84TNf8UtCUVw0P9t-c-L9IGanpGt0Y_6B9p-3Bh8g3tAt1vSLMoZ9XMkTznEYGeEaQ-JCI3RgAmwKcEbvMQYxUYWc-Pa9htjJFIwHuaF87Zk1NejgEvwzoOF8GhPb-k7KI9tK2t1NP2IXhXWDLTv7qs/s1536/3E3F94BB-E3E0-4642-8D7D-95C9101B469F.jpg",
    curriculum: [
      "Handwriting Comparison and Identification",
      "Analysis of Altered and Obligations Documents",
      "Ink and Paper Analysis (Thin-Layer Chromatography)",
      "Typewriter and Printer Identification",
      "Counterfeit Detection Techniques"
    ],
    instructorBio: "Tejas Tapse is an expert in document authentication, helping prove the validity of critical evidence in court.",
    thumbnail: "/src/assets/images/regenerated_image_1777824343256.png",
    notices: [
      { id: 1, date: "2024-03-21", content: "New high-resolution forgery samples uploaded to the asset gallery." }
    ],
    modules: [
      {
        id: "m1",
        title: "Module 1: Paper & Ink",
        lessons: [
          { id: "l1", title: "Document Authentication", duration: "28:00", videoUrl: "https://www.youtube.com/embed/m6_v3Z95YpM" }
        ]
      }
    ]
  },
  {
    id: 6,
    title: "Advanced Forensic Anthropology",
    instructor: "Tejas Tapse",
    price: 100,
    originalPrice: 3499,
    level: "Advanced",
    duration: "8 Weeks",
    description: "Specialized study of human skeletal remains to determine identity and cause of death.",
    instructorImage: "https://blogger.googleusercontent.com/img/b/R29vZ2xl/AVvXsEjbA2bNXKfIxI7Qu74ewsnfg3DfivOnnt75Pzyd84TNf8UtCUVw0P9t-c-L9IGanpGt0Y_6B9p-3Bh8g3tAt1vSLMoZ9XMkTznEYGeEaQ-JCI3RgAmwKcEbvMQYxUYWc-Pa9htjJFIwHuaF87Zk1NejgEvwzoOF8GhPb-k7KI9tK2t1NP2IXhXWDLTv7qs/s1536/3E3F94BB-E3E0-4642-8D7D-95C9101B469F.jpg",
    curriculum: [
      "Human vs. Animal Osteology",
      "Determination of Age, Sex, and Ancestry from Bone",
      "Trauma Analysis (Blunt Force, Sharp Force, Ballistic)",
      "Taphonomic Changes and Estimation of PMI",
      "Reconstruction of Identity through Craniofacial Features"
    ],
    instructorBio: "Tejas Tapse brings deep anatomical knowledge to identifying human remains and reconstructing life histories from bone.",
    thumbnail: "https://images.unsplash.com/photo-1559757175-5700dde675bc?q=80&w=800&auto=format&fit=crop",
    notices: [
      { id: 1, date: "2024-03-19", content: "Advanced skeletal reconstruction tool link sent to all enrolled students." }
    ],
    modules: [
      {
        id: "m1",
        title: "Module 1: Osteology",
        lessons: [
          { id: "l1", title: "Bone Identification", duration: "35:00", videoUrl: "https://www.youtube.com/embed/m6_v3Z95YpM" }
        ]
      }
    ]
  }
];
