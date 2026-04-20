# Task Management API

Complete task management system for the EcoChain Eco Rewards Platform. Provides task listing, filtering, pagination, and bonus multiplier calculations.

## Overview

The task management system consists of:

1. **Task List API** - Get tasks with filters and pagination
2. **Task Detail API** - Get single task details
3. **Bonus Multiplier** - Calculate user bonuses based on streak and mastery
4. **React Hooks** - Frontend integration
5. **Components** - UI components for displaying tasks

## Requirements

- **1.1**: Create GET /api/tasks endpoint
- **1.2**: Implement task list query with filters
- **1.3**: Add pagination (limit 50 items per page)
- **1.4**: Create GET /api/tasks/:taskId endpoint
- **1.5**: Calculate user bonus multipliers
- **1.6**: Cache task list with 5-minute TTL
- **1.7**: Execute queries within 100ms
- **5.1, 5.2, 5.3, 5.4**: Bonus multiplier requirements

## API Endpoints

### GET /api/tasks

Get list of tasks with filters and pagination.

**Query Parameters:**
- `category` (optional) - Filter by category (transit, recycling, energy, community)
- `minReward` (optional) - Minimum reward amount
- `maxReward` (optional) - Maximum reward amount
- `page` (optional, default: 1) - Page number
- `limit` (optional, default: 20, max: 50) - Items per page

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": "task-1",
      "slug": "transit-task-1",
      "name": "Take Public Transit",
      "description": "Use public transportation for your commute",
      "verificationHint": "Upload a photo of your transit ticket",
      "category": "transit",
      "baseReward": 100,
      "bonusFactor": 1.0,
      "verificationMethod": "photo",
      "requirements": []
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 50,
    "pages": 3
  },
  "cached": false,
  "responseTime": 45
}
```

**Example Requests:**

```bash
# Get all tasks
curl http://localhost:3000/api/tasks

# Filter by category
curl http://localhost:3000/api/tasks?category=transit

# Filter by reward range
curl http://localhost:3000/api/tasks?minReward=50&maxReward=200

# Pagination
curl http://localhost:3000/api/tasks?page=2&limit=10

# Combined filters
curl http://localhost:3000/api/tasks?category=recycling&minReward=100&page=1&limit=20
```

### GET /api/tasks/:taskId

Get single task details.

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "task-1",
    "slug": "transit-task-1",
    "name": "Take Public Transit",
    "description": "Use public transportation for your commute",
    "verificationHint": "Upload a photo of your transit ticket",
    "category": "transit",
    "baseReward": 100,
    "bonusFactor": 1.0,
    "verificationMethod": "photo",
    "requirements": [],
    "active": true
  },
  "cached": false,
  "responseTime": 25
}
```

**Example Request:**

```bash
curl http://localhost:3000/api/tasks/task-1
```

### GET /api/tasks/:taskId/bonus

Get bonus multiplier and potential reward for current user.

**Response:**
```json
{
  "success": true,
  "data": {
    "taskId": "task-1",
    "taskName": "Take Public Transit",
    "baseReward": 100,
    "multiplier": {
      "baseMultiplier": 1.0,
      "streakBonus": 0.1,
      "streakDays": 10,
      "categoryMasteryBonus": 0.05,
      "completionCount": 10,
      "totalMultiplier": 1.15
    },
    "potentialReward": 115
  }
}
```

**Example Request:**

```bash
curl http://localhost:3000/api/tasks/task-1/bonus \
  -H "Authorization: Bearer <token>"
```

## Bonus Multiplier System

### Calculation

Total Multiplier = Base (1.0) + Streak Bonus + Category Mastery Bonus

**Streak Bonus:**
- +0.01 per day
- Maximum: +0.3 (30 days)
- Formula: `min(streakDays * 0.01, 0.3)`

**Category Mastery Bonus:**
- +0.05 per 10 completions
- Maximum: +0.2 (40+ completions)
- Formula: `min(floor(completions / 10) * 0.05, 0.2)`

**Total Multiplier Cap:**
- Minimum: 1.0x
- Maximum: 2.0x

### Examples

| Streak Days | Completions | Streak Bonus | Mastery Bonus | Total Multiplier |
|-------------|-------------|--------------|---------------|------------------|
| 0           | 0           | 0.00         | 0.00          | 1.00x            |
| 10          | 10          | 0.10         | 0.05          | 1.15x            |
| 20          | 20          | 0.20         | 0.10          | 1.30x            |
| 30          | 40          | 0.30         | 0.20          | 1.50x            |
| 50          | 100         | 0.30 (capped)| 0.20 (capped) | 1.50x            |

### Reward Calculation

```
Potential Reward = Base Reward × Total Multiplier
```

