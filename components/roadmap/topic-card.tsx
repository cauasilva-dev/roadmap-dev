'use client';

import { CheckCircle2, Circle, ChevronRight } from 'lucide-react';
import { motion } from 'framer-motion';
import { TopicData, CATEGORY_COLORS } from '@/lib/types';

interface TopicCardProps {
  topic: TopicData;
  isCompleted: boolean;
  onClick: () => void;
}

export function TopicCard({ topic, isCompleted, onClick }: TopicCardProps) {
  const catColor = CATEGORY_COLORS[topic?.category ?? ''] ?? '#06b6d4';

  return (
    <motion.div
      data-topic-trigger="true"
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -2 }}
      onClick={onClick}
      className={`p-4 rounded-lg cursor-pointer transition-all border ${
        isCompleted
          ? 'border-green-500/30 bg-green-500/5'
          : 'border-border bg-card hover:border-primary/30'
      }`}
      style={{ boxShadow: 'var(--shadow-sm)' }}
    >
      <div className="flex items-start justify-between gap-2">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            {isCompleted ? (
              <CheckCircle2 className="w-4 h-4 text-green-500 shrink-0" />
            ) : (
              <Circle className="w-4 h-4 text-muted-foreground shrink-0" />
            )}
            <span
              className="text-[10px] font-medium px-1.5 py-0.5 rounded"
              style={{ backgroundColor: `${catColor}15`, color: catColor }}
            >
              {topic?.category ?? ''}
            </span>
          </div>
          <h4 className="text-sm font-semibold truncate">{topic?.title ?? ''}</h4>
          <p className="text-xs text-muted-foreground mt-1 line-clamp-2">{topic?.description ?? ''}</p>
          <div className="flex items-center gap-1 mt-2 text-xs text-muted-foreground">
            <span>{topic?.resources?.length ?? 0} recursos</span>
          </div>
        </div>
        <ChevronRight className="w-4 h-4 text-muted-foreground shrink-0 mt-1" />
      </div>
    </motion.div>
  );
}
