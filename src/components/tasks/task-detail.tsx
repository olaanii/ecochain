/**
 * Task Detail Component
 * 
 * Displays detailed information about a task including bonus multiplier
 */

'use client';

import { useTaskDetail, useTaskBonus } from '@/hooks/useTasks';
import { useUser } from '@clerk/nextjs';

interface TaskDetailProps {
  taskId: string;
}

export function TaskDetail({ taskId }: TaskDetailProps) {
  const { user } = useUser();
  const { task, loading: taskLoading, error: taskError } = useTaskDetail(taskId);
  const { bonus, loading: bonusLoading, error: bonusError } = useTaskBonus(taskId);

  if (taskLoading) {
    return <div className="text-center py-8">Loading task...</div>;
  }

  if (taskError) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-700">
        {taskError}
      </div>
    );
  }

  if (!task) {
    return <div className="text-center py-8">Task not found</div>;
  }

  return (
    <div className="space-y-6">
      {/* Task Header */}
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex justify-between items-start mb-4">
          <div>
            <h1 className="text-3xl font-bold mb-2">{task.name}</h1>
            <p className="text-gray-600">{task.description}</p>
          </div>
          <div className="text-right">
            <div className="text-4xl font-bold text-blue-600">{task.baseReward}</div>
            <div className="text-gray-600">Base Reward (ECO)</div>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4 pt-4 border-t">
          <div>
            <div className="text-sm text-gray-600">Category</div>
            <div className="font-semibold capitalize">{task.category}</div>
          </div>
          <div>
            <div className="text-sm text-gray-600">Verification Method</div>
            <div className="font-semibold capitalize">{task.verificationMethod}</div>
          </div>
        </div>
      </div>

      {/* Verification Requirements */}
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-lg font-semibold mb-4">Verification Requirements</h2>
        <p className="text-gray-700 mb-4">{task.verificationHint}</p>

        {task.requirements && task.requirements.length > 0 && (
          <ul className="list-disc list-inside space-y-2">
            {task.requirements.map((req, idx) => (
              <li key={idx} className="text-gray-700">
                {typeof req === 'string' ? req : JSON.stringify(req)}
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* Bonus Multiplier (if user is logged in) */}
      {user && bonus && !bonusLoading && (
        <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg shadow p-6">
          <h2 className="text-lg font-semibold mb-4">Your Potential Reward</h2>

          <div className="grid grid-cols-2 gap-4 mb-6">
            <div className="bg-white rounded p-4">
              <div className="text-sm text-gray-600">Base Reward</div>
              <div className="text-2xl font-bold">{bonus.baseReward} ECO</div>
            </div>
            <div className="bg-white rounded p-4">
              <div className="text-sm text-gray-600">Your Multiplier</div>
              <div className="text-2xl font-bold text-blue-600">
                {bonus.multiplier.totalMultiplier.toFixed(2)}x
              </div>
            </div>
          </div>

          <div className="bg-white rounded p-4 mb-6">
            <div className="text-sm text-gray-600 mb-2">Potential Reward</div>
            <div className="text-3xl font-bold text-green-600">{bonus.potentialReward} ECO</div>
          </div>

          {/* Multiplier Breakdown */}
          <div className="space-y-3">
            <h3 className="font-semibold text-sm">Multiplier Breakdown</h3>

            <div className="bg-white rounded p-3 space-y-2">
              <div className="flex justify-between">
                <span className="text-gray-700">Base Multiplier</span>
                <span className="font-semibold">{bonus.multiplier.baseMultiplier.toFixed(2)}x</span>
              </div>

              <div className="flex justify-between">
                <span className="text-gray-700">
                  Streak Bonus ({bonus.multiplier.streakDays} days)
                </span>
                <span className="font-semibold text-blue-600">
                  +{bonus.multiplier.streakBonus.toFixed(2)}x
                </span>
              </div>

              <div className="flex justify-between">
                <span className="text-gray-700">
                  Category Mastery ({bonus.multiplier.completionCount} completions)
                </span>
                <span className="font-semibold text-purple-600">
                  +{bonus.multiplier.categoryMasteryBonus.toFixed(2)}x
                </span>
              </div>

              <div className="border-t pt-2 flex justify-between">
                <span className="font-semibold">Total Multiplier</span>
                <span className="font-bold text-lg">
                  {bonus.multiplier.totalMultiplier.toFixed(2)}x
                </span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Submit Button */}
      <div className="bg-white rounded-lg shadow p-6">
        <button className="w-full bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 transition">
          Submit Proof
        </button>
      </div>
    </div>
  );
}
