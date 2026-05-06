'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { ChevronDown, ChevronUp, Layers, BookOpen, GitBranch, Cpu } from 'lucide-react';
import { AreaData, TopicData, ProgressMap } from '@/lib/types';
import { AreaGraph } from './area-graph';
import { TopicCard } from './topic-card';
import { SpecializationTrees } from './specialization-trees';

const AREA_ICONS: Record<number, any> = {
  1: BookOpen,
  2: Cpu,
  3: GitBranch,
};

const AREA_COLORS: Record<number, string> = {
  1: '#06b6d4',
  2: '#8b5cf6',
  3: '#f59e0b',
};

interface AreaSectionProps {
  area: AreaData;
  progress: ProgressMap;
  onTopicClick: (topic: TopicData) => void;
  searchQuery: string;
}

export function AreaSection({ area, progress, onTopicClick, searchQuery }: AreaSectionProps) {
  const [expanded, setExpanded] = useState(true);
  const [viewMode, setViewMode] = useState<'graph' | 'list'>('graph');

  const safeTopics = area?.topics ?? [];
  const filteredTopics = searchQuery
    ? safeTopics.filter((t: TopicData) =>
        (t?.title ?? '').toLowerCase().includes(searchQuery.toLowerCase()) ||
        (t?.category ?? '').toLowerCase().includes(searchQuery.toLowerCase()) ||
        (t?.description ?? '').toLowerCase().includes(searchQuery.toLowerCase())
      )
    : safeTopics;

  const completedInArea = safeTopics.filter((t: TopicData) => progress?.[t?.slug ?? ''] === true).length;
  const areaColor = AREA_COLORS[area?.id ?? 1] ?? '#06b6d4';
  const Icon = AREA_ICONS[area?.id ?? 1] ?? Layers;

  // Agrupar tópicos por categoria na Área 3
  const categories = area?.id === 3
    ? [...new Set(filteredTopics.map((t: TopicData) => t?.category ?? ''))]
    : [];

  if (searchQuery && filteredTopics.length === 0) return null;

  return (
    <motion.section
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="mb-8"
    >
      {/* Cabeçalho da seção */}
      <div
        className="flex items-center justify-between p-4 rounded-xl bg-card cursor-pointer hover:bg-accent/30 transition-colors"
        style={{ boxShadow: 'var(--shadow-md)' }}
        onClick={() => setExpanded(!expanded)}
      >
        <div className="flex items-center gap-3">
          <div
            className="w-10 h-10 rounded-lg flex items-center justify-center"
            style={{ backgroundColor: `${areaColor}15` }}
          >
            <Icon className="w-5 h-5" style={{ color: areaColor }} />
          </div>
          <div>
            <h2 className="font-display text-lg font-bold tracking-tight">
              Área {area?.id ?? ''}: {area?.title ?? ''}
            </h2>
            <p className="text-xs text-muted-foreground mt-0.5">
              {completedInArea}/{safeTopics.length} concluídos • {area?.description ?? ''}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {/* Anel de progresso */}
          <div className="relative w-10 h-10">
            <svg className="w-10 h-10 -rotate-90" viewBox="0 0 36 36">
              <circle cx="18" cy="18" r="14" fill="none" stroke="hsl(var(--border))" strokeWidth="3" />
              <circle
                cx="18" cy="18" r="14" fill="none"
                stroke={areaColor}
                strokeWidth="3"
                strokeDasharray={`${safeTopics.length > 0 ? (completedInArea / safeTopics.length) * 88 : 0} 88`}
                strokeLinecap="round"
              />
            </svg>
            <span className="absolute inset-0 flex items-center justify-center text-[10px] font-bold font-mono">
              {safeTopics.length > 0 ? Math.round((completedInArea / safeTopics.length) * 100) : 0}%
            </span>
          </div>
          {expanded ? <ChevronUp className="w-5 h-5 text-muted-foreground" /> : <ChevronDown className="w-5 h-5 text-muted-foreground" />}
        </div>
      </div>

      {/* Conteúdo */}
      {expanded && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          className="mt-4 space-y-4"
        >
          {/* Alternador de visualização */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => setViewMode('graph')}
              className={`px-3 py-1.5 text-xs rounded-lg transition-colors ${viewMode === 'graph' ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground hover:bg-muted/80'}`}
            >
              Visão em Grafo
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`px-3 py-1.5 text-xs rounded-lg transition-colors ${viewMode === 'list' ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground hover:bg-muted/80'}`}
            >
              Visão em Lista
            </button>
          </div>

          {viewMode === 'graph' ? (
            area?.id === 3 ? (
              <SpecializationTrees
                topics={filteredTopics}
                progress={progress}
                onTopicClick={onTopicClick}
              />
            ) : (
              <div className="rounded-xl bg-card border border-border overflow-hidden" style={{ boxShadow: 'var(--shadow-sm)' }}>
                <AreaGraph
                  topics={filteredTopics}
                  progress={progress}
                  onTopicClick={onTopicClick}
                  areaId={area?.id ?? 1}
                />
              </div>
            )
          ) : (
            <div>
              {area?.id === 3 ? (
                categories.map((cat: string) => (
                  <div key={cat} className="mb-6">
                    <h3 className="font-display font-semibold text-sm mb-3 text-muted-foreground uppercase tracking-wider">{cat}</h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                      {filteredTopics
                        .filter((t: TopicData) => (t?.category ?? '') === cat)
                        .map((t: TopicData) => (
                          <TopicCard
                            key={t?.id ?? ''}
                            topic={t}
                            isCompleted={progress?.[t?.slug ?? ''] ?? false}
                            onClick={() => onTopicClick(t)}
                          />
                        ))}
                    </div>
                  </div>
                ))
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                  {filteredTopics.map((t: TopicData) => (
                    <TopicCard
                      key={t?.id ?? ''}
                      topic={t}
                      isCompleted={progress?.[t?.slug ?? ''] ?? false}
                      onClick={() => onTopicClick(t)}
                    />
                  ))}
                </div>
              )}
            </div>
          )}
        </motion.div>
      )}
    </motion.section>
  );
}
