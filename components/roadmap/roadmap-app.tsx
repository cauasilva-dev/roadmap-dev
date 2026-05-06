'use client';

import { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { Rocket, GraduationCap, Target } from 'lucide-react';
import { Header } from './header';
import { AreaSection } from './area-section';
import { TopicModal } from './topic-modal';
import { AreaData, TopicData, ProgressMap } from '@/lib/types';
import { loadBrowserProgress, saveBrowserProgress } from '@/lib/browser-progress';
import roadmapAreas from '@/data/roadmap.json';

export function RoadmapApp() {
  const [areas] = useState<AreaData[]>(roadmapAreas as AreaData[]);
  const [progress, setProgress] = useState<ProgressMap>({});
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTopic, setSelectedTopic] = useState<TopicData | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const isSidebarOpen = Boolean(isModalOpen && selectedTopic);

  useEffect(() => {
    setProgress(loadBrowserProgress());
  }, []);

  const totalTopics = (areas ?? []).reduce((sum: number, a: AreaData) => sum + (a?.topics?.length ?? 0), 0);
  const completedCount = Object.values(progress ?? {}).filter(Boolean).length;

  const handleTopicClick = useCallback((topic: TopicData) => {
    setSelectedTopic(topic);
    setIsModalOpen(true);
  }, []);

  const handleToggleComplete = useCallback(async (slug: string, completed: boolean) => {
    setProgress((prev: ProgressMap) => {
      const nextProgress = { ...(prev ?? {}), [slug]: completed };
      saveBrowserProgress(nextProgress);
      return nextProgress;
    });

  }, []);

  return (
    <div className="min-h-screen bg-background">
      <Header
        onSearch={setSearchQuery}
        searchQuery={searchQuery}
        completedCount={completedCount}
        totalCount={totalTopics}
        areas={areas}
        progress={progress}
      />

      {/* Hero */}
      <section className="hero-gradient py-12 md:py-16">
        <div className="max-w-[1200px] mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="text-center max-w-2xl mx-auto"
          >
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-medium mb-4">
              <Rocket className="w-3.5 h-3.5" />
              Trilha de Aprendizado Interativa
            </div>
            <h1 className="font-display text-3xl md:text-4xl font-bold tracking-tight mb-3">
              Engenharia de Software <span className="text-primary">Roadmap</span>
            </h1>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Um caminho completo dos fundamentos à especialização.
              Acompanhe seu progresso com grafos de dependência e recursos selecionados.
            </p>

            {/* Estatísticas */}
            <div className="flex items-center justify-center gap-6 mt-6">
              <div className="flex items-center gap-2">
                <GraduationCap className="w-4 h-4 text-primary" />
                <span className="text-sm font-medium">{totalTopics} Tópicos</span>
              </div>
              <div className="flex items-center gap-2">
                <Target className="w-4 h-4 text-green-500" />
                <span className="text-sm font-medium">{completedCount} Concluídos</span>
              </div>
              <div className="text-sm font-mono text-muted-foreground">
                {totalTopics > 0 ? Math.round((completedCount / totalTopics) * 100) : 0}% completo
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Áreas */}
      <main
        className={`px-4 py-8 transition-all duration-300 ${
          isSidebarOpen
            ? 'mx-0 max-w-none xl:mr-[472px] xl:ml-6'
            : 'mx-auto max-w-[1200px]'
        }`}
      >
        {(areas ?? []).map((area: AreaData) => (
          <AreaSection
            key={area?.id ?? ''}
            area={area}
            progress={progress}
            onTopicClick={handleTopicClick}
            searchQuery={searchQuery}
          />
        ))}

        {searchQuery && (areas ?? []).every((a: AreaData) => {
          const safeTopics = a?.topics ?? [];
          return safeTopics.filter((t: TopicData) =>
            (t?.title ?? '').toLowerCase().includes(searchQuery.toLowerCase()) ||
            (t?.category ?? '').toLowerCase().includes(searchQuery.toLowerCase()) ||
            (t?.description ?? '').toLowerCase().includes(searchQuery.toLowerCase())
          ).length === 0;
        }) && (
          <div className="text-center py-12">
            <p className="text-muted-foreground">Nenhum tópico encontrado para &quot;{searchQuery}&quot;</p>
          </div>
        )}
      </main>

      {/* Rodapé */}
      <footer className="border-t border-border py-6">
        <div className="max-w-[1200px] mx-auto px-4 text-center">
          <p className="text-xs text-muted-foreground">
            Roadmap de Engenharia de Software • Acompanhe sua jornada de aprendizado
          </p>
        </div>
      </footer>

      {/* Modal de Tópico */}
      <TopicModal
        topic={selectedTopic}
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        isCompleted={progress?.[selectedTopic?.slug ?? ''] ?? false}
        onToggleComplete={handleToggleComplete}
      />
    </div>
  );
}
