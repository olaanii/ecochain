"use client";

import { useEffect, useState } from "react";
import { useNavigation } from "@/contexts/navigation-context";
import { TopNavBar } from "@/components/layout/top-nav-bar";

type Task = {
  id: string;
  name: string;
  description: string;
  category: string;
  baseReward: number;
  bonusMultiplier: number;
  verificationHint: string;
};

type CategoryFilter = "all" | "Transport" | "Recycling" | "Energy" | "Community";

export default function DiscoverPage() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<CategoryFilter>("all");
  const { goToVerification } = useNavigation();

  useEffect(() => {
    async function fetchTasks() {
      try {
        setLoading(true);
        const response = await fetch("/api/tasks");
        if (!response.ok) {
          throw new Error("Failed to fetch tasks");
        }
        const data = await response.json();
        setTasks(data.tasks || []);
      } catch (err) {
        setError(err instanceof Error ? err.message : "An error occurred");
      } finally {
        setLoading(false);
      }
    }

    fetchTasks();
  }, []);

  const filteredTasks =
    selectedCategory === "all"
      ? tasks
      : tasks.filter((task) => task.category === selectedCategory);

  const handleTaskClick = (taskId: string) => {
    goToVerification(taskId);
  };

  const categories: CategoryFilter[] = ["all", "Transport", "Recycling", "Energy", "Community"];

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      <TopNavBar variant="app" />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">Discover Eco-Tasks</h1>
          <p className="text-lg text-gray-600">
            Explore available eco-tasks and start earning rewards for sustainable actions
          </p>
        </div>

        {/* Category Filters */}
        <div className="mb-8">
          <div className="flex flex-wrap gap-3">
            {categories.map((category) => (
              <button
                key={category}
                onClick={() => setSelectedCategory(category)}
                className={`px-6 py-2 rounded-full font-medium transition-all ${
                  selectedCategory === category
                    ? "bg-green-600 text-white shadow-md"
                    : "bg-white text-gray-700 border border-gray-300 hover:border-green-500 hover:text-green-600"
                }`}
              >
                {category === "all" ? "All Tasks" : category}
              </button>
            ))}
          </div>
        </div>

        {/* Loading State */}
        {loading && (
          <div className="flex justify-center items-center py-20">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div>
          </div>
        )}

        {/* Error State */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-8">
            <p className="text-red-800">Error: {error}</p>
          </div>
        )}

        {/* Task Cards Grid */}
        {!loading && !error && (
          <>
            {filteredTasks.length === 0 ? (
              <div className="text-center py-20">
                <p className="text-gray-500 text-lg">No tasks found for this category</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredTasks.map((task) => (
                  <div
                    key={task.id}
                    onClick={() => handleTaskClick(task.id)}
                    className="bg-white rounded-xl shadow-md hover:shadow-xl transition-shadow cursor-pointer border border-gray-200 overflow-hidden group"
                  >
                    {/* Category Badge */}
                    <div className="bg-gradient-to-r from-green-500 to-green-600 px-4 py-2">
                      <span className="text-white text-sm font-semibold">{task.category}</span>
                    </div>

                    {/* Card Content */}
                    <div className="p-6">
                      <h3 className="text-xl font-bold text-gray-900 mb-2 group-hover:text-green-600 transition-colors">
                        {task.name}
                      </h3>
                      <p className="text-gray-600 mb-4 line-clamp-3">{task.description}</p>

                      {/* Rewards Section */}
                      <div className="flex items-center justify-between mb-4 pt-4 border-t border-gray-100">
                        <div>
                          <p className="text-sm text-gray-500">Base Reward</p>
                          <p className="text-2xl font-bold text-green-600">{task.baseReward}</p>
                        </div>
                        <div className="text-right">
                          <p className="text-sm text-gray-500">Bonus</p>
                          <p className="text-xl font-semibold text-orange-500">
                            {task.bonusMultiplier}x
                          </p>
                        </div>
                      </div>

                      {/* Verification Hint */}
                      <div className="bg-gray-50 rounded-lg p-3 mb-4">
                        <p className="text-xs text-gray-500 mb-1">Verification Hint</p>
                        <p className="text-sm text-gray-700">{task.verificationHint}</p>
                      </div>

                      {/* Action Button */}
                      <button className="w-full bg-green-600 hover:bg-green-700 text-white font-semibold py-3 rounded-lg transition-colors">
                        Start Task
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </>
        )}

        {/* Task Count */}
        {!loading && !error && filteredTasks.length > 0 && (
          <div className="mt-8 text-center">
            <p className="text-gray-600">
              Showing {filteredTasks.length} {filteredTasks.length === 1 ? "task" : "tasks"}
              {selectedCategory !== "all" && ` in ${selectedCategory}`}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
