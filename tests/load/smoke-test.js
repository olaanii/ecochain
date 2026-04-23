import http from 'k6/http';
import { check, sleep } from 'k6';

/**
 * k6 Smoke Test: Quick verification that system is healthy
 * 
 * Run: k6 run tests/load/smoke-test.js
 * 
 * This test should pass in under 30 seconds.
 * If it fails, something is fundamentally broken.
 */

export const options = {
  vus: 1,           // Single virtual user
  iterations: 1,    // Run once
  thresholds: {
    http_req_duration: ['max<2000'], // All requests under 2s
    http_req_failed: ['rate==0'],     // Zero errors allowed
  },
};

const BASE_URL = __ENV.BASE_URL || 'http://localhost:3000';

const ENDPOINTS = [
  { name: 'Health', method: 'GET', path: '/api/health', expectedStatus: 200 },
  { name: 'Status', method: 'GET', path: '/api/status', expectedStatus: 200 },
  { name: 'Staking Info', method: 'GET', path: '/api/staking/info', expectedStatus: 200 },
  { name: 'Tasks', method: 'GET', path: '/api/tasks', expectedStatus: 200 },
  { name: 'Proposals', method: 'GET', path: '/api/governance/proposals', expectedStatus: 200 },
];

export default function () {
  console.log(`🔥 Smoke testing ${BASE_URL}`);
  
  let allPassed = true;
  
  for (const endpoint of ENDPOINTS) {
    const url = `${BASE_URL}${endpoint.path}`;
    const res = http.get(url);
    
    const passed = check(res, {
      [`${endpoint.name} returns ${endpoint.expectedStatus}`]: (r) => 
        r.status === endpoint.expectedStatus,
      [`${endpoint.name} responds in < 1s`]: (r) => 
        r.timings.duration < 1000,
    });
    
    if (!passed) {
      allPassed = false;
      console.error(`❌ ${endpoint.name} failed: ${res.status} (${res.timings.duration}ms)`);
    } else {
      console.log(`✅ ${endpoint.name}: ${res.status} (${res.timings.duration.toFixed(0)}ms)`);
    }
    
    sleep(0.5);
  }
  
  if (allPassed) {
    console.log('✅ Smoke test PASSED - System is healthy');
  } else {
    console.error('❌ Smoke test FAILED - Check logs above');
  }
}

export function setup() {
  console.log('Starting smoke test...');
}
