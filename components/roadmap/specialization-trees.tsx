'use client';

import { useEffect, useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { GitBranch, Monitor, Server, TerminalSquare } from 'lucide-react';
import { CATEGORY_COLORS, ProgressMap, TopicData } from '@/lib/types';
import { AreaGraph } from './area-graph';

interface SpecializationTreesProps {
  topics: TopicData[];
  progress: ProgressMap;
  onTopicClick: (topic: TopicData) => void;
}

const CATEGORY_ICONS: Record<string, any> = {
  Backend: Server,
  Frontend: Monitor,
  Ops: TerminalSquare,
};

export function SpecializationTrees({ topics, progress, onTopicClick }: SpecializationTreesProps) {
  const groups = useMemo(() => {
    const next = new Map<string, TopicData[]>();

    for (const topic of topics ?? []) {
      const category = topic?.category ?? 'Especialização';
      next.set(category, [...(next.get(category) ?? []), topic]);
    }

    return [...next.entries()];
  }, [topics]);

  const [activeCategory, setActiveCategory] = useState(groups[0]?.[0] ?? '');

  useEffect(() => {
    if (groups.length === 0) return;
    if (!groups.some(([category]) => category === activeCategory)) {
      setActiveCategory(groups[0]?.[0] ?? '');
    }
  }, [activeCategory, groups]);

  const activeGroup = groups.find(([category]) => category === activeCategory) ?? groups[0];

  if (!activeGroup) return null;

  const [category, categoryTopics] = activeGroup;
  const activeColor = CATEGORY_COLORS[category] ?? '#06b6d4';
  const activeCompleted = categoryTopics.filter((topic) => progress?.[topic?.slug ?? '']).length;

  return (
    <div className="space-y-3">
      <div className="flex gap-2 overflow-x-auto rounded-xl border border-border bg-card p-2">
        {groups.map(([groupCategory, groupTopics]) => {
          const isActive = groupCategory === activeCategory;
          const color = CATEGORY_COLORS[groupCategory] ?? '#06b6d4';
          const Icon = CATEGORY_ICONS[groupCategory] ?? GitBranch;
          const completed = groupTopics.filter((topic) => progress?.[topic?.slug ?? '']).length;

          return (
            <motion.button
              key={groupCategory}
              type="button"
              layout
              onClick={() => setActiveCategory(groupCategory)}
              whileTap={{ scale: 0.98 }}
              className={`flex min-w-[210px] items-center gap-2 rounded-lg border px-3 py-2 text-left transition-colors ${
                isActive ? 'bg-background' : 'border-transparent bg-transparent hover:bg-muted/45'
              }`}
              style={{
                borderColor: isActive ? `${color}80` : 'transparent',
                boxShadow: isActive ? `0 8px 26px ${color}18` : 'none',
              }}
            >
              <span
                className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md"
                style={{ backgroundColor: `${color}18`, color }}
              >
                <Icon className="h-4 w-4" />
              </span>
              <span className="min-w-0 flex-1">
                <span className="block truncate text-xs font-semibold">{groupCategory}</span>
                <span className="mt-0.5 block font-mono text-[10px] text-muted-foreground">
                  {completed}/{groupTopics.length}
                </span>
              </span>
            </motion.button>
          );
        })}
      </div>

      <motion.div
        key={category}
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.18 }}
        className="overflow-hidden rounded-xl border bg-card"
        style={{
          borderColor: `${activeColor}55`,
          boxShadow: `0 18px 50px ${activeColor}12`,
        }}
      >
        <div className="flex items-center justify-between border-b border-border px-4 py-3">
          <div>
            <h3 className="font-display text-sm font-bold">{category}</h3>
            <p className="mt-0.5 text-xs text-muted-foreground">
              {activeCompleted}/{categoryTopics.length} concluídos
            </p>
          </div>
          <div className="h-2 w-24 overflow-hidden rounded-full bg-muted">
            <div
              className="h-full rounded-full"
              style={{
                width: `${categoryTopics.length > 0 ? (activeCompleted / categoryTopics.length) * 100 : 0}%`,
                backgroundColor: activeColor,
              }}
            />
          </div>
        </div>
        <AreaGraph
          topics={categoryTopics}
          progress={progress}
          onTopicClick={onTopicClick}
          areaId={300 + groups.findIndex(([groupCategory]) => groupCategory === category)}
        />
      </motion.div>
    </div>
  );
}
