export interface TopicData {
  id: string;
  slug: string;
  title: string;
  description: string;
  category: string;
  areaId: number;
  sortOrder: number;
  prerequisites: string;
  challenge: string;
  resources: ResourceData[];
  dependsOn: DependencyData[];
  dependedBy: DependencyData[];
}

export interface ResourceData {
  id: string;
  title: string;
  url: string;
  sortOrder: number;
}

export interface DependencyData {
  id: string;
  dependentId: string;
  prerequisiteId: string;
}

export interface AreaData {
  id: number;
  title: string;
  description: string;
  sortOrder: number;
  topics: TopicData[];
}

export interface ProgressMap {
  [topicSlug: string]: boolean;
}

export const CATEGORY_COLORS: Record<string, string> = {
  // Area 1 & 2 categories (Portuguese)
  'Fundamentos': '#06b6d4',
  'Linguagens': '#8b5cf6',
  'Ferramentas': '#f59e0b',
  'Web': '#ec4899',
  'Sistemas': '#ef4444',
  'Dados': '#10b981',
  'Qualidade': '#6366f1',
  'Teoria': '#3b82f6',
  'Matemática': '#a855f7',
  // Area 3 specialization categories
  'Backend': '#f97316',
  'Frontend': '#06b6d4',
  'Ops': '#22c55e',
};
