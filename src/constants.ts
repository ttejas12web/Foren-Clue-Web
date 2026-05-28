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
  category: string;
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
    category: "General Forensics",
    duration: "4 Weeks",
    description: "Learn the fundamentals of forensic science, including evidence handling, crime scene analysis, and lab techniques.",
    instructorImage: "https://blogger.googleusercontent.com/img/b/R29vZ2xl/AVvXsEjt-N4hwGU4tzUkx9XwNKGHv2Te4J3tbfxJWFRXS6Z3KzdZX1f9VKZB88MYTeF4OqePRwDcGMbqjmOpoROSJlsSHaZJnLEIMnP2S98gBLOlP6IDs33SBqLf7yhLEyWCICI90IfGk5XV06fUYonMDC5zufGitO8-sTe1sIExdZcckiMh0VuZmmmPJpxhGQs/s1352/IMG_0866.PNG",
    curriculum: [
      "History and Scope of Forensic Science",
      "Crime Scene Documentation and Photography",
      "Types of Evidence (Physical, Biological, Trace)",
      "Chain of Custody Procedures",
      "Introduction to Forensic Laboratory Analysis"
    ],
    instructorBio: "Mrunmayee Bodhe is the CEO Of ForenClue Ventures, a passionate forensic enthusiast, and dedicated to making learning stress-free.",
    thumbnail: "https://blogger.googleusercontent.com/img/b/R29vZ2xl/AVvXsEgmKqsV247zENKr8rUZCgF2dR_u91jYMEP6mJaWF010Jgsdi-zMXXcbXRbWUfD-JZ2vfri_NLWtBPVFTNI8CphwPqMb8eofX8sT75dRzOhR_z4KecBMMSMPrynFsztPmNbZBppXGQn3lAAJERzwyeMdc9gAyxFV9sgHtptG4yOMtNQznPolTH3tORuRPBI/s1534/B45FFD8B-3B72-4FAB-B779-F5DFE99BC86F.jpeg",
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
    category: "Cyber Forensics",
    duration: "6 Weeks",
    description: "Master the art of recovering and investigating material found in digital devices.",
    instructorImage: "https://blogger.googleusercontent.com/img/b/R29vZ2xl/AVvXsEhBbTT3QCs_EHXasFjAT9pC1laU-vAIRhIQ7qjpQHS3ErsprqykE9eT63H-XnATqutTGhCjq-zzbmvCeFhHfE0_DZ1wtZmu8pmARltV1makLhdqyCwftxjW55J0qyPbmjn6H6Abb6OzIHPUrkbkYOwmDeVxLmGyH_0nbr9qOnWtWKEg3NaPIvEJKTNg8vU/s1323/IMG_0865.PNG",
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
    category: "Biological Science",
    duration: "5 Weeks",
    description: "Deep dive into biological evidence and DNA profiling technologies.",
    instructorImage: "https://blogger.googleusercontent.com/img/b/R29vZ2xl/AVvXsEhBbTT3QCs_EHXasFjAT9pC1laU-vAIRhIQ7qjpQHS3ErsprqykE9eT63H-XnATqutTGhCjq-zzbmvCeFhHfE0_DZ1wtZmu8pmARltV1makLhdqyCwftxjW55J0qyPbmjn6H6Abb6OzIHPUrkbkYOwmDeVxLmGyH_0nbr9qOnWtWKEg3NaPIvEJKTNg8vU/s1323/IMG_0865.PNG",
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
    category: "Documentation",
    duration: "3 Weeks",
    description: "Essential techniques for documenting crime scenes accurately through photography.",
    instructorImage: "https://blogger.googleusercontent.com/img/b/R29vZ2xl/AVvXsEhBbTT3QCs_EHXasFjAT9pC1laU-vAIRhIQ7qjpQHS3ErsprqykE9eT63H-XnATqutTGhCjq-zzbmvCeFhHfE0_DZ1wtZmu8pmARltV1makLhdqyCwftxjW55J0qyPbmjn6H6Abb6OzIHPUrkbkYOwmDeVxLmGyH_0nbr9qOnWtWKEg3NaPIvEJKTNg8vU/s1323/IMG_0865.PNG",
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
    category: "Documentation",
    duration: "4 Weeks",
    description: "Learn to identify forgeries, handwriting analysis, and paper/ink comparisons.",
    instructorImage: "https://blogger.googleusercontent.com/img/b/R29vZ2xl/AVvXsEhBbTT3QCs_EHXasFjAT9pC1laU-vAIRhIQ7qjpQHS3ErsprqykE9eT63H-XnATqutTGhCjq-zzbmvCeFhHfE0_DZ1wtZmu8pmARltV1makLhdqyCwftxjW55J0qyPbmjn6H6Abb6OzIHPUrkbkYOwmDeVxLmGyH_0nbr9qOnWtWKEg3NaPIvEJKTNg8vU/s1323/IMG_0865.PNG",
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
    category: "Anthropology",
    duration: "8 Weeks",
    description: "Specialized study of human skeletal remains to determine identity and cause of death.",
    instructorImage: "https://blogger.googleusercontent.com/img/b/R29vZ2xl/AVvXsEhBbTT3QCs_EHXasFjAT9pC1laU-vAIRhIQ7qjpQHS3ErsprqykE9eT63H-XnATqutTGhCjq-zzbmvCeFhHfE0_DZ1wtZmu8pmARltV1makLhdqyCwftxjW55J0qyPbmjn6H6Abb6OzIHPUrkbkYOwmDeVxLmGyH_0nbr9qOnWtWKEg3NaPIvEJKTNg8vU/s1323/IMG_0865.PNG",
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
