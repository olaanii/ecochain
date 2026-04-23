import http from 'k6/http';
import { check, sleep, group } from 'k6';
import { Rate, Trend } from 'k6/metrics';

/**
 * k6 Load Test: API Endpoints Baseline
 * 
 * Scenarios:
 * - Smoke test: minimal load to verify system works
 * - Load test: typical production load
 * - Stress test: find breaking point
 * - Spike test: sudden traffic surge
 * 
 * Run: k6 run tests/load/api-load.js
 */

// Custom metrics
const apiErrorRate = new Rate('api_errors');
const apiResponseTime = new Trend('api_response_time');

// Test configuration
export const options = {
  stages: [
    // Smoke test - verify basic functionality
    { duration: '1m', target: 5 },
    
    // Ramp up to normal load
    { duration: '2m', target: 50 },
    
    // Sustain normal load
    { duration: '5m', target: 50 },
    
    // Spike test - sudden surge
    { duration: '30s', target: 200 },
    { duration: '2m', target: 200 },
    
    // Recovery
    { duration: '2m', target: 50 },
    
    // Gradual ramp down
    { duration: '2m', target: 0 },
  ],
  thresholds: {
    http_req_duration: ['p(95)<500'], // 95% of requests under 500ms
    http_req_failed: ['rate<0.1'],    // Less than 10% errors
    api_errors: ['rate<0.05'],        // Less than 5% API errors
  },
};

const BASE_URL = __ENV.BASE_URL || 'http://localhost:3000';

export default function () {
  group('Health & Status', () => {
    // Health check endpoint
    const healthRes = http.get(`${BASE_URL}/api/health`);
    const healthCheck = check(healthRes, {
      'health status is 200': (r) => r.status === 200,
      'health response time < 200ms': (r) => r.timings.duration < 200,
    });
    apiErrorRate.add(!healthCheck);
    apiResponseTime.add(healthRes.timings.duration);
    
    // System status
    const statusRes = http.get(`${BASE_URL}/api/status`);
    check(statusRes, {
      'status endpoint works': (r) => r.status === 200,
    });
    
    sleep(1);
  });

  group('Read Operations', () => {
    // Get staking info
    const stakingRes = http.get(`${BASE_URL}/api/staking/info`);
    const stakingCheck = check(stakingRes, {
      'staking info returns 200': (r) => r.status === 200,
      'staking info has APY data': (r) => r.json('apy') !== undefined,
    });
    apiErrorRate.add(!stakingCheck);
    
    // Get tasks list
    const tasksRes = http.get(`${BASE_URL}/api/tasks`);
    check(tasksRes, {
      'tasks endpoint works': (r) => r.status === 200,
    });
    
    // Get proposals
    const proposalsRes = http.get(`${BASE_URL}/api/governance/proposals`);
    check(proposalsRes, {
      'proposals endpoint works': (r) => r.status === 200,
    });
    
    sleep(2);
  });

  group('User Operations', () => {
    // Get user stakes
    const stakesRes = http.get(`${BASE_URL}/api/user/stakes`, {
      headers: {
        'Authorization': `Bearer ${__ENV.TEST_TOKEN || 'test-token'}`,
      },
    });
    check(stakesRes, {
      'user stakes endpoint accessible': (r) => [200, 401].includes(r.status),
    });
    
    // Get user rewards
    const rewardsRes = http.get(`${BASE_URL}/api/user/rewards`, {
      headers: {
        'Authorization': `Bearer ${__ENV.TEST_TOKEN || 'test-token'}`,
      },
    });
    check(rewardsRes, {
      'user rewards endpoint accessible': (r) => [200, 401].includes(r.status),
    });
    
    sleep(1);
  });
}

// Setup function runs once at the beginning
export function setup() {
  console.log(`Starting load test against: ${BASE_URL}`);
  
  // Verify target is reachable
  const res = http.get(`${BASE_URL}/api/health`);
  if (res.status !== 200) {
    throw new Error(`Target ${BASE_URL} is not reachable. Status: ${res.status}`);
  }
  
  return { baseUrl: BASE_URL };
}

// Teardown function runs once at the end
export function teardown(data) {
  console.log(`Load test completed for: ${data.baseUrl}`);
}
