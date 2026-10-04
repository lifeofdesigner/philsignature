import os
import cv2
import numpy as np
from PIL import Image, ImageDraw, ImageFont
import subprocess
import time

WIDTH = 1080
HEIGHT = 1920
FPS = 30
TOTAL_DURATION = 60.0
TOTAL_FRAMES = int(TOTAL_DURATION * FPS) # 1800 frames

ASSETS_DIR = "video_assets/screenshots"
AUDIO_PATH = "video_assets/audio/cinematic_soundtrack.wav"
OUTPUT_RAW_VIDEO = "video_assets/raw_assembled.mp4"
FINAL_OUTPUT_VIDEO = "philz_signature_build_documentary.mp4"

# Load Fonts
FONT_TITLE = ImageFont.truetype("C:/Windows/Fonts/segoeuib.ttf", 52)
FONT_SUBTITLE = ImageFont.truetype("C:/Windows/Fonts/segoeuib.ttf", 34)
FONT_BADGE = ImageFont.truetype("C:/Windows/Fonts/segoeuib.ttf", 26)
FONT_URL = ImageFont.truetype("C:/Windows/Fonts/georgiab.ttf", 64)
FONT_CAPTION = ImageFont.truetype("C:/Windows/Fonts/segoeui.ttf", 32)
FONT_CAPTION_BOLD = ImageFont.truetype("C:/Windows/Fonts/segoeuib.ttf", 32)

# Color Palette (Luxury Noir & Gold)
BG_COLOR = (10, 13, 18)
GOLD_COLOR = (229, 192, 123)
GOLD_BRIGHT = (255, 215, 0)
WHITE = (248, 250, 252)
GRAY = (148, 163, 184)
DARK_CARD = (18, 24, 34, 230) # RGBA
BORDER_COLOR = (45, 55, 72)
BORDER_GOLD = (212, 175, 55, 120)

# Preload Images
image_cache = {}
def get_image(filename):
    if filename not in image_cache:
        path = os.path.join(ASSETS_DIR, filename)
        if os.path.exists(path):
            img = Image.open(path).convert("RGBA")
            image_cache[filename] = img
        else:
            print(f"Warning: {path} not found")
            img = Image.new("RGBA", (1000, 800), (30, 35, 45, 255))
            image_cache[filename] = img
    return image_cache[filename]

