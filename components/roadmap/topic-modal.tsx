'use client';

import { useEffect, useRef } from 'react';
import { X, ExternalLink, CheckCircle2, Circle, BookOpen, Trophy, ArrowRight } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { TopicData, CATEGORY_COLORS } from '@/lib/types';

interface TopicModalProps {
  topic: TopicData | null;
  isOpen: boolean;
  onClose: () => void;
  isCompleted: boolean;
  onToggleComplete: (slug: string, completed: boolean) => void;
}

export function TopicModal({ topic, isOpen, onClose, isCompleted, onToggleComplete }: TopicModalProps) {
  const sidebarRef = useRef<HTMLElement>(null);

  useEffect(() => {
    if (!isOpen) return;

    const handlePointerDown = (event: PointerEvent) => {
      const target = event.target as HTMLElement | null;
      if (!target) return;
      if (sidebarRef.current?.contains(target)) return;
      if (target.closest('[data-topic-trigger="true"]')) return;
      onClose();
    };

    document.addEventListener('pointerdown', handlePointerDown);
    return () => document.removeEventListener('pointerdown', handlePointerDown);
  }, [isOpen, onClose]);

  if (!topic) return null;

  const catColor = CATEGORY_COLORS[topic?.category ?? ''] ?? '#06b6d4';

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.aside
          ref={sidebarRef}
          initial={{ x: '110%', opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          exit={{ x: '110%', opacity: 0 }}
          transition={{ type: 'spring', damping: 28, stiffness: 260 }}
          className="fixed right-3 top-[76px] bottom-3 z-40 w-[calc(100vw-1.5rem)] max-w-[440px] overflow-hidden rounded-xl border border-border bg-card shadow-2xl md:right-4 md:bottom-4"
        >
          <div className="flex h-full flex-col">
            {/* Cabeçalho */}
            <div className="p-5 border-b border-border shrink-0">
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <span
                      className="text-xs font-medium px-2 py-0.5 rounded-full"
                      style={{ backgroundColor: `${catColor}20`, color: catColor }}
                    >
                      {topic?.category ?? ''}
                    </span>
                    <span className="text-xs text-muted-foreground">Área {topic?.areaId ?? ''}</span>
                  </div>
                  <h2 className="font-display text-lg font-bold tracking-tight leading-tight">{topic?.title ?? ''}</h2>
                </div>
                <button
                  onClick={onClose}
                  className="p-2 rounded-lg hover:bg-muted transition-colors shrink-0"
                  aria-label="Fechar detalhes"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Conteúdo */}
            <div className="flex-1 overflow-y-auto p-5 space-y-5">
              {/* Descrição */}
              <div>
                <p className="text-sm text-muted-foreground leading-relaxed">{topic?.description ?? ''}</p>
              </div>

              {/* Pré-requisitos */}
              {(topic?.prerequisites ?? '').length > 0 && (
                <div className="bg-muted/40 rounded-lg p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <ArrowRight className="w-4 h-4 text-primary" />
                    <h3 className="text-sm font-semibold">Pré-requisitos</h3>
                  </div>
                  <p className="text-sm text-muted-foreground">{topic?.prerequisites ?? ''}</p>
                </div>
              )}

              {/* Recursos */}
              {(topic?.resources?.length ?? 0) > 0 && (
                <div>
                  <div className="flex items-center gap-2 mb-3">
                    <BookOpen className="w-4 h-4 text-primary" />
                    <h3 className="text-sm font-semibold">Recursos de Aprendizado</h3>
                  </div>
                  <div className="space-y-2">
                    {(topic?.resources ?? []).map((r: any, i: number) => (
                      <a
                        key={r?.id ?? i}
                        href={r?.url ?? '#'}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-3 p-3 rounded-lg bg-muted/30 hover:bg-muted/60 transition-colors group"
                      >
                        <span className="w-6 h-6 rounded-full bg-primary/10 text-primary flex items-center justify-center text-xs font-bold shrink-0">
                          {i + 1}
                        </span>
                        <span className="text-sm flex-1">{r?.title ?? ''}</span>
                        <ExternalLink className="w-3.5 h-3.5 text-muted-foreground group-hover:text-primary transition-colors shrink-0" />
                      </a>
                    ))}
                  </div>
                </div>
              )}

              {/* Desafio */}
              {(topic?.challenge ?? '').length > 0 && (
                <div className="bg-primary/5 border border-primary/10 rounded-lg p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <Trophy className="w-4 h-4 text-primary" />
                    <h3 className="text-sm font-semibold">Desafio de Conclusão</h3>
                  </div>
                  <p className="text-sm text-muted-foreground leading-relaxed">{topic?.challenge ?? ''}</p>
                </div>
              )}
            </div>

            {/* Rodapé */}
            <div className="p-4 border-t border-border shrink-0">
              <button
                onClick={() => onToggleComplete?.(topic?.slug ?? '', !isCompleted)}
                className={`w-full flex items-center justify-center gap-2 py-3 rounded-lg text-sm font-medium transition-all ${
                  isCompleted
                    ? 'bg-green-500/10 text-green-600 dark:text-green-400 hover:bg-green-500/20'
                    : 'bg-primary text-primary-foreground hover:opacity-90'
                }`}
              >
                {isCompleted ? (
                  <><CheckCircle2 className="w-4 h-4" /> Concluído — Clique para Desfazer</>
                ) : (
                  <><Circle className="w-4 h-4" /> Marcar como Concluído</>
                )}
              </button>
            </div>
          </div>
        </motion.aside>
      )}
    </AnimatePresence>
  );
}
