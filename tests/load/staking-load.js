import http from 'k6/http';
import { check, sleep, group } from 'k6';
import { Rate, Counter } from 'k6/metrics';

/**
 * k6 Load Test: Staking Operations
 * 
 * Focus: Staking-related endpoints under load
 * - Get staking info (high frequency)
 * - Calculate rewards (computationally intensive)
 * - View user stakes
 * 
 * Run: k6 run tests/load/staking-load.js
 */

const stakingErrors = new Rate('staking_errors');
const rewardCalculations = new Counter('reward_calculations');

export const options = {
  scenarios: {
    // Constant load: 10 users checking staking info
    constant_staking_info: {
      executor: 'constant-vus',
      vus: 10,
      duration: '5m',
      exec: 'stakingInfoScenario',
    },
    
    // Ramp up: Gradually increase reward calculation requests
    ramp_rewards: {
      executor: 'ramping-vus',
      startVUs: 0,
      stages: [
        { duration: '1m', target: 20 },
        { duration: '3m', target: 50 },
        { duration: '1m', target: 0 },
      ],
      exec: 'rewardCalculationScenario',
    },
    
    // Spike: Sudden burst of user stake queries
    spike_user_stakes: {
      executor: 'shared-iterations',
      vus: 100,
      iterations: 1000,
      maxDuration: '2m',
      exec: 'userStakesScenario',
    },
  },
  thresholds: {
    http_req_duration: ['p(99)<1000'], // 99% under 1s
    http_req_failed: ['rate<0.05'],   // Less than 5% errors
    staking_errors: ['rate<0.02'],      // Less than 2% staking errors
  },
};

const BASE_URL = __ENV.BASE_URL || 'http://localhost:3000';

// Scenario 1: High-frequency staking info reads
export function stakingInfoScenario() {
  group('Staking Info', () => {
    const res = http.get(`${BASE_URL}/api/staking/info`);
    const success = check(res, {
      'staking info returns 200': (r) => r.status === 200,
      'response has APY tiers': (r) => {
        const json = r.json();
        return json && json.tiers && json.tiers.length > 0;
      },
      'response time < 300ms': (r) => r.timings.duration < 300,
    });
    stakingErrors.add(!success);
    sleep(1);
  });
}

// Scenario 2: Reward calculation (CPU-intensive)
export function rewardCalculationScenario() {
  group('Reward Calculation', () => {
    // Test reward calculation for different durations
    const durations = [30, 90, 180, 365];
    const duration = durations[Math.floor(Math.random() * durations.length)];
    
    const res = http.get(
      `${BASE_URL}/api/staking/calculate-rewards?amount=1000&duration=${duration}`,
      { timeout: '5s' }
    );
    
    const success = check(res, {
      'reward calc returns 200': (r) => r.status === 200,
      'has expected rewards': (r) => r.json('expectedRewards') !== undefined,
      'calculation time < 500ms': (r) => r.timings.duration < 500,
    });
    
    stakingErrors.add(!success);
    rewardCalculations.add(1);
    sleep(2);
  });
}

// Scenario 3: User stake queries (spike test)
export function userStakesScenario() {
  group('User Stakes Query', () => {
    const res = http.get(`${BASE_URL}/api/user/stakes`, {
      headers: {
        'Authorization': `Bearer ${__ENV.TEST_TOKEN || 'test-token'}`,
      },
    });
    
    check(res, {
      'user stakes returns valid response': (r) => [200, 401, 403].includes(r.status),
    });
    
    sleep(0.5);
  });
}

export function setup() {
  console.log('Starting staking load test...');
  return { timestamp: new Date().toISOString() };
}
