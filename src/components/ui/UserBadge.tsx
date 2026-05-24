import React from 'react';
import { motion } from 'motion/react';
import { Badge, getBadgeByContributions } from '../../lib/badge-utils';
import { 
  Award, 
  ShieldCheck, 
  Zap, 
  Trophy, 
  Star, 
  Crown,
  Search,
  MessageSquare as MsgIcon
} from 'lucide-react';

interface UserBadgeProps {
  doubtsCount?: number;
  commentsCount?: number;
  size?: 'xs' | 'sm' | 'md' | 'lg';
  showLabel?: boolean;
  className?: string;
  badgeOverride?: string; // Fallback for when we only have the tag string
}

export function UserBadge({ 
  doubtsCount = 0, 
  commentsCount = 0, 
  size = 'sm', 
  showLabel = true,
  className = '',
  badgeOverride
}: UserBadgeProps) {
  const badge = getBadgeByContributions(doubtsCount, commentsCount);
  
  // Size mapping
  const sizeClasses = {
    xs: { icon: 10, text: 'text-[8px]', padding: 'px-1.5 py-0.5', gap: 'gap-1' },
    sm: { icon: 12, text: 'text-[10px]', padding: 'px-2.5 py-1', gap: 'gap-1.5' },
    md: { icon: 16, text: 'text-xs', padding: 'px-3 py-1.5', gap: 'gap-2' },
    lg: { icon: 20, text: 'text-sm', padding: 'px-4 py-2', gap: 'gap-2.5' }
  };

  const config = sizeClasses[size];
  const Icon = badge.icon;

  return (
    <motion.div 
      initial={{ scale: 0.9, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      className={`inline-flex items-center ${config.gap} ${config.padding} rounded-full border border-black/10 dark:border-white/10 bg-black/5 dark:bg-white/5 backdrop-blur-sm shadow-sm ${className}`}
      style={{ color: badge.color, borderColor: `${badge.color}33`, backgroundColor: `${badge.color}08` }}
    >
      <Icon size={config.icon} strokeWidth={3} />
      {showLabel && (
        <span className={`${config.text} font-black uppercase tracking-widest`}>
          {badge.name}
        </span>
      )}
    </motion.div>
  );
}

// Minimal version for overlapping with avatars
export function UserBadgeCompact({ 
  doubtsCount = 0, 
  commentsCount = 0,
  className = ''
}: { doubtsCount?: number, commentsCount?: number, className?: string }) {
  const badge = getBadgeByContributions(doubtsCount, commentsCount);
  const Icon = badge.icon;

  return (
    <div 
      className={`bg-surface p-0.5 rounded-full border shadow-lg ${className}`}
      style={{ color: badge.color, borderColor: badge.color }}
      title={badge.name}
    >
      <Icon size={10} strokeWidth={3} />
    </div>
  );
}