# Define 7 Scenes according to the story arc
scenes_data = [
    {
        "id": 1,
        "name": "The Hook",
        "start_sec": 0.0,
        "end_sec": 8.0,
        "badge": "01 • THE CONCEPT & LAUNCH",
        "headline": "We built a luxury e-commerce platform from scratch.",
        "images": [
            ("01_live_homepage_desktop.png", 0.0, 4.0),
            ("04_live_collections_desktop.png", 4.0, 8.0)
        ],
        "captions": [
            (0.0, 4.0, "Philz Signature — Haute Parfumerie & Artisanal Fragrances."),
            (4.0, 8.0, "From custom concept to a fully realized luxury e-commerce platform.")
        ]
    },
    {
        "id": 2,
        "name": "The Stack",
        "start_sec": 8.0,
        "end_sec": 18.0,
        "badge": "02 • ARCHITECTURE & THE STACK",
        "headline": "React. Supabase. Paystack. Built for scale.",
        "images": [
            ("06_vscode_react_stack.png", 8.0, 11.5),
            ("17_supabase_dashboard_schema.png", 11.5, 15.0),
            ("09_vscode_paystack_gateway.png", 15.0, 18.0)
        ],
        "captions": [
            (8.0, 11.5, "React 19 & Vite frontend engineered for ultra-low latency."),
            (11.5, 15.0, "PostgreSQL schema on Supabase with real-time replication."),
            (15.0, 18.0, "Paystack enterprise infrastructure handling automated settlements.")
        ]
    },
    {
        "id": 3,
        "name": "The Features",
        "start_sec": 18.0,
        "end_sec": 28.0,
        "badge": "03 • BESPOKE ADMIN CMS",
        "headline": "Full admin CMS. Real-time orders. Enterprise security.",
        "images": [
            ("11_admin_cms_dashboard.png", 18.0, 21.5),
            ("12_admin_products_management.png", 21.5, 25.0),
            ("13_admin_orders_realtime.png", 25.0, 28.0)
        ],
        "captions": [
            (18.0, 21.5, "Bespoke dark-mode back-office dashboard built for daily operations."),
            (21.5, 25.0, "Live inventory management across perfumes, candles, and sprays."),
            (25.0, 28.0, "Real-time order lifecycle tracking and automated customer updates.")
        ]
    },
    {
        "id": 4,
        "name": "The Security",
        "start_sec": 28.0,
        "end_sec": 38.0,
        "badge": "04 • BANK-GRADE DATA DEFENSE",
        "headline": "Bank-level security. Every order protected.",
        "images": [
            ("07_vscode_supabase_rls.png", 28.0, 33.0),
            ("18_security_auth_audit_logs.png", 33.0, 38.0)
        ],
        "captions": [
            (28.0, 33.0, "PostgreSQL Row Level Security (RLS) policies protecting all data."),
            (33.0, 38.0, "2FA multi-factor authentication & zero-trust breach defense.")
        ]
    },
    {
        "id": 5,
        "name": "The Details",
        "start_sec": 38.0,
        "end_sec": 48.0,
        "badge": "05 • FINANCIAL ENGINE & EMAILS",
        "headline": "Tax engine. 20 transactional emails. 3 payment gateways.",
        "images": [
            ("19_tax_engine_breakdown_detail.png", 38.0, 41.5),
            ("10_luxury_email_preview.png", 41.5, 45.0),
            ("08_vscode_email_engine.png", 45.0, 48.0)
        ],
        "captions": [
            (38.0, 41.5, "Automated 7.5% Nigerian VAT engine computed dynamically at checkout."),
            (41.5, 45.0, "20 custom transactional HTML email templates with luxury gold branding."),
            (45.0, 48.0, "Triple gateway redundancy with Paystack, Flutterwave, and Korapay.")
        ]
    },
    {
        "id": 6,
        "name": "The Result",
        "start_sec": 48.0,
        "end_sec": 55.0,
        "badge": "06 • THE RESULT & MOBILE UX",
        "headline": "Flawless on every device. Mobile-first perfection.",
        "images": [
            ("02_live_homepage_mobile.png", 48.0, 51.5),
            ("16_mobile_responsive_showcase.png", 51.5, 55.0)
        ],
        "captions": [
            (48.0, 51.5, "Pixel-perfect luxury experience engineered for mobile shoppers."),
            (51.5, 55.0, "Sub-second load times, fluid micro-interactions, and zero friction.")
        ]
    },
    {
        "id": 7,
        "name": "The CTA",
        "start_sec": 55.0,
        "end_sec": 60.0,
        "badge": "07 • CUBA DEV AGENCY",
        "headline": "Need something built like this?",
        "url_text": "cubadev.com.ng",
        "images": [
            ("20_cta_cubadev_luxury.png", 55.0, 60.0)
        ],
        "captions": [
            (55.0, 60.0, "Custom luxury software engineering • cubadev.com.ng")
        ]
    }
]

