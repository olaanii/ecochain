#!/usr/bin/env node

/**
 * Autocannon Load Test Script
 * 
 * Node.js-based HTTP load testing (replaces k6 for environments without Docker)
 * 
 * Usage:
 *   node tests/load/autocannon-load.js
 *   node tests/load/autocannon-load.js --duration 30 --requests 1000
 * 
 * Options:
 *   --duration    Test duration in seconds (default: 10)
 *   --requests    Total requests to send (default: 100)
 *   --connections Concurrent connections (default: 10)
 *   --url         Target URL (default: http://localhost:3000)
 */

import autocannon from 'autocannon';

const args = process.argv.slice(2);
const getArg = (flag, defaultVal) => {
  const index = args.indexOf(flag);
  return index !== -1 ? args[index + 1] : defaultVal;
};

const config = {
  url: getArg('--url', process.env.BASE_URL || 'http://localhost:3000'),
  duration: parseInt(getArg('--duration', '10'), 10),
  connections: parseInt(getArg('--connections', '10'), 10),
  requests: parseInt(getArg('--requests', '100'), 10),
};

const endpoints = [
  { path: '/api/health', method: 'GET' },
  { path: '/api/status', method: 'GET' },
  { path: '/api/staking/info', method: 'GET' },
  { path: '/api/tasks', method: 'GET' },
  { path: '/api/governance/proposals', method: 'GET' },
];

console.log('🔥 Load Test Configuration');
console.log(`   URL: ${config.url}`);
console.log(`   Duration: ${config.duration}s`);
console.log(`   Connections: ${config.connections}`);
console.log(`   Requests: ${config.requests}`);
console.log('');

async function checkServerRunning() {
  try {
    const response = await fetch(`${config.url}/api/health`, { 
      signal: AbortSignal.timeout(5000) 
    });
    return response.status === 200;
  } catch {
    return false;
  }
}

async function runSmokeTest() {
  // Check if server is running first
  const isRunning = await checkServerRunning();
  if (!isRunning) {
    console.error('❌ Server is not running at ' + config.url);
    console.error('');
    console.error('To start the server with Docker:');
    console.error('   docker compose --profile dev up -d');
    console.error('');
    console.error('Or start locally (requires Redis + PostgreSQL):');
    console.error('   pnpm dev');
    console.error('');
    console.error('Alternatively, test against a different URL:');
    console.error('   pnpm run test:load -- --url https://your-api.com');
    console.error('');
    return false;
  }
  
  console.log('✅ Server is running');
  console.log('Running smoke test...\n');
  
  let allPassed = true;
  
  for (const endpoint of endpoints) {
    const url = `${config.url}${endpoint.path}`;
    
    try {
      const result = await autocannon({
        url,
        method: endpoint.method,
        duration: 1,
        connections: 1,
        pipelining: 1,
        bailout: 5,
      });
      
      const errors = result.errors;
      const status200 = result.statusCodeStats?.['200'] || 0;
      const total = result.requests.total;
      const latency = result.latency.average;
      
      if (errors > 0 || status200 === 0) {
        allPassed = false;
        console.log(`❌ ${endpoint.path} - Failed (${errors} errors, ${status200}/${total} 200s)`);
      } else {
        console.log(`✅ ${endpoint.path} - ${latency.toFixed(0)}ms avg (${status200}/${total} 200s)`);
      }
    } catch (err) {
      allPassed = false;
      console.log(`❌ ${endpoint.path} - Error: ${err.message}`);
    }
  }
  
  console.log('');
  console.log(allPassed ? '✅ Smoke test PASSED' : '❌ Smoke test FAILED');
  return allPassed;
}

async function runLoadTest() {
  console.log('Running load test...\n');
  
  // Pick random endpoint for load test
  const endpoint = endpoints[Math.floor(Math.random() * endpoints.length)];
  const url = `${config.url}${endpoint.path}`;
  
  console.log(`Target: ${endpoint.path}`);
  console.log('Starting...\n');
  
  const result = await autocannon({
    url,
    method: endpoint.method,
    duration: config.duration,
    connections: config.connections,
    amount: config.requests,
    pipelining: 1,
    printProgress: true,
  });
  
  console.log('\n📊 Results');
  console.log(`   Requests/sec: ${result.requests.average.toFixed(2)}`);
  console.log(`   Latency (avg): ${result.latency.average.toFixed(2)}ms`);
  console.log(`   Latency (p99): ${result.latency.p99.toFixed(2)}ms`);
  console.log(`   Total requests: ${result.requests.sent}`);
  console.log(`   Errors: ${result.errors}`);
  console.log(`   Timeouts: ${result.timeouts}`);
  
  const success = result.errors === 0 && result.latency.p99 < 1000;
  console.log('');
  console.log(success ? '✅ Load test PASSED' : '❌ Load test FAILED');
  
  return success;
}

async function main() {
  // First run smoke test
  const smokePassed = await runSmokeTest();
  
  if (!smokePassed) {
    console.log('\n⚠️  Smoke test failed, skipping load test');
    process.exit(1);
  }
  
  // Then run load test
  const loadPassed = await runLoadTest();
  
  process.exit(loadPassed ? 0 : 1);
}

main().catch(err => {
  console.error('Fatal error:', err);
  process.exit(1);
});
