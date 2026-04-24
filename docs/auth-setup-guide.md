# Authentication and Role Management Setup Guide

This guide explains how to set up and test the authentication system with Clerk, database sync, and role-based access control.

## Prerequisites

1. **Clerk Account**: You need a Clerk account at [clerk.com](https://clerk.com)
2. **Database**: PostgreSQL database configured in `.env`
3. **Environment Variables**: Clerk keys configured in `.env`

## Setup Steps

### 1. Configure Clerk Environment Variables

Add the following to your `.env` file:

```bash
# Clerk Authentication
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_...
CLERK_SECRET_KEY=sk_test_...

# Clerk Webhook (for user sync)
CLERK_WEBHOOK_SECRET=whsec_...
```

Get these values from:
- Clerk Dashboard → API Keys
- Clerk Dashboard → Webhooks → Create webhook → Signing Secret

### 2. Configure Clerk Webhook

1. Go to Clerk Dashboard → Webhooks
2. Create a new webhook with endpoint: `https://your-domain.com/api/webhooks/clerk`
3. Subscribe to events:
   - `user.created`
   - `user.updated`
   - `user.deleted`
4. Copy the webhook signing secret to `.env` as `CLERK_WEBHOOK_SECRET`

### 3. Run Database Migration

The schema has been updated with:
- `email` field on User model
- `deletedAt` field for soft deletes
- `SponsorRequest` model for sponsor applications

Run the migration:
```bash
npx prisma migrate dev
```

Or if already migrated:
```bash
npx prisma db push
```

## Admin Setup

### First User Becomes Admin

The first user who signs up via Clerk will automatically become an admin. This is handled by the webhook in `src/app/api/webhooks/clerk/route.ts`.

**Process:**
1. Sign up as a new user via Clerk
2. The webhook creates a User row in the database with `role: "admin"`
3. This user can now access `/admin` routes

### Manual Admin Assignment (Optional)

If the webhook already ran and the first user wasn't assigned admin role, you can manually set it:

1. Open Prisma Studio: `npx prisma studio`
2. Navigate to the User table
3. Find the user you want to make admin
4. Change their `role` field to `"admin"`

## Sponsor Onboarding Flow

### User Requests Sponsor Status

1. User navigates to `/sponsor-request`
2. Fills out the form with:
   - Business/Organization name
   - Contact information
   - Reason for sponsorship
3. Submits the request
4. Request is stored in `SponsorRequest` table with status `pending`

### Admin Reviews Sponsor Request

1. Admin navigates to `/admin/sponsors?filter=pending`
2. Sees list of pending sponsor requests
3. Clicks "Approve" or "Reject"
4. On approval:
   - `SponsorRequest` status changes to `approved`
   - User's `role` in User table changes to `sponsor`
5. User can now access `/sponsor` routes

### Sponsor Wallet Connection

1. After approval, when user tries to access `/sponsor`, they're redirected to `/wallet-connect`
2. User connects their Initia wallet using the wallet context
3. Wallet address is linked to their account via `/api/user/wallet`
4. User can now access sponsor features

## Testing Checklist

### Test Admin Access

- [ ] Sign up as first user via Clerk
- [ ] Verify User row created in Prisma Studio with `role: "admin"`
- [ ] Navigate to `/admin` - should work
- [ ] Navigate to `/admin/users` - should see user list
- [ ] Navigate to `/admin/sponsors` - should see sponsors page

### Test Sponsor Request Flow

- [ ] Sign up as a regular user (second user)
- [ ] Verify User row created with `role: "user"`
- [ ] Navigate to `/sponsor-request`
- [ ] Fill out and submit sponsor request form
- [ ] Verify `SponsorRequest` row created in Prisma Studio
- [ ] Try to access `/sponsor` - should redirect to dashboard (not sponsor yet)

### Test Admin Sponsor Approval

- [ ] As admin, navigate to `/admin/sponsors?filter=pending`
- [ ] See the pending request
- [ ] Click "Approve"
- [ ] Verify User role changed to `sponsor` in Prisma Studio
- [ ] Verify SponsorRequest status changed to `approved`

### Test Sponsor Wallet Connection

- [ ] As approved sponsor, navigate to `/sponsor`
- [ ] Should redirect to `/wallet-connect`
- [ ] Connect wallet using wallet button
- [ ] Click "Link Wallet to Account"
- [ ] Verify `initiaAddress` set in User table
- [ ] Navigate to `/sponsor` - should now work
- [ ] Access sponsor dashboard, analytics, tasks pages

### Test Webhook Sync

- [ ] Create a new user in Clerk Dashboard
- [ ] Check Prisma Studio - User row should appear automatically
- [ ] Update user email in Clerk Dashboard
- [ ] Check Prisma Studio - email should be updated
- [ ] Delete user in Clerk Dashboard
- [ ] Check Prisma Studio - `deletedAt` should be set

## Troubleshooting

### Webhook Not Syncing Users

**Problem:** Users created in Clerk don't appear in database

**Solutions:**
1. Check `CLERK_WEBHOOK_SECRET` is set correctly in `.env`
2. Verify webhook endpoint is accessible: `https://your-domain.com/api/webhooks/clerk`
3. Check Clerk Dashboard webhook logs for errors
4. Ensure webhook is subscribed to `user.created` event

### Sponsor Pages Not Accessible

**Problem:** Approved sponsor can't access `/sponsor` routes

**Solutions:**
1. Check User role is `"sponsor"` in Prisma Studio
2. Check `initiaAddress` is set in User table
3. Verify wallet is connected via `/wallet-connect`
4. Check browser console for errors

### Admin Pages Not Accessible

**Problem:** Can't access `/admin` routes

**Solutions:**
1. Verify User role is `"admin"` in Prisma Studio
2. Check you're signed in with the correct Clerk account
3. Clear browser cache and sign in again

## Security Notes

- **Never commit** real Clerk keys to git
- Use environment variables for all secrets
- Webhook signature verification prevents spoofing
- Role checks are enforced on both client and server
- Wallet addresses are unique per user to prevent conflicts
