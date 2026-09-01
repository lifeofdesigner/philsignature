# ADR 006: Multi-Gateway Payment Configuration

## Status
Accepted

## Context
Luxury retail in Nigeria and international markets requires versatile payment channels: Paystack, Flutterwave, Direct Bank Transfer, and Cash on Delivery. Store managers must be able to toggle gateways on/off from the Admin settings without redeploying code.

## Decision
1. Persist gateway configurations (enabled/disabled status, public keys, bank account details) in the `site_settings` table.
2. The checkout flow dynamically renders only active gateways.
3. Successful card payments trigger webhooks/verification before transitioning order status to `paid`.
4. Bank Transfer orders are marked `pending` until administrative approval.

## Consequences
- Dynamic store adaptability without code deployments.
- Full support for traditional and electronic luxury transactions.