def render_frame(frame_idx):
    sec = frame_idx / FPS
    progress = min(1.0, sec / TOTAL_DURATION)
    
    # 1. Base Canvas (Dark Luxury Slate)
    base = Image.new("RGBA", (WIDTH, HEIGHT), (8, 10, 15, 255))
    draw = ImageDraw.Draw(base)
    
    # Subtle ambient gold gradient in background center
    glow_radius = 450
    glow_center = (WIDTH // 2, 850)
    
    # Identify Active Scene
    active_scene = scenes_data[-1]
    for sc in scenes_data:
        if sc["start_sec"] <= sec < sc["end_sec"]:
            active_scene = sc
            break
            
    # Find active image in scene
    active_img_name = active_scene["images"][0][0]
    img_start = active_scene["images"][0][1]
    img_end = active_scene["images"][0][2]
    for img_name, s_t, e_t in active_scene["images"]:
        if s_t <= sec <= e_t:
            active_img_name = img_name
            img_start = s_t
            img_end = e_t
            break
            
    # Calculate motion zoom / pan inside this sub-clip
    sub_dur = max(0.1, img_end - img_start)
    sub_prog = (sec - img_start) / sub_dur
    zoom_scale = 1.0 + 0.06 * sub_prog # Subtle Ken-Burns 6% zoom
    
    # 2. Render Main Media Showcase Card
    # Container box: x: 40 to 1040 (width 1000), y: 390 to 1420 (height 1030)
    card_x, card_y = 45, 390
    card_w, card_h = 990, 1030
    
    # Draw media card backdrop
    draw.rounded_rectangle(
        [card_x, card_y, card_x + card_w, card_y + card_h],
        radius=20,
        fill=(14, 18, 26, 255),
        outline=(212, 175, 55, 110),
        width=2
    )
    
    # Crop and place image with zoom & pan
    raw_img = get_image(active_img_name)
    iw, ih = raw_img.size
    
    # Scale image to fill or fit card nicely
    target_inner_w = card_w - 12
    target_inner_h = card_h - 12
    
    scale_fit = max(target_inner_w / iw, target_inner_h / ih) * zoom_scale
    scaled_w = int(iw * scale_fit)
    scaled_h = int(ih * scale_fit)
    
    # Resize with smooth bilinear
    resized = raw_img.resize((scaled_w, scaled_h), Image.Resampling.BILINEAR)
    
    # Crop to fit inside card
    # Add subtle vertical pan if portrait
    max_crop_x = max(0, scaled_w - target_inner_w)
    max_crop_y = max(0, scaled_h - target_inner_h)
    crop_x = int(max_crop_x * 0.5)
    crop_y = int(max_crop_y * min(1.0, sub_prog * 0.8)) # smooth pan down
    
    cropped = resized.crop((crop_x, crop_y, crop_x + target_inner_w, crop_y + target_inner_h))
    
    # Paste image into card
    base.paste(cropped, (card_x + 6, card_y + 6), cropped)
    
    # Subtle inner border overlay on media card
    draw.rounded_rectangle(
        [card_x + 6, card_y + 6, card_x + card_w - 6, card_y + card_h - 6],
        radius=14,
        outline=(255, 255, 255, 30),
        width=1
    )
    
    # 3. Top Progress Bar (LinkedIn 9:16 safe area)
    # Slim gold line at y = 40
    prog_w = int((WIDTH - 80) * progress)
    draw.line([(40, 40), (WIDTH - 40, 40)], fill=(35, 42, 55, 255), width=6)
    if prog_w > 0:
        draw.line([(40, 40), (40 + prog_w, 40)], fill=(229, 192, 123, 255), width=6)
        
    # Top Brand Header
    draw.text((WIDTH // 2, 85), "PHILZ SIGNATURE  •  BUILD PROCESS", fill=(148, 163, 184, 255), font=FONT_BADGE, anchor="mm")
    
    # 4. Milestone Badge Pill
    badge_text = active_scene["badge"]
    badge_bbox = FONT_BADGE.getbbox(badge_text)
    bw = (badge_bbox[2] - badge_bbox[0]) + 36
    bh = (badge_bbox[3] - badge_bbox[1]) + 20
    bx = (WIDTH - bw) // 2
    by = 130
    draw.rounded_rectangle([bx, by, bx + bw, by + bh], radius=16, fill=(20, 27, 38, 240), outline=(212, 175, 55, 180), width=1)
    draw.text((WIDTH // 2, by + bh // 2), badge_text, fill=GOLD_COLOR, font=FONT_BADGE, anchor="mm")
    
    # 5. Milestone Headline Box (y: 200 to 350)
    headline_text = active_scene["headline"]
    
    # Wrap headline into 1 or 2 lines
    words = headline_text.split()
    lines = []
    curr_line = ""
    for w in words:
        test_l = (curr_line + " " + w).strip()
        bbox = FONT_TITLE.getbbox(test_l)
        if (bbox[2] - bbox[0]) < (WIDTH - 120):
            curr_line = test_l
        else:
            if curr_line: lines.append(curr_line)
            curr_line = w
    if curr_line: lines.append(curr_line)
    
    # Background glassmorphism plate for headline
    hl_card_y = 200
    hl_card_h = 160
    draw.rounded_rectangle([45, hl_card_y, WIDTH - 45, hl_card_y + hl_card_h], radius=16, fill=(12, 16, 23, 235), outline=(45, 55, 72, 200), width=1)
    
    if len(lines) == 1:
        draw.text((WIDTH // 2, hl_card_y + hl_card_h // 2), lines[0], fill=WHITE, font=FONT_TITLE, anchor="mm")
    elif len(lines) == 2:
        draw.text((WIDTH // 2, hl_card_y + 45), lines[0], fill=WHITE, font=FONT_TITLE, anchor="mm")
        draw.text((WIDTH // 2, hl_card_y + 110), lines[1], fill=GOLD_COLOR, font=FONT_TITLE, anchor="mm")
    else:
        for idx, ln in enumerate(lines[:3]):
            draw.text((WIDTH // 2, hl_card_y + 35 + idx * 45), ln, fill=WHITE, font=FONT_SUBTITLE, anchor="mm")
            
    # If CTA scene, also draw prominent glowing gold URL
    if active_scene["id"] == 7:
        url_text = "cubadev.com.ng"
        # Draw special URL emphasis badge right above media
        draw.text((WIDTH // 2, hl_card_y + 112), url_text, fill=GOLD_BRIGHT, font=FONT_TITLE, anchor="mm")
        
    # 6. Lower Subtitles / Captions (y: 1540 to 1720)
    # Find active caption
    active_caption_text = ""
    for c_start, c_end, c_text in active_scene["captions"]:
        if c_start <= sec <= c_end:
            active_caption_text = c_text
            break
            
    if active_caption_text:
        # Wrap caption
        c_words = active_caption_text.split()
        c_lines = []
        c_curr = ""
        for w in c_words:
            test_c = (c_curr + " " + w).strip()
            bbox = FONT_CAPTION.getbbox(test_c)
            if (bbox[2] - bbox[0]) < (WIDTH - 140):
                c_curr = test_c
            else:
                if c_curr: c_lines.append(c_curr)
                c_curr = w
        if c_curr: c_lines.append(c_curr)
        
        cap_card_y = 1530
        cap_card_h = 45 * len(c_lines) + 36
        draw.rounded_rectangle([45, cap_card_y, WIDTH - 45, cap_card_y + cap_card_h], radius=16, fill=(10, 14, 20, 240), outline=(212, 175, 55, 90), width=1)
        
        for idx, ln in enumerate(c_lines):
            draw.text((WIDTH // 2, cap_card_y + 24 + idx * 44), ln, fill=WHITE, font=FONT_CAPTION_BOLD, anchor="mt")

    # 7. Subtle bottom agency credit (Safe zone y = 1840)
    draw.text((WIDTH // 2, 1840), "cubadev.com.ng  •  Engineered with Pride", fill=(100, 116, 139, 255), font=FONT_BADGE, anchor="mm")

    # Convert PIL Image (RGB) to OpenCV BGR array
    np_frame = np.array(base.convert("RGB"))
    bgr_frame = cv2.cvtColor(np_frame, cv2.COLOR_RGB2BGR)
    return bgr_frame

def main():
    print("=" * 65)
    print("  PHILZ SIGNATURE - 60s DOCUMENTARY VIDEO ASSEMBLY PIPELINE  ")
    print("=" * 65)
    start_time = time.time()
    
    fourcc = cv2.VideoWriter_fourcc(*'mp4v')
    out = cv2.VideoWriter(OUTPUT_RAW_VIDEO, fourcc, FPS, (WIDTH, HEIGHT))
    
    print(f"Rendering {TOTAL_FRAMES} frames ({TOTAL_DURATION}s @ {FPS}fps)...")
    report_step = 150
    
    for f in range(TOTAL_FRAMES):
        frame = render_frame(f)
        out.write(frame)
        if f % report_step == 0 or f == TOTAL_FRAMES - 1:
            elapsed = time.time() - start_time
            fps_speed = (f + 1) / max(0.001, elapsed)
            percent = ((f + 1) / TOTAL_FRAMES) * 100
            print(f"[{percent:5.1f}%] Rendered frame {f+1}/{TOTAL_FRAMES} ({fps_speed:.1f} fps)")
            
    out.release()
    render_time = time.time() - start_time
    print(f"Frame rendering complete in {render_time:.1f}s!")
    
    # Step 2: Combine raw video with cinematic audio using FFmpeg
    print("Encoding final LinkedIn-optimized MP4 with H.264 & AAC audio...")
    cmd = [
        "ffmpeg", "-y",
        "-i", OUTPUT_RAW_VIDEO,
        "-i", AUDIO_PATH,
        "-c:v", "libx264",
        "-preset", "medium",
        "-crf", "18", # High visual quality
        "-pix_fmt", "yuv420p", # Essential for universal mobile playback
        "-c:a", "aac",
        "-b:a", "192k",
        "-ar", "44100",
        "-movflags", "+faststart", # Instant LinkedIn mobile playback
        "-t", "60.0",
        FINAL_OUTPUT_VIDEO
    ]
    
    res = subprocess.run(cmd, stdout=subprocess.PIPE, stderr=subprocess.PIPE, text=True)
    if res.returncode != 0:
        print("FFmpeg error:", res.stderr)
        exit(1)
        
    print("=" * 65)
    print(f"SUCCESS: Exported {FINAL_OUTPUT_VIDEO}")
    file_size_mb = os.path.getsize(FINAL_OUTPUT_VIDEO) / (1024 * 1024)
    print(f"Output File: {FINAL_OUTPUT_VIDEO} ({file_size_mb:.2f} MB)")
    print("Format: 1080x1920 (9:16 Vertical) | H.264 + AAC 44.1kHz | 60.0 Seconds")
    print("=" * 65)

if __name__ == "__main__":
    main()
