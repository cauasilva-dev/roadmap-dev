'use client';

import { Search, Download, Moon, Sun, Map, Menu, X } from 'lucide-react';
import { useTheme } from 'next-themes';
import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AreaData, ProgressMap, TopicData } from '@/lib/types';

interface HeaderProps {
  onSearch: (query: string) => void;
  searchQuery: string;
  completedCount: number;
  totalCount: number;
  areas: AreaData[];
  progress: ProgressMap;
}

export function Header({ onSearch, searchQuery, completedCount, totalCount, areas, progress }: HeaderProps) {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const pct = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;

  useEffect(() => { setMounted(true); }, []);

  const handleExport = async () => {
    try {
      const completedSlugs = new Set(
        Object.entries(progress ?? {})
          .filter(([, completed]) => completed)
          .map(([slug]) => slug)
      );
      const exportedAt = new Date().toISOString();
      const payload = {
        exportedAt,
        totalTopics: totalCount,
        completedTopics: completedCount,
        progressPercentage: pct,
        progress: progress ?? {},
        areas: (areas ?? []).map((area: AreaData) => ({
          id: area?.id,
          title: area?.title,
          topics: (area?.topics ?? []).map((topic: TopicData) => ({
            slug: topic?.slug,
            title: topic?.title,
            category: topic?.category,
            completed: completedSlugs.has(topic?.slug ?? ''),
          })),
        })),
      };
      const blob = new Blob([JSON.stringify(payload, null, 2)], {
        type: 'application/json',
      });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'se-roadmap-progresso.json';
      a.click();
      URL.revokeObjectURL(url);
    } catch (e: any) {
      console.error('Falha ao exportar:', e);
    }
  };

  return (
    <header className="sticky top-0 z-50 bg-background/80 backdrop-blur-xl border-b border-border">
      <div className="max-w-[1200px] mx-auto px-4 py-3 flex items-center justify-between gap-3">
        <div className="flex items-center gap-2 shrink-0">
          <Map className="w-5 h-5 text-primary" />
          <span className="font-display font-bold text-lg tracking-tight hidden sm:inline">SE Roadmap</span>
        </div>

        {/* Busca */}
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input
            type="text"
            placeholder="Buscar tópicos..."
            value={searchQuery}
            onChange={(e: any) => onSearch?.(e?.target?.value ?? '')}
            className="w-full pl-9 pr-4 py-2 text-sm bg-muted/50 rounded-lg border border-border focus:outline-none focus:ring-2 focus:ring-primary/30 transition-all"
          />
        </div>

        {/* Ações desktop */}
        <div className="hidden md:flex items-center gap-3">
          {/* Barra de progresso */}
          <div className="flex items-center gap-2">
            <div className="w-24 h-2 bg-muted rounded-full overflow-hidden">
              <motion.div
                className="h-full bg-primary rounded-full"
                initial={{ width: 0 }}
                animate={{ width: `${pct}%` }}
                transition={{ duration: 0.5 }}
              />
            </div>
            <span className="text-xs text-muted-foreground font-mono">{completedCount}/{totalCount}</span>
          </div>

          <button
            onClick={handleExport}
            className="flex items-center gap-1.5 px-3 py-1.5 text-sm bg-muted hover:bg-muted/80 rounded-lg transition-colors"
          >
            <Download className="w-3.5 h-3.5" />
            Exportar
          </button>

          {mounted && (
            <button
              onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
              className="p-2 rounded-lg bg-muted hover:bg-muted/80 transition-colors"
            >
              {theme === 'dark' ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
            </button>
          )}
        </div>

        {/* Menu mobile */}
        <button
          className="md:hidden p-2 rounded-lg bg-muted"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
        >
          {mobileMenuOpen ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
        </button>
      </div>

      {/* Menu mobile expandido */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="md:hidden border-t border-border overflow-hidden"
          >
            <div className="px-4 py-3 flex items-center gap-3 flex-wrap">
              <div className="flex items-center gap-2">
                <div className="w-24 h-2 bg-muted rounded-full overflow-hidden">
                  <div className="h-full bg-primary rounded-full" style={{ width: `${pct}%` }} />
                </div>
                <span className="text-xs text-muted-foreground font-mono">{completedCount}/{totalCount}</span>
              </div>
              <button onClick={handleExport} className="flex items-center gap-1.5 px-3 py-1.5 text-sm bg-muted rounded-lg">
                <Download className="w-3.5 h-3.5" /> Exportar
              </button>
              {mounted && (
                <button onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')} className="p-2 rounded-lg bg-muted">
                  {theme === 'dark' ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
                </button>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
