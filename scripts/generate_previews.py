import os
from PIL import Image, ImageDraw, ImageFont

os.makedirs('public/templates/previews', exist_ok=True)

# 1. senseng-video preview (from senseng-clean with dynamic video badge)
if os.path.exists('public/templates/previews/senseng-clean.jpg'):
    img = Image.open('public/templates/previews/senseng-clean.jpg').convert('RGB')
    draw = ImageDraw.Draw(img)
    # Add video badge
    W, H = img.size
    # Center play button overlay on hero
    cx, cy = int(W * 0.75), int(H * 0.28)
    r = int(min(W, H) * 0.06)
    draw.ellipse((cx - r, cy - r, cx + r, cy + r), fill=(7, 59, 145, 230), outline=(255, 255, 255), width=4)
    # Play triangle
    tr = r * 0.5
    draw.polygon([(cx - tr*0.4, cy - tr), (cx - tr*0.4, cy + tr), (cx + tr, cy)], fill=(255, 255, 255))
    # Fullscreen Video Banner tag at top
    tag_w, tag_h = 320, 50
    draw.rectangle((30, 30, 30 + tag_w, 30 + tag_h), fill=(7, 59, 145), outline=(125, 211, 252), width=3)
    img.save('public/templates/previews/senseng-video.jpg', quality=95)
    print("Created senseng-video.jpg")

def create_template_preview(filename, bg_color, hero_gradient, brand_color, title, subtitle, badges, cards_theme, is_dark=False):
    W, H = 1200, 750
    img = Image.new('RGB', (W, H), bg_color)
    draw = ImageDraw.Draw(img)
    
    # 1. Navbar
    nav_h = 70
    draw.rectangle((0, 0, W, nav_h), fill='#0f172a' if is_dark else '#ffffff')
    draw.line((0, nav_h, W, nav_h), fill='#334155' if is_dark else '#e2e8f0', width=1)
    
    # Logo
    draw.rectangle((50, 22, 170, 48), fill=brand_color)
    # Nav links
    for i, x in enumerate([450, 550, 650, 750]):
        draw.rectangle((x, 30, x + 60, 40), fill='#94a3b8' if is_dark else '#64748b')
    # CTA button
    draw.rounded_rectangle((W - 220, 16, W - 50, 54), radius=20, fill=brand_color)
    
    # 2. Hero Section
    hero_h = 340
    # Gradient background
    for y in range(nav_h, nav_h + hero_h):
        ratio = (y - nav_h) / hero_h
        r = int(hero_gradient[0][0] * (1 - ratio) + hero_gradient[1][0] * ratio)
        g = int(hero_gradient[0][1] * (1 - ratio) + hero_gradient[1][1] * ratio)
        b = int(hero_gradient[0][2] * (1 - ratio) + hero_gradient[1][2] * ratio)
        draw.line((0, y, W, y), fill=(r, g, b))
    
    # Hero content (left)
    draw.rounded_rectangle((60, nav_h + 35, 320, nav_h + 65), radius=15, fill=brand_color)
    draw.rectangle((60, nav_h + 85, 580, nav_h + 145), fill='#ffffff')
    draw.rectangle((60, nav_h + 160, 520, nav_h + 185), fill='#94a3b8' if is_dark else '#64748b')
    draw.rectangle((60, nav_h + 195, 460, nav_h + 215), fill='#94a3b8' if is_dark else '#64748b')
    draw.rounded_rectangle((60, nav_h + 245, 240, nav_h + 295), radius=25, fill=brand_color)
    
    # Hero visual (right)
    draw.rounded_rectangle((680, nav_h + 40, W - 60, nav_h + hero_h - 30), radius=16, 
                           fill='#1e293b' if is_dark else '#ffffff', 
                           outline=brand_color, width=2)
    # Inner chart / dashboard / product mockup
    draw.rectangle((710, nav_h + 70, 880, nav_h + 100), fill=brand_color)
    draw.rectangle((710, nav_h + 120, W - 90, nav_h + 260), fill='#334155' if is_dark else '#f1f5f9')
    
    # 3. Badges / Value Props row
    badge_y = nav_h + hero_h + 20
    for idx, badge_color in enumerate(badges):
        bx = 60 + idx * 280
        draw.rounded_rectangle((bx, badge_y, bx + 260, badge_y + 70), radius=12,
                               fill='#1e293b' if is_dark else '#ffffff',
                               outline='#334155' if is_dark else '#e2e8f0', width=1)
        draw.ellipse((bx + 15, badge_y + 15, bx + 55, badge_y + 55), fill=badge_color)
        draw.rectangle((bx + 70, badge_y + 22, bx + 220, badge_y + 36), fill='#ffffff' if is_dark else '#1e293b')
        draw.rectangle((bx + 70, badge_y + 44, bx + 190, badge_y + 54), fill='#64748b')
        
    # 4. Product / Solution Cards row
    card_y = badge_y + 95
    for c_idx in range(4):
        cx = 60 + c_idx * 275
        draw.rounded_rectangle((cx, card_y, cx + 255, H - 25), radius=14,
                               fill='#121826' if is_dark else '#ffffff',
                               outline=brand_color if c_idx == 0 else ('#334155' if is_dark else '#e2e8f0'), width=2 if c_idx == 0 else 1)
        # card image area
        draw.rounded_rectangle((cx + 12, card_y + 12, cx + 243, card_y + 115), radius=8, fill=cards_theme[c_idx % len(cards_theme)])
        # card text
        draw.rectangle((cx + 15, card_y + 130, cx + 200, card_y + 144), fill='#ffffff' if is_dark else '#0f172a')
        draw.rectangle((cx + 15, card_y + 152, cx + 225, card_y + 162), fill='#94a3b8' if is_dark else '#64748b')
        draw.rounded_rectangle((cx + 15, card_y + 172, cx + 110, card_y + 190), radius=6, fill=brand_color)
        
    img.save(f'public/templates/previews/{filename}', quality=92)
    print(f"Created {filename}")

