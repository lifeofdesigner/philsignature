const { chromium } = require('playwright-core');
const fs = require('fs');
const path = require('path');

const OUTPUT_DIR = path.join(__dirname, '..', 'video_assets', 'screenshots');
if (!fs.existsSync(OUTPUT_DIR)) {
  fs.mkdirSync(OUTPUT_DIR, { recursive: true });
}

async function capture() {
  console.log('Launching browser to capture high-res video assets...');
  const browser = await chromium.launch({
    channel: 'msedge',
    headless: true
  });

  try {
    // 1. Desktop Storefront
    const desktopContext = await browser.newContext({
      viewport: { width: 1920, height: 1080 },
      deviceScaleFactor: 2
    });
    const desktopPage = await desktopContext.newPage();

    console.log('Capturing Desktop Home...');
    await desktopPage.goto('http://localhost:4173', { waitUntil: 'domcontentloaded' });
    await desktopPage.waitForTimeout(3000);
    await desktopPage.screenshot({
      path: path.join(OUTPUT_DIR, '01_live_homepage_desktop.png'),
      fullPage: false
    });

    console.log('Capturing Desktop Shop...');
    await desktopPage.goto('http://localhost:4173/shop', { waitUntil: 'domcontentloaded' });
    await desktopPage.waitForTimeout(2500);
    await desktopPage.screenshot({
      path: path.join(OUTPUT_DIR, '03_live_shop_desktop.png'),
      fullPage: false
    });

    console.log('Capturing Desktop Collections...');
    await desktopPage.goto('http://localhost:4173/collections', { waitUntil: 'domcontentloaded' });
    await desktopPage.waitForTimeout(2500);
    await desktopPage.screenshot({
      path: path.join(OUTPUT_DIR, '04_live_collections_desktop.png'),
      fullPage: false
    });

    console.log('Capturing Desktop Checkout...');
    await desktopPage.goto('http://localhost:4173/checkout', { waitUntil: 'domcontentloaded' });
    await desktopPage.waitForTimeout(2500);
    await desktopPage.screenshot({
      path: path.join(OUTPUT_DIR, '05_live_checkout_desktop.png'),
      fullPage: false
    });

    await desktopContext.close();

    // 2. Mobile Storefront
    const mobileContext = await browser.newContext({
      viewport: { width: 414, height: 896 },
      deviceScaleFactor: 2,
      isMobile: true,
      hasTouch: true
    });
    const mobilePage = await mobileContext.newPage();

    console.log('Capturing Mobile Home...');
    await mobilePage.goto('http://localhost:4173', { waitUntil: 'domcontentloaded' });
    await mobilePage.waitForTimeout(3000);
    await mobilePage.screenshot({
      path: path.join(OUTPUT_DIR, '02_live_homepage_mobile.png'),
      fullPage: false
    });

    console.log('Capturing Mobile Shop...');
    await mobilePage.goto('http://localhost:4173/shop', { waitUntil: 'domcontentloaded' });
    await mobilePage.waitForTimeout(2500);
    await mobilePage.screenshot({
      path: path.join(OUTPUT_DIR, '15_mobile_storefront_shop.png'),
      fullPage: false
    });

    await mobileContext.close();

    // 3. Render High-Tech Dark VS Code IDE Views for Actual Code
    const codePage = await browser.newPage({
      viewport: { width: 1400, height: 900 },
      deviceScaleFactor: 2
    });

    const renderCodeHtml = (filename, language, codeSnippet, badge = 'PRODUCTION READY') => `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <link href="https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@400;600;700&family=Cinzel:wght@700&family=Plus+Jakarta+Sans:wght@500;700&display=swap" rel="stylesheet">
        <style>
          * { box-sizing: border-box; margin: 0; padding: 0; }
          body {
            background: #0B0E14;
            color: #E6EDF3;
            font-family: 'JetBrains Mono', monospace;
            padding: 30px;
            display: flex;
            align-items: center;
            justify-content: center;
            min-height: 100vh;
          }
          .window {
            width: 100%;
            background: #0D1117;
            border-radius: 14px;
            border: 1px solid #30363D;
            box-shadow: 0 25px 60px rgba(0,0,0,0.8), 0 0 40px rgba(212, 175, 55, 0.1);
            overflow: hidden;
          }
          .titlebar {
            background: #161B22;
            padding: 14px 20px;
            display: flex;
            align-items: center;
            justify-content: space-between;
            border-bottom: 1px solid #21262D;
          }
          .dots {
            display: flex;
            gap: 8px;
          }
          .dot {
            width: 12px;
            height: 12px;
            border-radius: 50%;
          }
          .red { background: #FF5F56; }
          .yellow { background: #FFBD2E; }
          .green { background: #27C93F; }
          .file-tab {
            display: flex;
            align-items: center;
            gap: 8px;
            font-size: 13px;
            color: #C9D1D9;
            font-family: 'Plus Jakarta Sans', sans-serif;
            font-weight: 600;
          }
          .badge {
            background: rgba(212, 175, 55, 0.15);
            color: #D4AF37;
            border: 1px solid rgba(212, 175, 55, 0.4);
            padding: 4px 10px;
            border-radius: 20px;
            font-size: 11px;
            font-weight: 700;
            letter-spacing: 1px;
            text-transform: uppercase;
          }
          pre {
            padding: 24px 28px;
            font-size: 14px;
            line-height: 1.65;
            overflow: hidden;
            color: #E6EDF3;
          }
          .kw { color: #FF7B72; font-weight: 600; }
          .fn { color: #D2A8FF; }
          .str { color: #A5D6FF; }
          .comment { color: #8B949E; font-style: italic; }
          .type { color: #FFA657; }
          .num { color: #79C0FF; }
          .gold { color: #E5C07B; }
          .status-bar {
            background: #161B22;
            padding: 8px 20px;
            font-size: 11px;
            color: #8B949E;
            display: flex;
            justify-content: space-between;
            border-top: 1px solid #21262D;
          }
        </style>
      </head>
      <body>
        <div class="window">
          <div class="titlebar">
            <div class="dots">
              <div class="dot red"></div>
              <div class="dot yellow"></div>
              <div class="dot green"></div>
            </div>
            <div class="file-tab">
              <span>⚡ philz-signature /</span>
              <span style="color: #58A6FF;">${filename}</span>
            </div>
            <div class="badge">${badge}</div>
          </div>
          <pre><code>${codeSnippet}</code></pre>
          <div class="status-bar">
            <span>UTF-8  •  ${language}  •  Git: main ✓</span>
            <span>Philz Signature Core Engine</span>
          </div>
        </div>
      </body>
      </html>
    `;

    // Code 1: React Component & Architecture
    console.log('Capturing VS Code React snippet...');
    const reactCode = `
<span class="comment">// src/features/checkout/pages/CheckoutPage.tsx</span>
<span class="kw">export const</span> <span class="fn">CheckoutPage</span>: <span class="type">React.FC</span> = () =&gt; {
  <span class="kw">const</span> { cart, subtotal, taxAmount, shippingFee, total } = <span class="fn">useCheckoutEngine</span>();
  <span class="kw">const</span> { gateway, initiatePayment, isProcessing } = <span class="fn">usePaymentGateways</span>();
  <span class="kw">const</span> [taxBreakdown, setTaxBreakdown] = <span class="fn">useState</span>&lt;<span class="type">TaxQuote</span>&gt;();

  <span class="kw">const</span> <span class="fn">handleOrderPlacement</span> = <span class="kw">async</span> (orderPayload: <span class="type">OrderPayload</span>) =&gt; {
    <span class="comment">// 1. Atomic Order Creation via Supabase Transaction</span>
    <span class="kw">const</span> order = <span class="kw">await</span> orderService.<span class="fn">createOrderWithHold</span>(orderPayload);

    <span class="comment">// 2. Dynamic Gateway Handoff (Paystack / Flutterwave / Korapay)</span>
    <span class="kw">const</span> transaction = <span class="kw">await</span> <span class="fn">initiatePayment</span>({
      orderId: order.id,
      amountInNaira: total,
      gateway: gateway.preferred, <span class="comment">// Failover enabled</span>
      customer: order.customerEmail
    });

    <span class="kw">return</span> transaction.<span class="fn">openPaymentModal</span>();
  };
};`;
    await codePage.setContent(renderCodeHtml('src/features/checkout/CheckoutPage.tsx', 'TypeScript React', reactCode, 'REACT 19 + VITE'));
    await codePage.waitForTimeout(600);
    await codePage.screenshot({ path: path.join(OUTPUT_DIR, '06_vscode_react_stack.png') });

    // Code 2: Supabase Security & RLS
    console.log('Capturing VS Code Supabase RLS snippet...');
    const rlsCode = `
<span class="comment">-- supabase/migrations/002_security_rls.sql</span>
<span class="comment">-- STRICT ZERO-TRUST ROW LEVEL SECURITY ARCHITECTURE</span>

<span class="kw">ALTER TABLE</span> <span class="type">public.orders</span> <span class="kw">ENABLE ROW LEVEL SECURITY</span>;
<span class="kw">ALTER TABLE</span> <span class="type">public.payment_records</span> <span class="kw">ENABLE ROW LEVEL SECURITY</span>;

<span class="comment">-- Allow verified customers to view only their own orders</span>
<span class="kw">CREATE POLICY</span> <span class="str">"orders_customer_select"</span>
<span class="kw">ON</span> <span class="type">public.orders</span> <span class="kw">FOR SELECT</span>
<span class="kw">USING</span> (
  <span class="fn">auth.uid</span>() = customer_id 
  <span class="kw">OR</span> <span class="fn">is_admin_or_super_admin</span>(<span class="fn">auth.uid</span>())
);

<span class="comment">-- Super Admin exclusive write policy for payment gateway keys</span>
<span class="kw">CREATE POLICY</span> <span class="str">"payment_secrets_super_admin_only"</span>
<span class="kw">ON</span> <span class="type">public.payment_gateway_configs</span> <span class="kw">FOR ALL</span>
<span class="kw">USING</span> (
  <span class="kw">EXISTS</span> (
    <span class="kw">SELECT</span> <span class="num">1</span> <span class="kw">FROM</span> <span class="type">public.profiles</span>
    <span class="kw">WHERE</span> id = <span class="fn">auth.uid</span>() <span class="kw">AND</span> role = <span class="str">'super_admin'</span>
  )
);`;
    await codePage.setContent(renderCodeHtml('supabase/migrations/002_security_rls.sql', 'PostgreSQL / Supabase', rlsCode, 'ENTERPRISE RLS'));
    await codePage.waitForTimeout(600);
    await codePage.screenshot({ path: path.join(OUTPUT_DIR, '07_vscode_supabase_rls.png') });

    // Code 3: Transactional Email Engine
    console.log('Capturing VS Code Email Service snippet...');
    const emailCode = `
<span class="comment">// api/_lib/emailService.ts</span>
<span class="kw">export const</span> <span class="fn">dispatchOrderConfirmationEmail</span> = <span class="kw">async</span> (order: <span class="type">OrderEmailData</span>) =&gt; {
  <span class="kw">const</span> template = <span class="fn">getLuxuryEmailWrapper</span>({
    brand: <span class="str">'Philz Signature'</span>,
    tagline: <span class="str">'Haute Parfumerie & Pure Luxury'</span>,
    heading: <span class="str">\`Order Confirmed #\${order.order_number}\`</span>,
    content: <span class="fn">renderOrderSummaryHtml</span>({
      items: order.items,
      subtotal: <span class="fn">formatNaira</span>(order.subtotal),
      tax: <span class="fn">formatNaira</span>(order.tax_amount), <span class="comment">// 7.5% Automated VAT</span>
      total: <span class="fn">formatNaira</span>(order.total_amount),
      trackingUrl: <span class="str">\`\${APP_URL}/track-order?ref=\${order.order_number}\`</span>
    })
  });

  <span class="kw">return</span> <span class="kw">await</span> emailProvider.<span class="fn">sendTransactional</span>({
    to: order.email,
    subject: <span class="str">\`✨ Your Philz Signature Order Has Been Confirmed (#\${order.order_number})\`</span>,
    html: template,
    priority: <span class="str">'high'</span>
  });
};`;
    await codePage.setContent(renderCodeHtml('api/_lib/emailService.ts', 'TypeScript / Node.js', emailCode, '20 LUXURY EMAILS'));
    await codePage.waitForTimeout(600);
    await codePage.screenshot({ path: path.join(OUTPUT_DIR, '08_vscode_email_engine.png') });

    // Code 4: Paystack Multi-Gateway Webhook
    console.log('Capturing VS Code Paystack Webhook snippet...');
    const paystackCode = `
<span class="comment">// api/payments/paystack/webhook.ts</span>
<span class="kw">export default async function</span> <span class="fn">handler</span>(req: <span class="type">VercelRequest</span>, res: <span class="type">VercelResponse</span>) {
  <span class="kw">const</span> signature = req.headers[<span class="str">'x-paystack-signature'</span>];
  
  <span class="comment">// 1. HMAC-SHA512 Cryptographic Signature Verification</span>
  <span class="kw">const</span> isValid = <span class="fn">verifyHmacSha512</span>(req.rawBody, process.env.PAYSTACK_SECRET_KEY, signature);
  <span class="kw">if</span> (!isValid) <span class="kw">return</span> res.<span class="fn">status</span>(<span class="num">401</span>).<span class="fn">json</span>({ error: <span class="str">'Invalid webhook signature'</span> });

  <span class="kw">const</span> { event, data } = req.body;
  <span class="kw">if</span> (event === <span class="str">'charge.success'</span>) {
    <span class="comment">// 2. Idempotent payment verification & stock decrement</span>
    <span class="kw">await</span> paymentProcessor.<span class="fn">confirmPaymentAndFulfill</span>({
      reference: data.reference,
      gateway: <span class="str">'PAYSTACK'</span>,
      amountKobo: data.amount
    });
  }
  <span class="kw">return</span> res.<span class="fn">status</span>(<span class="num">200</span>).<span class="fn">json</span>({ received: <span class="kw">true</span> });
}`;
    await codePage.setContent(renderCodeHtml('api/payments/paystack/webhook.ts', 'TypeScript', paystackCode, 'PAYSTACK GATEWAY'));
    await codePage.waitForTimeout(600);
    await codePage.screenshot({ path: path.join(OUTPUT_DIR, '09_vscode_paystack_gateway.png') });

    // 4. Render Luxury Email Template Preview
    console.log('Capturing Luxury Email Preview...');
    const emailTemplateHtml = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <link href="https://fonts.googleapis.com/css2?family=Cinzel:wght@600;700;800&family=Plus+Jakarta+Sans:wght@400;500;600;700&display=swap" rel="stylesheet">
        <style>
          * { box-sizing: border-box; margin: 0; padding: 0; }
          body {
            background: #080A0E;
            color: #E6EDF3;
            font-family: 'Plus Jakarta Sans', sans-serif;
            padding: 40px;
            display: flex;
            align-items: center;
            justify-content: center;
            min-height: 100vh;
          }
          .email-card {
            width: 100%;
            max-width: 620px;
            background: #10141D;
            border-radius: 16px;
            border: 1px solid rgba(212, 175, 55, 0.35);
            box-shadow: 0 30px 80px rgba(0,0,0,0.9), 0 0 50px rgba(212, 175, 55, 0.15);
            overflow: hidden;
          }
          .header {
            background: linear-gradient(180deg, #161D2A 0%, #10141D 100%);
            padding: 35px 30px 25px;
            text-align: center;
            border-bottom: 1px solid rgba(212, 175, 55, 0.2);
          }
          .brand-title {
            font-family: 'Cinzel', serif;
            font-size: 26px;
            letter-spacing: 5px;
            color: #E5C07B;
            text-transform: uppercase;
            margin-bottom: 6px;
            font-weight: 700;
          }
          .brand-subtitle {
            font-size: 11px;
            letter-spacing: 3px;
            color: #A0AEC0;
            text-transform: uppercase;
          }
          .badge-confirmed {
            display: inline-block;
            margin-top: 18px;
            padding: 6px 16px;
            background: rgba(39, 201, 63, 0.12);
            border: 1px solid rgba(39, 201, 63, 0.3);
            color: #4ADE80;
            border-radius: 30px;
            font-size: 12px;
            font-weight: 600;
            letter-spacing: 1px;
          }
          .body-content {
            padding: 30px;
          }
          .order-meta {
            display: flex;
            justify-content: space-between;
            padding-bottom: 18px;
            border-bottom: 1px solid #1E293B;
            margin-bottom: 20px;
          }
          .meta-label { font-size: 12px; color: #64748B; text-transform: uppercase; letter-spacing: 1px; }
          .meta-val { font-size: 15px; font-weight: 700; color: #F8FAFC; margin-top: 4px; }
          .item-row {
            display: flex;
            align-items: center;
            justify-content: space-between;
            padding: 14px 0;
            border-bottom: 1px solid #1E293B;
          }
          .item-name { font-size: 14px; font-weight: 600; color: #F1F5F9; }
          .item-sub { font-size: 12px; color: #94A3B8; }
          .item-price { font-size: 15px; font-weight: 700; color: #E5C07B; }
          .totals-table {
            margin-top: 20px;
            padding-top: 10px;
          }
          .tot-row {
            display: flex;
            justify-content: space-between;
            padding: 6px 0;
            font-size: 13px;
            color: #94A3B8;
          }
          .tot-row.grand {
            font-size: 18px;
            font-weight: 700;
            color: #F8FAFC;
            border-top: 1px solid #334155;
            padding-top: 12px;
            margin-top: 8px;
          }
          .btn-track {
            display: block;
            margin-top: 25px;
            text-align: center;
            background: linear-gradient(135deg, #D4AF37 0%, #AA820A 100%);
            color: #080A0E;
            padding: 14px 24px;
            border-radius: 8px;
            font-weight: 700;
            font-size: 14px;
            letter-spacing: 1.5px;
            text-transform: uppercase;
            text-decoration: none;
            box-shadow: 0 4px 20px rgba(212, 175, 55, 0.35);
          }
        </style>
      </head>
      <body>
        <div class="email-card">
          <div class="header">
            <div class="brand-title">Philz Signature</div>
            <div class="brand-subtitle">Haute Parfumerie & Pure Luxury</div>
            <div class="badge-confirmed">✓ ORDER CONFIRMED & DISPATCHED</div>
          </div>
          <div class="body-content">
            <div class="order-meta">
              <div>
                <div class="meta-label">Order Number</div>
                <div class="meta-val">#PS-88291-LUX</div>
              </div>
              <div style="text-align: right;">
                <div class="meta-label">Payment Gateway</div>
                <div class="meta-val" style="color: #38BDF8;">PAYSTACK VERIFIED</div>
              </div>
            </div>
            <div class="item-row">
              <div>
                <div class="item-name">Extrait de Parfum - Royal Oud Reserve</div>
                <div class="item-sub">100ml • Handcrafted Flacon (Qty: 1)</div>
              </div>
              <div class="item-price">₦95,000</div>
            </div>
            <div class="item-row">
              <div>
                <div class="item-name">Sandal Rose Scented Artisanal Candle</div>
                <div class="item-sub">300g • Pure Soy Wax (Qty: 2)</div>
              </div>
              <div class="item-price">₦50,000</div>
            </div>
            <div class="totals-table">
              <div class="tot-row"><span>Subtotal</span><span>₦145,000</span></div>
              <div class="tot-row"><span>Automated VAT (7.5%)</span><span>₦10,875</span></div>
              <div class="tot-row"><span>Express Concierge Courier</span><span>₦5,000</span></div>
              <div class="tot-row grand"><span>Total Paid</span><span style="color: #E5C07B;">₦160,875</span></div>
            </div>
            <div class="btn-track">Track Your Consignment Live</div>
          </div>
        </div>
      </body>
      </html>
    `;
    await codePage.setContent(emailTemplateHtml);
    await codePage.waitForTimeout(600);
    await codePage.screenshot({ path: path.join(OUTPUT_DIR, '10_luxury_email_preview.png') });

    await codePage.close();

    // 5. Copy over Admin CMS & QA Screenshots to ensure complete asset set
    const copyPairs = [
      ['admin-dashboard.png', '11_admin_cms_dashboard.png'],
      ['admin-products.png', '12_admin_products_management.png'],
      ['admin-orders.png', '13_admin_orders_realtime.png'],
      ['admin-payments.png', '14_admin_payment_settings.png'],
      ['responsive-mobile-home.png', '16_mobile_responsive_showcase.png']
    ];

    for (const [srcFile, destFile] of copyPairs) {
      const srcPath = path.join(__dirname, '..', 'docs', 'qa', srcFile);
      const destPath = path.join(OUTPUT_DIR, destFile);
      if (fs.existsSync(srcPath)) {
        fs.copyFileSync(srcPath, destPath);
        console.log(`Copied QA artifact: ${destFile}`);
      }
    }

    console.log('All screenshots captured successfully!');
  } finally {
    await browser.close();
  }
}

capture().catch(err => {
  console.error('Capture error:', err);
  process.exit(1);
});
