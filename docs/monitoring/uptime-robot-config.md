# UptimeRobot Configuration

## Monitors to Create

### 1. Main Application
- **Type**: HTTP(s)
- **URL**: `https://your-domain.com`
- **Interval**: 5 minutes
- **Alert Contacts**: Email, Slack
- **Keywords**: "The Quiet Earth" (check for successful page load)

### 2. API Health Check
- **Type**: HTTP(s)
- **URL**: `https://your-domain.com/api/health`
- **Interval**: 1 minute
- **Alert Contacts**: Email, Slack, PagerDuty

### 3. Oracle Signer
- **Type**: HTTP(s)
- **URL**: `https://ecochain-oracle-signer.fly.dev/health`
- **Interval**: 1 minute
- **Alert Contacts**: Email, Slack

### 4. Database Connectivity
- **Type**: Port
- **URL**: `your-db-host:5432`
- **Interval**: 5 minutes
- **Alert Contacts**: Email

## Alert Configuration

### Critical Alerts (SMS + Slack)
- Main application down
- API health check failing
- Oracle signer down

### Warning Alerts (Email)
- Response time > 2s
- Database connectivity issues

## Setup Steps

1. Sign up at https://uptimerobot.com
2. Create monitors using the configurations above
3. Add alert contacts (email, Slack webhook)
4. Configure notification thresholds
5. Test each monitor
