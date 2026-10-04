const { chromium } = require('playwright-core');
const fs = require('fs');
const path = require('path');

const OUTPUT_DIR = path.join(__dirname, '..', 'video_assets', 'screenshots');

async function captureAdditional() {
  const browser = await chromium.launch({ channel: 'msedge', headless: true });
  const page = await browser.newPage({ viewport: { width: 1400, height: 900 }, deviceScaleFactor: 2 });

  // 1. Supabase Dashboard & RLS visual
  console.log('Rendering Supabase Studio Dashboard...');
  const supabaseHtml = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <link href="https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@500;700&family=Plus+Jakarta+Sans:wght@500;600;700;800&display=swap" rel="stylesheet">
      <style>
        * { box-sizing: border-box; margin: 0; padding: 0; }
        body {
          background: #121212;
          color: #EDEDED;
          font-family: 'Plus Jakarta Sans', sans-serif;
          padding: 30px;
          min-height: 100vh;
          display: flex;
          align-items: center;
          justify-content: center;
        }
        .container {
          width: 100%;
          background: #171717;
          border-radius: 12px;
          border: 1px solid #2E2E2E;
          box-shadow: 0 30px 60px rgba(0,0,0,0.8), 0 0 40px rgba(62, 207, 142, 0.1);
          overflow: hidden;
        }
        .nav {
          background: #1C1C1C;
          padding: 14px 24px;
          display: flex;
          align-items: center;
          justify-content: space-between;
          border-bottom: 1px solid #2E2E2E;
        }
        .logo-box {
          display: flex;
          align-items: center;
          gap: 12px;
        }
        .supa-icon {
          width: 24px;
          height: 24px;
          background: #3ECF8E;
          border-radius: 6px;
          display: flex;
          align-items: center;
          justify-content: center;
          color: #000;
          font-weight: 800;
          font-size: 14px;
        }
        .project-name { font-weight: 700; font-size: 15px; color: #FFFFFF; }
        .project-badge {
          background: rgba(62, 207, 142, 0.15);
          color: #3ECF8E;
          border: 1px solid rgba(62, 207, 142, 0.3);
          font-size: 11px;
          font-weight: 700;
          padding: 3px 10px;
          border-radius: 20px;
        }
        .content {
          padding: 24px 30px;
        }
        .sec-title {
          font-size: 18px;
          font-weight: 700;
          margin-bottom: 6px;
        }
        .sec-sub {
          font-size: 13px;
          color: #8E8E8E;
          margin-bottom: 20px;
        }
        table {
          width: 100%;
          border-collapse: collapse;
          font-family: 'JetBrains Mono', monospace;
          font-size: 13px;
        }
        th {
          text-align: left;
          padding: 12px 16px;
          background: #202020;
          color: #A0A0A0;
          font-weight: 600;
          font-size: 11px;
          letter-spacing: 1px;
          text-transform: uppercase;
          border-bottom: 1px solid #2E2E2E;
        }
        td {
          padding: 14px 16px;
          border-bottom: 1px solid #262626;
        }
        .t-name { color: #EDEDED; font-weight: 700; }
        .badge-rls {
          background: rgba(62, 207, 142, 0.12);
          color: #3ECF8E;
          border: 1px solid rgba(62, 207, 142, 0.4);
          padding: 3px 8px;
          border-radius: 4px;
          font-size: 11px;
          font-weight: 700;
          display: inline-flex;
          align-items: center;
          gap: 4px;
        }
        .badge-live {
          background: rgba(56, 189, 248, 0.12);
          color: #38BDF8;
          border: 1px solid rgba(56, 189, 248, 0.4);
          padding: 3px 8px;
          border-radius: 4px;
          font-size: 11px;
          font-weight: 700;
        }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="nav">
          <div class="logo-box">
            <div class="supa-icon">⚡</div>
            <div class="project-name">philz-signature-prod (PostgreSQL 15.1)</div>
            <div class="project-badge">ACTIVE PRODUCTION CLUSTER</div>
          </div>
          <div style="font-size: 12px; color: #3ECF8E; font-weight: 600;">● Realtime Engine Connected</div>
        </div>
        <div class="content">
          <div class="sec-title">Database Architecture & Security Policies</div>
          <div class="sec-sub">100% of production tables protected under Row-Level Security (RLS) policies</div>
          <table>
            <thead>
              <tr>
                <th>Schema Table</th>
                <th>Security Policy</th>
                <th>Realtime Status</th>
                <th>Access Control</th>
                <th>Encryption</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td class="t-name">public.orders</td>
                <td><span class="badge-rls">🔒 RLS ENABLED (4 Policies)</span></td>
                <td><span class="badge-live">● LISTEN / NOTIFY</span></td>
                <td style="color: #F87171;">Customer Auth / Super Admin</td>
                <td style="color: #3ECF8E;">AES-256 GCM</td>
              </tr>
              <tr>
                <td class="t-name">public.payment_records</td>
                <td><span class="badge-rls">🔒 RLS ENABLED (3 Policies)</span></td>
                <td><span class="badge-live">● REPLICATION ACTIVE</span></td>
                <td style="color: #F87171;">Service Role / Super Admin Only</td>
                <td style="color: #3ECF8E;">AES-256 GCM</td>
              </tr>
              <tr>
                <td class="t-name">public.profiles</td>
                <td><span class="badge-rls">🔒 RLS ENABLED (5 Policies)</span></td>
                <td><span class="badge-live">● REALTIME SYNC</span></td>
                <td style="color: #FBBF24;">Owner Edit / RBAC Protected</td>
                <td style="color: #3ECF8E;">AES-256 GCM</td>
              </tr>
              <tr>
                <td class="t-name">public.products</td>
                <td><span class="badge-rls">🔒 RLS ENABLED (2 Policies)</span></td>
                <td><span class="badge-live">● REALTIME SYNC</span></td>
                <td style="color: #60A5FA;">Public Read / Staff Write</td>
                <td style="color: #3ECF8E;">AES-256 GCM</td>
              </tr>
              <tr>
                <td class="t-name">public.payment_gateway_configs</td>
                <td><span class="badge-rls">🔒 RLS ENABLED (Strict)</span></td>
                <td><span class="badge-live">● SYSTEM VAULT</span></td>
                <td style="color: #EF4444;">SUPER ADMIN EXCLUSIVE WRITE</td>
                <td style="color: #3ECF8E;">KMS Vault Encrypted</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </body>
    </html>
  `;
  await page.setContent(supabaseHtml);
  await page.waitForTimeout(600);
  await page.screenshot({ path: path.join(OUTPUT_DIR, '17_supabase_dashboard_schema.png') });

  // 2. Security Auth & Realtime Notifications Event Log
  console.log('Rendering Security & Realtime Events...');
  const securityHtml = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <link href="https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@400;600;700&family=Plus+Jakarta+Sans:wght@600;700;800&display=swap" rel="stylesheet">
      <style>
        * { box-sizing: border-box; margin: 0; padding: 0; }
        body {
          background: #090B0E;
          color: #E2E8F0;
          font-family: 'JetBrains Mono', monospace;
          padding: 30px;
          min-height: 100vh;
          display: flex;
          align-items: center;
          justify-content: center;
        }
        .card {
          width: 100%;
          background: #0F1319;
          border-radius: 12px;
          border: 1px solid #1E293B;
          box-shadow: 0 30px 60px rgba(0,0,0,0.8), 0 0 40px rgba(239, 68, 68, 0.1);
          overflow: hidden;
        }
        .header {
          background: #141A23;
          padding: 16px 24px;
          display: flex;
          align-items: center;
          justify-content: space-between;
          border-bottom: 1px solid #1E293B;
        }
        .title {
          font-family: 'Plus Jakarta Sans', sans-serif;
          font-weight: 800;
          font-size: 16px;
          color: #F8FAFC;
          display: flex;
          align-items: center;
          gap: 10px;
        }
        .shield { color: #38BDF8; font-size: 20px; }
        .log-box {
          padding: 24px;
          display: flex;
          flex-direction: column;
          gap: 12px;
        }
        .log-line {
          background: #141A23;
          border: 1px solid #242E3D;
          padding: 12px 18px;
          border-radius: 8px;
          display: flex;
          align-items: center;
          justify-content: space-between;
          font-size: 13px;
        }
        .tag-success { color: #34D399; font-weight: 700; }
        .tag-sec { color: #F87171; font-weight: 700; }
        .tag-info { color: #38BDF8; font-weight: 700; }
        .time { color: #64748B; font-size: 12px; }
      </style>
    </head>
    <body>
      <div class="card">
        <div class="header">
          <div class="title">
            <span class="shield">🛡️</span>
            <span>ENTERPRISE SECURITY & DISPATCH MONITOR</span>
          </div>
          <div style="font-size: 12px; color: #34D399; font-weight: 700;">● ZERO SECURITY BREACHES</div>
        </div>
        <div class="log-box">
          <div class="log-line">
            <div>
              <span class="tag-sec">[AUTH GUARD]</span>
              <span style="color: #F1F5F9; margin-left: 10px;">Staff 2FA Verification Enforced &bull; OTP Verified via Session Auth</span>
            </div>
            <span class="time">12:54:02.108</span>
          </div>
          <div class="log-line">
            <div>
              <span class="tag-sec">[SECURITY]</span>
              <span style="color: #F1F5F9; margin-left: 10px;">RLS Policy Enforced: Blocked unauthorized role escalation attempt</span>
            </div>
            <span class="time">12:54:08.441</span>
          </div>
          <div class="log-line">
            <div>
              <span class="tag-info">[WEBHOOK]</span>
              <span style="color: #F1F5F9; margin-left: 10px;">Paystack HMAC-SHA512 Verified &bull; Ref #T482910398 &bull; ₦160,875.00</span>
            </div>
            <span class="time">12:54:15.820</span>
          </div>
          <div class="log-line">
            <div>
              <span class="tag-success">[EMAIL DISPATCH]</span>
              <span style="color: #F1F5F9; margin-left: 10px;">Dispatched 'ORDER_CONFIRMATION' &bull; 20 Branded Templates Active</span>
            </div>
            <span class="time">12:54:16.102</span>
          </div>
          <div class="log-line">
            <div>
              <span class="tag-success">[DATABASE]</span>
              <span style="color: #F1F5F9; margin-left: 10px;">Inventory Atomically Decremented &bull; Stock Hold Released to Fulfill</span>
            </div>
            <span class="time">12:54:16.290</span>
          </div>
        </div>
      </div>
    </body>
    </html>
  `;
  await page.setContent(securityHtml);
  await page.waitForTimeout(600);
  await page.screenshot({ path: path.join(OUTPUT_DIR, '18_security_auth_audit_logs.png') });

  // 3. Tax Engine & 3 Payment Gateways Detail
  console.log('Rendering Tax Engine & Multi-Gateway Breakdown...');
  const taxHtml = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@500;600;700;800&family=Cinzel:wght@700&display=swap" rel="stylesheet">
      <style>
        * { box-sizing: border-box; margin: 0; padding: 0; }
        body {
          background: #090B0E;
          color: #E2E8F0;
          font-family: 'Plus Jakarta Sans', sans-serif;
          padding: 30px;
          min-height: 100vh;
          display: flex;
          align-items: center;
          justify-content: center;
        }
        .card {
          width: 100%;
          max-width: 900px;
          background: #11151D;
          border-radius: 14px;
          border: 1px solid rgba(212, 175, 55, 0.35);
          box-shadow: 0 30px 60px rgba(0,0,0,0.8), 0 0 40px rgba(212, 175, 55, 0.15);
          padding: 32px;
        }
        .header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          border-bottom: 1px solid #1E293B;
          padding-bottom: 20px;
          margin-bottom: 24px;
        }
        .title {
          font-family: 'Cinzel', serif;
          color: #E5C07B;
          font-size: 22px;
          font-weight: 700;
          letter-spacing: 2px;
        }
        .grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 24px;
        }
        .box {
          background: #161D27;
          border: 1px solid #232E3F;
          border-radius: 10px;
          padding: 20px;
        }
        .box-title {
          font-size: 13px;
          color: #94A3B8;
          text-transform: uppercase;
          letter-spacing: 1px;
          font-weight: 700;
          margin-bottom: 14px;
        }
        .line {
          display: flex;
          justify-content: space-between;
          margin-bottom: 10px;
          font-size: 14px;
        }
        .line.bold {
          font-weight: 700;
          font-size: 17px;
          color: #F8FAFC;
          border-top: 1px solid #2E3E54;
          padding-top: 12px;
          margin-top: 12px;
        }
        .gateway-card {
          display: flex;
          align-items: center;
          justify-content: space-between;
          background: #11151D;
          border: 1px solid #263347;
          padding: 12px 16px;
          border-radius: 8px;
          margin-bottom: 10px;
        }
        .gw-name { font-weight: 700; font-size: 14px; color: #F1F5F9; }
        .gw-badge {
          font-size: 11px;
          font-weight: 700;
          padding: 2px 8px;
          border-radius: 20px;
        }
        .gw-active { background: rgba(56, 189, 248, 0.15); color: #38BDF8; }
        .gw-standby { background: rgba(148, 163, 184, 0.15); color: #94A3B8; }
      </style>
    </head>
    <body>
      <div class="card">
        <div class="header">
          <div class="title">PHILZ SIGNATURE CHECKOUT ARCHITECTURE</div>
          <div style="font-size: 12px; color: #E5C07B; font-weight: 700; border: 1px solid #E5C07B; padding: 4px 12px; border-radius: 20px;">
            ENTERPRISE FINANCIAL PIPELINE
          </div>
        </div>
        <div class="grid">
          <div class="box">
            <div class="box-title">⚡ REAL-TIME TAX ENGINE (AUTOMATED VAT)</div>
            <div class="line"><span>Subtotal (Artisanal Catalog)</span><span>₦145,000.00</span></div>
            <div class="line"><span>Applicable Tax Standard</span><span style="color: #38BDF8;">Nigerian VAT (7.5%)</span></div>
            <div class="line"><span>Calculated Tax Surcharge</span><span style="color: #E5C07B;">₦10,875.00</span></div>
            <div class="line"><span>White-Glove Luxury Delivery</span><span>₦5,000.00</span></div>
            <div class="line bold"><span>Authorized Settlement</span><span style="color: #E5C07B;">₦160,875.00</span></div>
          </div>
          <div class="box">
            <div class="box-title">💳 3 PAYMENT GATEWAYS (REDUNDANT FAILOVER)</div>
            <div class="gateway-card">
              <span class="gw-name">1. Paystack</span>
              <span class="gw-badge gw-active">PRIMARY GATEWAY ✓</span>
            </div>
            <div class="gateway-card">
              <span class="gw-name">2. Flutterwave</span>
              <span class="gw-badge gw-standby">AUTOMATIC FAILOVER</span>
            </div>
            <div class="gateway-card">
              <span class="gw-name">3. Korapay</span>
              <span class="gw-badge gw-standby">DIRECT BANK TRANSFER</span>
            </div>
          </div>
        </div>
      </div>
    </body>
    </html>
  `;
  await page.setContent(taxHtml);
  await page.waitForTimeout(600);
  await page.screenshot({ path: path.join(OUTPUT_DIR, '19_tax_engine_breakdown_detail.png') });

  // 4. Call To Action Card (cubadev.com.ng)
  console.log('Rendering Cuba Dev Call To Action Card...');
  const ctaHtml = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <link href="https://fonts.googleapis.com/css2?family=Cinzel:wght@600;700;800;900&family=Plus+Jakarta+Sans:wght@500;600;700;800&display=swap" rel="stylesheet">
      <style>
        * { box-sizing: border-box; margin: 0; padding: 0; }
        body {
          background: #060709;
          color: #FFFFFF;
          font-family: 'Plus Jakarta Sans', sans-serif;
          padding: 40px;
          min-height: 100vh;
          display: flex;
          align-items: center;
          justify-content: center;
        }
        .cta-card {
          width: 100%;
          max-width: 860px;
          background: radial-gradient(circle at 50% 30%, #161B26 0%, #0A0D14 100%);
          border-radius: 20px;
          border: 1px solid rgba(212, 175, 55, 0.4);
          box-shadow: 0 40px 100px rgba(0,0,0,0.9), 0 0 80px rgba(212, 175, 55, 0.2);
          padding: 60px 40px;
          text-align: center;
        }
        .agency-pill {
          display: inline-block;
          padding: 6px 18px;
          background: rgba(212, 175, 55, 0.12);
          border: 1px solid rgba(212, 175, 55, 0.4);
          color: #E5C07B;
          border-radius: 30px;
          font-size: 13px;
          font-weight: 700;
          letter-spacing: 2px;
          text-transform: uppercase;
          margin-bottom: 24px;
        }
        .main-heading {
          font-family: 'Cinzel', serif;
          font-size: 38px;
          font-weight: 800;
          letter-spacing: 2px;
          color: #F8FAFC;
          line-height: 1.25;
          margin-bottom: 16px;
        }
        .gold-url {
          font-size: 44px;
          font-weight: 800;
          background: linear-gradient(135deg, #FDE047 0%, #D4AF37 50%, #B45309 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          letter-spacing: 1px;
          margin-bottom: 24px;
          font-family: 'Cinzel', serif;
        }
        .sub-desc {
          font-size: 17px;
          color: #94A3B8;
          max-width: 580px;
          margin: 0 auto 36px;
          line-height: 1.6;
        }
        .tags {
          display: flex;
          justify-content: center;
          gap: 16px;
        }
        .tag {
          background: #141A24;
          border: 1px solid #283548;
          padding: 10px 20px;
          border-radius: 8px;
          font-size: 13px;
          color: #CBD5E1;
          font-weight: 600;
        }
      </style>
    </head>
    <body>
      <div class="cta-card">
        <div class="agency-pill">⚡ FULL-STACK LUXURY SOFTWARE ENGINEERING</div>
        <div class="main-heading">Need Something Built Like This?</div>
        <div class="gold-url">cubadev.com.ng</div>
        <div class="sub-desc">
          We architect bespoke, ultra-fast e-commerce platforms, custom web apps, and enterprise systems engineered for massive conversion and bulletproof security.
        </div>
        <div class="tags">
          <div class="tag">✦ Custom E-Commerce</div>
          <div class="tag">✦ React & Supabase</div>
          <div class="tag">✦ Enterprise Security</div>
          <div class="tag">✦ Payment Infrastructure</div>
        </div>
      </div>
    </body>
    </html>
  `;
  await page.setContent(ctaHtml);
  await page.waitForTimeout(600);
  await page.screenshot({ path: path.join(OUTPUT_DIR, '20_cta_cubadev_luxury.png') });

  await browser.close();
  console.log('Additional screenshots captured successfully!');
}

captureAdditional().catch(err => {
  console.error(err);
  process.exit(1);
});
