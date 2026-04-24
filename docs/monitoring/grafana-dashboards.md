# Grafana Business Dashboards

This document describes the recommended Grafana dashboards for monitoring EcoChain's business metrics.

## Dashboard 1: User Engagement

**Title:** User Engagement Overview

**Panels:**

1. **Active Users (7d)**
   - Type: Stat
   - Query: `sum by (status) (increase(ecochain_users_total[7d]))`
   - Description: Number of active users in the last 7 days

2. **User Growth Rate**
   - Type: Graph
   - Query: `rate(ecochain_users_total[1h])`
   - Description: User acquisition rate over time

3. **User Retention (Cohort)**
   - Type: Heatmap
   - Query: `ecochain_user_retention_cohort`
   - Description: User retention by signup cohort

4. **Task Completion Rate**
   - Type: Gauge
   - Query: `sum(ecochain_tasks_completed) / sum(ecochain_tasks_started) * 100`
   - Description: Percentage of tasks completed vs started

5. **Daily Active Users**
   - Type: Time Series
   - Query: `increase(ecochain_daily_active_users[1d])`
   - Description: Daily active users over time

## Dashboard 2: Staking & Governance

**Title:** Staking & Governance Metrics

**Panels:**

1. **Total Staked ECO**
   - Type: Stat
   - Query: `ecochain_total_staked`
   - Description: Total ECO tokens staked

2. **Staking Distribution**
   - Type: Pie Chart
   - Query: `sum by (duration_tier) (ecochain_stakes_by_tier)`
   - Description: Stakes by duration tier (30d, 90d, 180d, 365d)

3. **Governance Participation**
   - Type: Graph
   - Query: `rate(ecochain_votes_cast[1h])`
   - Description: Voting activity over time

4. **Proposal Outcomes**
   - Type: Bar Chart
   - Query: `sum by (outcome) (ecochain_proposals_completed)`
   - Description: Passed vs failed proposals

5. **Stake APR**
   - Type: Stat
   - Query: `ecochain_stake_apr`
   - Description: Current annual percentage rate for staking

## Dashboard 3: Bridge Operations

**Title:** Cross-Chain Bridge Metrics

**Panels:**

1. **Bridge Volume (24h)**
   - Type: Stat
   - Query: `sum(increase(ecochain_bridge_volume[24h]))`
   - Description: Total bridged volume in last 24 hours

2. **Bridge Transactions**
   - Type: Time Series
   - Query: `rate(ecochain_bridge_transactions[5m])`
   - Description: Bridge transaction rate

3. **Bridge Success Rate**
   - Type: Gauge
   - Query: `sum(ecochain_bridge_success) / sum(ecochain_bridge_total) * 100`
   - Description: Percentage of successful bridge transactions

4. **Bridge Latency**
   - Type: Graph
   - Query: `histogram_quantile(0.95, rate(ecochain_bridge_latency_bucket[5m]))`
   - Description: 95th percentile bridge completion time

5. **Chain Distribution**
   - Type: Bar Chart
   - Query: `sum by (chain) (ecochain_bridge_volume)`
   - Description: Volume by destination chain

## Dashboard 4: Rewards & Incentives

**Title:** Rewards & Incentives

**Panels:**

1. **Total Rewards Distributed**
   - Type: Stat
   - Query: `sum(ecochain_rewards_distributed)`
   - Description: Total ECO tokens distributed as rewards

2. **Rewards Rate**
   - Type: Graph
   - Query: `rate(ecochain_rewards_distributed[1h])`
   - Description: Rewards distribution rate over time

3. **Rewards by Category**
   - Type: Pie Chart
   - Query: `sum by (category) (ecochain_rewards_by_category)`
   - Description: Rewards by task category

5. **Top Earners**
   - Type: Table
   - Query: `topk(10, sum by (user_id) (ecochain_rewards_earned))`
   - Description: Top 10 reward earners

6. **Claim Rate**
   - Type: Gauge
   - Query: `sum(ecochain_rewards_claimed) / sum(ecochain_rewards_earned) * 100`
   - Description: Percentage of rewards claimed

## Dashboard 5: System Health

**Title:** System Health & Performance

**Panels:**

1. **API Response Time (p95)**
   - Type: Graph
   - Query: `histogram_quantile(0.95, rate(http_request_duration_seconds_bucket[5m]))`
   - Description: 95th percentile API response time

2. **Error Rate**
   - Type: Graph
   - Query: `rate(http_requests_total{status=~"5.."}[5m]) / rate(http_requests_total[5m]) * 100`
   - Description: Percentage of 5xx errors

3. **Database Connection Pool**
   - Type: Gauge
   - Query: `pg_stat_activity_count / pg_settings_max_connections * 100`
   - Description: Database connection pool utilization

4. **Redis Hit Rate**
   - Type: Gauge
   - Query: `rate(redis_keyspace_hits[5m]) / (rate(redis_keyspace_hits[5m]) + rate(redis_keyspace_misses[5m])) * 100`
   - Description: Redis cache hit rate

5. **Oracle Signer Health**
   - Type: Stat
   - Query: `up{job="oracle-signer"}`
   - Description: Oracle signer service status

## Dashboard 6: Business KPIs

**Title:** Business KPIs

**Panels:**

1. **Total Value Locked (TVL)**
   - Type: Stat
   - Query: `ecochain_tvl`
   - Description: Total value locked in the protocol

2. **Monthly Recurring Revenue (MRR)**
   - Type: Stat
   - Query: `ecochain_mrr`
   - Description: Monthly recurring revenue from sponsors

3. **Cost per Acquisition (CPA)**
   - Type: Stat
   - Query: `ecochain_marketing_spend / increase(ecochain_users_total[30d])`
   - Description: Cost to acquire a new user

4. **Lifetime Value (LTV)**
   - Type: Stat
   - Query: `ecochain_avg_user_lifetime_value`
   - Description: Average lifetime value per user

5. **Churn Rate**
   - Type: Gauge
   - Query: `ecochain_churn_rate_30d`
   - Description: 30-day user churn rate

## Setup Instructions

1. **Import Dashboards**
   - Go to Grafana Cloud → Dashboards → Import
   - Copy the JSON configurations above
   - Paste and import

2. **Configure Data Sources**
   - Ensure Tempo (traces) and Prometheus/Loki (metrics/logs) are connected
   - Verify data source credentials

3. **Set Alerts**
   - Configure alert rules for critical thresholds
   - Set up notification channels (Slack, email, PagerDuty)

4. **Customize**
   - Adjust time ranges based on your needs
   - Add filters for specific environments (dev/staging/prod)
   - Customize panel thresholds and colors

## Alert Rules

Recommended alert thresholds:

- **API Error Rate > 1%** - Critical
- **API Response Time p95 > 2s** - Warning
- **Bridge Success Rate < 95%** - Critical
- **Oracle Signer Down** - Critical
- **Database Connection Pool > 80%** - Warning
- **User Churn Rate > 5%** - Warning
