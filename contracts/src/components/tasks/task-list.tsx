/**
 * Task List Component
 * 
 * Displays list of tasks with filters and pagination
 */

'use client';

import { useState } from 'react';
import { useTasks } from '@/hooks/useTasks';
import Link from 'next/link';

interface TaskListProps {
  initialCategory?: string;
  initialMinReward?: number;
  initialMaxReward?: number;
}

export function TaskList({
  initialCategory,
  initialMinReward,
  initialMaxReward,
}: TaskListProps) {
  const [category, setCategory] = useState(initialCategory);
  const [minReward, setMinReward] = useState(initialMinReward);
  const [maxReward, setMaxReward] = useState(initialMaxReward);
  const [page, setPage] = useState(1);

  const { tasks, pagination, loading, error, cached, refetch } = useTasks(
    category,
    minReward,
    maxReward,
    page,
    20
  );

  const categories = ['transit', 'recycling', 'energy', 'community'];

  return (
    <div className="space-y-6">
      {/* Filters */}
      <div className="bg-white rounded-lg shadow p-6 space-y-4">
        <h2 className="text-lg font-semibold">Filters</h2>

        {/* Category Filter */}
        <div>
          <label className="block text-sm font-medium mb-2">Category</label>
          <select
            value={category || ''}
            onChange={(e) => {
              setCategory(e.target.value || undefined);
              setPage(1);
            }}
            className="w-full px-3 py-2 border border-gray-300 rounded-md"
          >
            <option value="">All Categories</option>
            {categories.map((cat) => (
              <option key={cat} value={cat}>
                {cat.charAt(0).toUpperCase() + cat.slice(1)}
              </option>
            ))}
          </select>
        </div>

        {/* Reward Range Filter */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-2">Min Reward</label>
            <input
              type="number"
              value={minReward || ''}
              onChange={(e) => {
                setMinReward(e.target.value ? parseInt(e.target.value) : undefined);
                setPage(1);
              }}
              placeholder="0"
              className="w-full px-3 py-2 border border-gray-300 rounded-md"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">Max Reward</label>
            <input
              type="number"
              value={maxReward || ''}
              onChange={(e) => {
                setMaxReward(e.target.value ? parseInt(e.target.value) : undefined);
                setPage(1);
              }}
              placeholder="1000"
              className="w-full px-3 py-2 border border-gray-300 rounded-md"
            />
          </div>
        </div>

        <button
          onClick={() => refetch()}
          className="w-full bg-blue-600 text-white py-2 rounded-md hover:bg-blue-700"
        >
          Apply Filters
        </button>
      </div>

      {/* Tasks List */}
      <div className="space-y-4">
        {loading && <div className="text-center py-8">Loading tasks...</div>}

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-700">
            {error}
          </div>
        )}

        {!loading && tasks.length === 0 && (
          <div className="text-center py-8 text-gray-500">No tasks found</div>
        )}

        {tasks.map((task) => (
          <Link key={task.id} href={`/tasks/${task.slug}`}>
            <div className="bg-white rounded-lg shadow p-6 hover:shadow-lg transition cursor-pointer">
              <div className="flex justify-between items-start mb-2">
                <h3 className="text-lg font-semibold">{task.name}</h3>
                <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm">
                  {task.baseReward} ECO
                </span>
              </div>

              <p className="text-gray-600 mb-3">{task.description}</p>

              <div className="flex justify-between items-center text-sm">
                <span className="text-gray-500">
                  {task.category.charAt(0).toUpperCase() + task.category.slice(1)}
                </span>
                <span className="text-gray-500">{task.verificationMethod}</span>
              </div>
            </div>
          </Link>
        ))}
      </div>

      {/* Pagination */}
      {pagination.pages > 1 && (
        <div className="flex justify-center gap-2">
          <button
            onClick={() => setPage(Math.max(1, page - 1))}
            disabled={page === 1}
            className="px-4 py-2 border border-gray-300 rounded-md disabled:opacity-50"
          >
            Previous
          </button>

          <div className="flex items-center gap-2">
            {Array.from({ length: pagination.pages }, (_, i) => i + 1).map((p) => (
              <button
                key={p}
                onClick={() => setPage(p)}
                className={`px-3 py-2 rounded-md ${
                  p === page
                    ? 'bg-blue-600 text-white'
                    : 'border border-gray-300 hover:bg-gray-50'
                }`}
              >
                {p}
              </button>
            ))}
          </div>

          <button
            onClick={() => setPage(Math.min(pagination.pages, page + 1))}
            disabled={page === pagination.pages}
            className="px-4 py-2 border border-gray-300 rounded-md disabled:opacity-50"
          >
            Next
          </button>
        </div>
      )}

      {/* Cache Status */}
      {cached && (
        <div className="text-center text-sm text-gray-500">
          Showing cached results (updated 5 minutes ago)
        </div>
      )}
    </div>
  );
}
