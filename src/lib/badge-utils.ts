import { 
  Award, 
  ShieldCheck, 
  Zap, 
  Trophy, 
  Star, 
  Crown,
  Search,
  MessageSquare,
  Activity
} from 'lucide-react';

export interface Badge {
  name: string;
  level: number;
  threshold: number;
  color: string;
  icon: any;
  description: string;
}

export const BADGES: Badge[] = [
  {
    name: 'Forensic Novice',
    level: 1,
    threshold: 0,
    color: '#9ca3af', // text-gray-400
    icon: Search,
    description: 'Just beginning the forensic journey.'
  },
  {
    name: 'Doubt Scout',
    level: 2,
    threshold: 5,
    color: '#fbbf24', // text-warning (amber-400)
    icon: MessageSquare,
    description: 'Actively searching for clues and answers.'
  },
  {
    name: 'Community Sentry',
    level: 3,
    threshold: 15,
    color: '#60a5fa', // text-blue-400
    icon: ShieldCheck,
    description: 'A vigilant member contributing to case files.'
  },
  {
    name: 'Doubt Hero',
    level: 4,
    threshold: 30,
    color: '#c084fc', // text-purple-400
    icon: Zap,
    description: 'Saving the day with expert inquiries.'
  },
  {
    name: 'Doubt Master',
    level: 5,
    threshold: 60,
    color: '#f472b6', // text-pink-400
    icon: Trophy,
    description: 'A master of forensic methodology.'
  },
  {
    name: 'Forensic Legend',
    level: 6,
    threshold: 100,
    color: '#4ade80', // text-green-400
    icon: Crown,
    description: 'A legendary figure in the forensic community.'
  }
];

export function getBadgeByContributions(doubtsCount: number, commentsCount: number): Badge {
  const total = doubtsCount + commentsCount;
  // Sort badges by threshold descending
  const sortedBadges = [...BADGES].sort((a, b) => b.threshold - a.threshold);
  
  for (const badge of sortedBadges) {
    if (total >= badge.threshold) {
      return badge;
    }
  }
  
  return BADGES[0];
}

export function getNextBadge(currentLevel: number): Badge | null {
  return BADGES.find(b => b.level === currentLevel + 1) || null;
}
