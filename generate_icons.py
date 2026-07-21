import os
from PIL import Image, ImageDraw, ImageFont

def create_app_icon(size, filename):
    # Deep midnight pink background
    img = Image.new('RGBA', (size, size), color=(13, 7, 20, 255))
    draw = ImageDraw.Draw(img)
    
    # Outer glowing circle
    margin = int(size * 0.08)
    draw.ellipse([margin, margin, size - margin, size - margin], fill=(255, 46, 140, 255), outline=(0, 242, 254, 255), width=int(size * 0.03))
    
    # Inner heart / Cuty emblem
    inner_margin = int(size * 0.2)
    draw.ellipse([inner_margin, inner_margin, size - inner_margin, size - inner_margin], fill=(112, 0, 255, 255))
    
    # Draw simple heart shape using polygon
    cx, cy = size // 2, size // 2
    r = int(size * 0.18)
    
    # Heart coordinates
    draw.ellipse([cx - r, cy - r*0.8, cx, cy], fill=(255, 255, 255, 255))
    draw.ellipse([cx, cy - r*0.8, cx + r, cy], fill=(255, 255, 255, 255))
    draw.polygon([(cx - r*1.05, cy - r*0.3), (cx + r*1.05, cy - r*0.3), (cx, cy + r*0.9)], fill=(255, 255, 255, 255))
    
    img.save(filename, 'PNG')
    print(f"Generated {filename} ({size}x{size})")

create_app_icon(192, "icon-192.png")
create_app_icon(512, "icon-512.png")