Example:
- Base Reward: 100 ECO
- Multiplier: 1.15x
- Potential Reward: 115 ECO

## React Hooks

### useTasks

Fetch list of tasks with filters and pagination.

```typescript
import { useTasks } from '@/hooks/useTasks';

function MyComponent() {
  const { tasks, pagination, loading, error, cached, refetch } = useTasks(
    category,
    minReward,
    maxReward,
    page,
    limit
  );

  return (
    <div>
      {loading && <p>Loading...</p>}
      {error && <p>Error: {error}</p>}
      {tasks.map(task => (
        <div key={task.id}>{task.name}</div>
      ))}
    </div>
  );
}
```

### useTaskDetail

Fetch single task details.

```typescript
import { useTaskDetail } from '@/hooks/useTasks';

function TaskDetailComponent({ taskId }) {
  const { task, loading, error, cached, refetch } = useTaskDetail(taskId);

  return (
    <div>
      {loading && <p>Loading...</p>}
      {task && <h1>{task.name}</h1>}
    </div>
  );
}
```

### useTaskBonus

Fetch bonus multiplier for current user.

```typescript
import { useTaskBonus } from '@/hooks/useTasks';

function BonusComponent({ taskId }) {
  const { bonus, loading, error, refetch } = useTaskBonus(taskId);

  return (
    <div>
      {bonus && (
        <div>
          <p>Base Reward: {bonus.baseReward}</p>
          <p>Multiplier: {bonus.multiplier.totalMultiplier}x</p>
          <p>Potential Reward: {bonus.potentialReward}</p>
        </div>
      )}
    </div>
  );
}
```

## React Components

### TaskList

Display list of tasks with filters and pagination.

```typescript
import { TaskList } from '@/components/tasks/task-list';

export default function TasksPage() {
  return <TaskList initialCategory="transit" />;
}
```

### TaskDetail

Display task details with bonus multiplier.

```typescript
import { TaskDetail } from '@/components/tasks/task-detail';

export default function TaskDetailPage({ params }) {
  return <TaskDetail taskId={params.taskId} />;
}
```

## Caching

### Cache Strategy

- **Task List**: 5-minute TTL
- **Task Detail**: 5-minute TTL
- **Cache Key Format**: `tasks:list:{query}` or `task:{taskId}`

### Cache Invalidation

Cache is automatically invalidated when:
- Task is updated
- New verification is completed
- User streak is updated

### Manual Cache Invalidation

```typescript
import { redis } from '@/lib/redis/client';

// Clear specific task cache
await redis.del(`task:${taskId}`);

// Clear all task list caches
await redis.del('tasks:list:*');
```

## Performance

### Query Performance

- **Task List**: < 100ms (requirement 1.7)
- **Task Detail**: < 50ms
- **Bonus Calculation**: < 200ms

### Optimization Techniques

1. **Database Indexes**
   - Index on `category`
   - Index on `active`
   - Index on `baseReward`

2. **Query Optimization**
   - Select only required fields
   - Use pagination to limit results
   - Cache frequently accessed data

3. **Redis Caching**
   - Cache task lists
   - Cache task details
   - 5-minute TTL

## Error Handling

### Common Errors

**400 Bad Request**
- Invalid query parameters
- Invalid task ID format

**401 Unauthorized**
- Missing authentication token (for bonus endpoint)

**404 Not Found**
- Task not found
- User not found

**500 Internal Server Error**
- Database error
- Unexpected error

### Error Response Format

```json
{
  "success": false,
  "error": "Error message",
  "details": []
}
```

## Testing

### Unit Tests

```bash
npm run test -- src/lib/tasks/__tests__/bonus-multiplier.test.ts
```

### Test Coverage

- Streak bonus calculation
- Category mastery bonus calculation
- Total multiplier bounds
- Combined multiplier scenarios
- Reward calculation

## Integration

### Starting the API

The API is automatically available when the Next.js server starts.

### Using in Components

```typescript
import { useTasks, useTaskDetail, useTaskBonus } from '@/hooks/useTasks';
import { TaskList, TaskDetail } from '@/components/tasks';

// Use hooks in components
// Use components in pages
```

## Related Files

- `src/app/api/tasks/route.ts` - Task list API
- `src/app/api/tasks/[taskId]/route.ts` - Task detail API
- `src/app/api/tasks/[taskId]/bonus/route.ts` - Bonus multiplier API
- `src/lib/tasks/bonus-multiplier.ts` - Bonus calculation logic
- `src/hooks/useTasks.ts` - React hooks
- `src/components/tasks/task-list.tsx` - Task list component
- `src/components/tasks/task-detail.tsx` - Task detail component
