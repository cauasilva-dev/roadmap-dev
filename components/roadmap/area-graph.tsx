'use client';

import { useMemo, useRef, useEffect, useState } from 'react';
import { TopicData, CATEGORY_COLORS, ProgressMap } from '@/lib/types';
import { CheckCircle2 } from 'lucide-react';

interface AreaGraphProps {
  topics: TopicData[];
  progress: ProgressMap;
  onTopicClick: (topic: TopicData) => void;
  areaId: number;
}

interface NodePosition {
  id: string;
  x: number;
  y: number;
  topic: TopicData;
}

export function AreaGraph({ topics, progress, onTopicClick, areaId }: AreaGraphProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [containerWidth, setContainerWidth] = useState(800);

  useEffect(() => {
    const el = containerRef?.current;
    if (!el) return;
    const observer = new ResizeObserver((entries: any) => {
      const entry = entries?.[0];
      if (entry) setContainerWidth(entry?.contentRect?.width ?? 800);
    });
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  const { nodePositions, edges, svgHeight } = useMemo(() => {
    const safeTopics = topics ?? [];
    const topicMap = new Map<string, TopicData>();
    safeTopics.forEach((t: TopicData) => topicMap.set(t?.id ?? '', t));

    // Compute levels via topological sort
    const inDegree: Record<string, number> = {};
    const adjList: Record<string, string[]> = {};
    safeTopics.forEach((t: TopicData) => {
      const tid = t?.id ?? '';
      inDegree[tid] = 0;
      adjList[tid] = [];
    });

    const edgeList: Array<{ source: string; target: string }> = [];
    safeTopics.forEach((t: TopicData) => {
      const tid = t?.id ?? '';
      (t?.dependsOn ?? []).forEach((d: any) => {
        const preId = d?.prerequisiteId ?? '';
        if (topicMap.has(preId)) {
          edgeList.push({ source: preId, target: tid });
          inDegree[tid] = (inDegree[tid] ?? 0) + 1;
          if (adjList[preId]) adjList[preId].push(tid);
        }
      });
    });

    const levels: string[][] = [];
    const visited = new Set<string>();
    let currentLevel = Object.keys(inDegree).filter((k: string) => (inDegree[k] ?? 0) === 0);

    while (currentLevel.length > 0) {
      levels.push(currentLevel);
      const nextLevel: string[] = [];
      currentLevel.forEach((id: string) => {
        visited.add(id);
        (adjList[id] ?? []).forEach((child: string) => {
          inDegree[child] = (inDegree[child] ?? 1) - 1;
          if ((inDegree[child] ?? 0) <= 0 && !visited.has(child) && !nextLevel.includes(child)) {
            nextLevel.push(child);
          }
        });
      });
      currentLevel = nextLevel;
    }

    safeTopics.forEach((t: TopicData) => {
      if (!visited.has(t?.id ?? '')) {
        levels.push([t?.id ?? '']);
        visited.add(t?.id ?? '');
      }
    });

    const nodeWidth = 190;
    const nodeHeight = 50;
    const xGap = 28;
    const ySpacing = 96;
    const paddingTop = 30;
    const paddingBottom = 30;

    const positions: NodePosition[] = [];
    const posMap = new Map<string, { x: number; y: number }>();

    levels.forEach((level: string[], levelIdx: number) => {
      const totalWidth = level.length * nodeWidth + (level.length - 1) * xGap;
      const startX = Math.max((containerWidth - totalWidth) / 2, 10);
      level.forEach((id: string, colIdx: number) => {
        const t = topicMap.get(id);
        if (!t) return;
        const x = startX + colIdx * (nodeWidth + xGap);
        const y = paddingTop + levelIdx * ySpacing;
        positions.push({ id, x, y, topic: t });
        posMap.set(id, { x: x + nodeWidth / 2, y: y + nodeHeight / 2 });
      });
    });

    const graphEdges = edgeList.map((e: any) => {
      const from = posMap.get(e?.source ?? '');
      const to = posMap.get(e?.target ?? '');
      if (!from || !to) return null;
      return {
        x1: from.x,
        y1: from.y + nodeHeight / 2,
        x2: to.x,
        y2: to.y - nodeHeight / 2,
      };
    }).filter(Boolean);

    const height = paddingTop + (levels.length) * ySpacing + paddingBottom;

    return { nodePositions: positions, edges: graphEdges, svgHeight: height };
  }, [topics, containerWidth]);

  return (
    <div ref={containerRef} className="w-full overflow-x-auto">
      <svg width={containerWidth} height={svgHeight} className="min-w-full">
        <defs>
          <marker id={`arrowhead-${areaId}`} markerWidth="8" markerHeight="6" refX="8" refY="3" orient="auto">
            <polygon points="0 0, 8 3, 0 6" fill="hsl(var(--muted-foreground))" opacity="0.5" />
          </marker>
        </defs>

        {/* Edges */}
        {(edges ?? []).map((e: any, i: number) => {
          if (!e) return null;
          const midY = ((e?.y1 ?? 0) + (e?.y2 ?? 0)) / 2;
          return (
            <path
              key={i}
              d={`M ${e?.x1 ?? 0} ${e?.y1 ?? 0} C ${e?.x1 ?? 0} ${midY}, ${e?.x2 ?? 0} ${midY}, ${e?.x2 ?? 0} ${e?.y2 ?? 0}`}
              fill="none"
              stroke="hsl(var(--border))"
              strokeWidth="1.5"
              markerEnd={`url(#arrowhead-${areaId})`}
            />
          );
        })}

        {/* Nodes */}
        {(nodePositions ?? []).map((node: NodePosition) => {
          const t = node?.topic;
          if (!t) return null;
          const catColor = CATEGORY_COLORS[t?.category ?? ''] ?? '#06b6d4';
          const isCompleted = progress?.[t?.slug ?? ''] ?? false;
          const nodeW = 190;
          const nodeH = 50;

          return (
            <g
              key={node?.id ?? ''}
              data-topic-trigger="true"
              onClick={() => onTopicClick?.(t)}
              className="cursor-pointer"
              style={{ transition: 'transform 0.15s' }}
            >
              <rect
                x={node?.x ?? 0}
                y={node?.y ?? 0}
                width={nodeW}
                height={nodeH}
                rx={10}
                fill={isCompleted ? 'hsl(142 76% 36% / 0.12)' : 'hsl(var(--card))'}
                stroke={isCompleted ? 'hsl(142 76% 36% / 0.5)' : 'hsl(var(--border))'}
                strokeWidth={isCompleted ? 2 : 1}
                className="hover:stroke-[hsl(var(--primary))] transition-colors"
              />
              {isCompleted && (
                <circle
                  cx={(node?.x ?? 0) + 16}
                  cy={(node?.y ?? 0) + nodeH / 2}
                  r={6}
                  fill="hsl(142 76% 36%)"
                />
              )}
              {isCompleted && (
                <text
                  x={(node?.x ?? 0) + 16}
                  y={(node?.y ?? 0) + nodeH / 2 + 1}
                  textAnchor="middle"
                  dominantBaseline="middle"
                  fill="white"
                  fontSize="8"
                  fontWeight="bold"
                >
                  ✓
                </text>
              )}
              <text
                x={(node?.x ?? 0) + nodeW / 2 + (isCompleted ? 8 : 0)}
                y={(node?.y ?? 0) + nodeH / 2}
                textAnchor="middle"
                dominantBaseline="middle"
                fill={isCompleted ? 'hsl(142 76% 36%)' : catColor}
                fontSize="12"
                fontWeight="600"
                className="pointer-events-none"
              >
                {(t?.title ?? '').length > 24 ? (t?.title ?? '').substring(0, 24) + '...' : (t?.title ?? '')}
              </text>
            </g>
          );
        })}
      </svg>
    </div>
  );
}
