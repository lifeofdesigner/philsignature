import os
from PIL import Image, ImageFont, ImageDraw

MASTER_PATH = r'C:\Users\September Images\.gemini\antigravity\brain\f13bb896-0f6c-4062-8460-891717dbce8d\.user_uploaded\media_1789393564746.jpg'
FONT_PATH = r'Italianno.ttf'
OUTPUT_DIR = r'public\candles'

# Only generate the 6 missing official photography images.
# Do NOT overwrite existing official image: sandal-rose.jpg!
CANDLES_TO_GENERATE = [
    {'slug': 'vanilla-treat', 'name': 'Vanilla Treat'},
    {'slug': 'cool-breeze', 'name': 'Cool Breeze'},
    {'slug': 'le-luxe', 'name': 'Le Luxe'},
    {'slug': 'champagne', 'name': 'Champagne'},
    {'slug': 'coconut-lime', 'name': 'Coconut Lime'},
    {'slug': 'coco-vibes', 'name': 'Coco Vibes'},
]

def main():
    if not os.path.exists(MASTER_PATH):
        raise FileNotFoundError(f"Master template not found at {MASTER_PATH}")
    if not os.path.exists(FONT_PATH):
        raise FileNotFoundError(f"Font file not found at {FONT_PATH}")
        
    master_img = Image.open(MASTER_PATH)
    font = ImageFont.truetype(FONT_PATH, 80)
    color = (42, 45, 52)
    center_x = 510
    baseline_y = 727
    
    os.makedirs(OUTPUT_DIR, exist_ok=True)
    
    for candle in CANDLES_TO_GENERATE:
        slug = candle['slug']
        name = candle['name']
        
        # Open fresh copy of master template
        img = master_img.copy()
        draw = ImageDraw.Draw(img)
        
        # Render text with exact baseline and center alignment
        draw.text((center_x, baseline_y), name, fill=color, font=font, anchor='ms')
        
        out_path = os.path.join(OUTPUT_DIR, f"{slug}.jpg")
        # Save with premium JPEG quality and 4:4:4 color subsampling for studio clarity
        img.save(out_path, format='JPEG', quality=95, subsampling=0)
        print(f"Generated {out_path} ({name}) - {img.size}")

if __name__ == '__main__':
    main()
