export enum TaskStatus {
  PENDING = 'PENDING',
  IN_PROGRESS = 'IN_PROGRESS',
  COMPLETED = 'COMPLETED',
  SKIPPED = 'SKIPPED'
}

export enum Priority {
  LOW = 'LOW',
  MEDIUM = 'MEDIUM',
  HIGH = 'HIGH'
}

export interface Task {
  id: string;
  title: string;
  description?: string;
  date: string; // YYYY-MM-DD format (Gregorian)
  startTime?: string; // HH:mm format
  durationMinutes: number;
  status: TaskStatus;
  priority: Priority;
  category: string; // e.g., 'Work', 'Health', 'Learning'
  completedAt?: string; // ISO String
}

export interface DailyAnalysis {
  date: string;
  productivityScore: number; // 0-100
  insights: string[];
  suggestions: string[];
  moodEmoji: string;
  chartData: { name: string; value: number }[];
}

export type ViewState = 'timeline' | 'analysis' | 'settings';

export interface AIParseResult {
  title: string;
  description: string;
  date: string; // YYYY-MM-DD
  startTime: string | undefined;
  durationMinutes: number;
  priority: Priority;
  category: string;
}