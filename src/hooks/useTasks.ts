/**
 * useTasks Hook
 * 
 * React hook for fetching and managing tasks
 */

import { useEffect, useState, useCallback } from 'react';

export interface Task {
  id: string;
  slug: string;
  name: string;
  description: string;
  verificationHint: string;
  category: string;
  baseReward: number;
  bonusFactor: number;
  verificationMethod: string;
  requirements: any[];
}

export interface TasksResponse {
  success: boolean;
  data?: Task[];
  error?: string;
  pagination?: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
  cached: boolean;
  responseTime: number;
}

export interface TaskDetailResponse {
  success: boolean;
  data?: Task;
  error?: string;
  cached: boolean;
  responseTime: number;
}

export interface BonusMultiplier {
  baseMultiplier: number;
  streakBonus: number;
  streakDays: number;
  categoryMasteryBonus: number;
  completionCount: number;
  totalMultiplier: number;
}

export interface BonusResponse {
  success: boolean;
  data?: {
    taskId: string;
    taskName: string;
    baseReward: number;
    multiplier: BonusMultiplier;
    potentialReward: number;
  };
  error?: string;
}

/**
 * Hook for fetching tasks list
 */
export function useTasks(
  category?: string,
  minReward?: number,
  maxReward?: number,
  page: number = 1,
  limit: number = 20
) {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 20,
    total: 0,
    pages: 0,
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [cached, setCached] = useState(false);

  const fetchTasks = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const params = new URLSearchParams();
      if (category) params.append('category', category);
      if (minReward !== undefined) params.append('minReward', minReward.toString());
      if (maxReward !== undefined) params.append('maxReward', maxReward.toString());
      params.append('page', page.toString());
      params.append('limit', limit.toString());

      const response = await fetch(`/api/tasks?${params.toString()}`);
      const data: TasksResponse = await response.json();

      if (data.success && data.data && data.pagination) {
        setTasks(data.data);
        setPagination(data.pagination);
        setCached(data.cached);
        setError(null);
      } else {
        setError(data.error || 'Failed to fetch tasks');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  }, [category, minReward, maxReward, page, limit]);

  useEffect(() => {
    fetchTasks();
  }, [fetchTasks]);

  return {
    tasks,
    pagination,
    loading,
    error,
    cached,
    refetch: fetchTasks,
  };
}

/**
 * Hook for fetching single task details
 */
export function useTaskDetail(taskId: string) {
  const [task, setTask] = useState<Task | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [cached, setCached] = useState(false);

  const fetchTask = useCallback(async () => {
    if (!taskId) return;

    try {
      setLoading(true);
      setError(null);

      const response = await fetch(`/api/tasks/${taskId}`);
      const data: TaskDetailResponse = await response.json();

      if (data.success && data.data) {
        setTask(data.data);
        setCached(data.cached);
        setError(null);
      } else {
        setError(data.error || 'Failed to fetch task');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  }, [taskId]);

  useEffect(() => {
    fetchTask();
  }, [fetchTask]);

  return {
    task,
    loading,
    error,
    cached,
    refetch: fetchTask,
  };
}

/**
 * Hook for fetching bonus multiplier
 */
export function useTaskBonus(taskId: string) {
  const [bonus, setBonus] = useState<BonusResponse['data'] | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchBonus = useCallback(async () => {
    if (!taskId) return;

    try {
      setLoading(true);
      setError(null);

      const response = await fetch(`/api/tasks/${taskId}/bonus`);
      const data: BonusResponse = await response.json();

      if (data.success && data.data) {
        setBonus(data.data);
        setError(null);
      } else {
        setError(data.error || 'Failed to fetch bonus');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  }, [taskId]);

  useEffect(() => {
    fetchBonus();
  }, [fetchBonus]);

  return {
    bonus,
    loading,
    error,
    refetch: fetchBonus,
  };
}