# 3. saas-automation (Dark Indigo)
create_template_preview(
    'saas-automation.jpg',
    bg_color='#090d16',
    hero_gradient=[(9, 13, 22), (30, 27, 75)],
    brand_color='#6366f1',
    title='AUTOMATION', subtitle='WORKFLOW',
    badges=['#6366f1', '#06b6d4', '#8b5cf6', '#3b82f6'],
    cards_theme=['#1e1b4b', '#0f172a', '#1e293b', '#312e81'],
    is_dark=True
)

# 4. fintech-platform (Financial Navy & Cyan)
create_template_preview(
    'fintech-platform.jpg',
    bg_color='#f8fafc',
    hero_gradient=[(15, 23, 42), (30, 41, 59)],
    brand_color='#0284c7',
    title='FINTECH', subtitle='TREASURY',
    badges=['#0284c7', '#06b6d4', '#10b981', '#3b82f6'],
    cards_theme=['#e0f2fe', '#bae6fd', '#f0f9ff', '#e2e8f0'],
    is_dark=False
)

# 5. digital-marketing (Vibrant Magenta & Purple)
create_template_preview(
    'digital-marketing.jpg',
    bg_color='#ffffff',
    hero_gradient=[(76, 29, 149), (112, 26, 117)],
    brand_color='#d946ef',
    title='MARKETING', subtitle='GROWTH',
    badges=['#d946ef', '#ec4899', '#8b5cf6', '#f43f5e'],
    cards_theme=['#fdf4ff', '#fae8ff', '#f5d0fe', '#fce7f3'],
    is_dark=False
)

# 6. porto-accounting (Bordeaux Red & Charcoal)
create_template_preview(
    'porto-accounting.jpg',
    bg_color='#fdf1f3',
    hero_gradient=[(43, 43, 43), (60, 60, 60)],
    brand_color='#d90a2c',
    title='ACCOUNTING', subtitle='ADVISORY',
    badges=['#d90a2c', '#4d4d4d', '#b91c1c', '#7f1d1d'],
    cards_theme=['#ffffff', '#fdf1f3', '#fee2e2', '#f3f4f6'],
    is_dark=False
)

# 7. crafto-corporate (High-Fashion Klein Blue & Monochrome)
create_template_preview(
    'crafto-corporate.jpg',
    bg_color='#f9fafb',
    hero_gradient=[(15, 23, 42), (2, 6, 23)],
    brand_color='#0047ff',
    title='CRAFTO', subtitle='ENTERPRISE',
    badges=['#0047ff', '#111827', '#2563eb', '#3b82f6'],
    cards_theme=['#f3f4f6', '#e5e7eb', '#ffffff', '#dbeafe'],
    is_dark=False
)

# 8. juno-toys (Playful Pastel Yellow & Mint)
create_template_preview(
    'juno-toys.jpg',
    bg_color='#fffdf5',
    hero_gradient=[(254, 240, 138), (254, 215, 170)],
    brand_color='#eab308',
    title='JUNO TOYS', subtitle='KIDS',
    badges=['#eab308', '#86efac', '#38bdf8', '#f472b6'],
    cards_theme=['#fef08a', '#bbf7d0', '#bae6fd', '#fed7aa'],
    is_dark=False
)

# 9. corpox-ai-agency (Obsidian Neon Glow)
create_template_preview(
    'corpox-ai-agency.jpg',
    bg_color='#050811',
    hero_gradient=[(5, 8, 17), (24, 18, 59)],
    brand_color='#06b6d4',
    title='AI AGENCY', subtitle='INTELLIGENCE',
    badges=['#06b6d4', '#818cf8', '#c084fc', '#38bdf8'],
    cards_theme=['#0b1120', '#111827', '#1e1b4b', '#172554'],
    is_dark=True
)

# 10. corpox-consulting (Midnight Blue & Champagne Gold)
create_template_preview(
    'corpox-consulting.jpg',
    bg_color='#f8fafc',
    hero_gradient=[(10, 25, 47), (23, 42, 69)],
    brand_color='#0f2b59',
    title='STRATEGY', subtitle='CONSULTING',
    badges=['#0f2b59', '#d4af37', '#1e3a8a', '#b45309'],
    cards_theme=['#ffffff', '#f1f5f9', '#fef3c7', '#e2e8f0'],
    is_dark=False
)
print("All 10 template preview images generated successfully!")
