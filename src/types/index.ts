// Task status types
export type TaskStatus = 'active' | 'paused' | 'completed' | 'failed';

// Task source types
export type TaskSource = 'figma' | 'vscode' | 'terminal' | 'chrome' | 'blender' | 'other';

// Task data interface
export interface Task {
  id: string;
  title: string;
  source: TaskSource;
  status: TaskStatus;
  startTime: Date;
  duration: number; // in seconds
  estimatedTime?: number; // in minutes
  isSystem?: boolean;
}

// Task stats interface
export interface TaskStats {
  total: number;
  active: number;
  paused: number;
  completed: number;
} 