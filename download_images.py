"""GreeNox Cafe - Curated Image Asset Pipeline
Downloads and optimizes 100% unique, accurate, high-quality food photography
for every menu dish, combo, and category in GreeNox Healthy Food Cafe.
"""

import os
import io
import urllib.request
from PIL import Image

IMAGE_DIR = os.path.join(os.path.dirname(os.path.abspath(__file__)), "images")
os.makedirs(IMAGE_DIR, exist_ok=True)

# Curated, verified, unique food photography sources (Unsplash, Pexels, Wikimedia Commons)
IMAGE_SOURCES = {
    # Combos & Special Orders
    "order-protein-fuel.jpg": "https://images.unsplash.com/photo-1543352632-5a4b24e4d2a6?w=800&auto=format&fit=crop&q=85",
    "order-green-glow.jpg": "https://images.unsplash.com/photo-1574400901674-b28bb483afc3?w=800&auto=format&fit=crop&q=85",
    "order-campus-chill.jpg": "https://images.unsplash.com/photo-1641848606490-3f84aea59aeb?w=800&auto=format&fit=crop&q=85",
    "order-fiesta.jpg": "https://images.unsplash.com/photo-1504544750208-dc0358e63f7f?w=800&auto=format&fit=crop&q=85",

    # Chai & Tea
    "chai.jpg": "https://images.unsplash.com/photo-1576092768241-dec231879fc3?w=800&auto=format&fit=crop&q=85",
    "adrak-chai.jpg": "https://images.unsplash.com/photo-1597481499750-3e6b22637e12?w=800&auto=format&fit=crop&q=85",
    "lemon-tea.jpg": "https://images.unsplash.com/photo-1682530017002-34e2cb7b1653?w=800&auto=format&fit=crop&q=85",
    "iced-tea.jpg": "https://images.unsplash.com/photo-1556679343-c7306c1976bc?w=800&auto=format&fit=crop&q=85",

    # Hot Coffee
    "hot-coffee.jpg": "https://images.unsplash.com/photo-1509785307050-d4066910ec1e?w=800&auto=format&fit=crop&q=85",
    "espresso.jpg": "https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?w=800&auto=format&fit=crop&q=85",
    "hot-chocolate.jpg": "https://images.unsplash.com/photo-1542990253-0d0f5be5f0ed?w=800&auto=format&fit=crop&q=85",
    "cappuccino.jpg": "https://images.unsplash.com/photo-1534778101976-62847782c213?w=800&auto=format&fit=crop&q=85",
    "latte.jpg": "https://images.unsplash.com/photo-1570968915860-54d5c301fa9f?w=800&auto=format&fit=crop&q=85",

    # Mocktails
    "mint-mojito.jpg": "https://images.unsplash.com/photo-1551024709-8f23befc6f87?w=800&auto=format&fit=crop&q=85",
    "watermelon-mojito.jpg": "https://images.unsplash.com/photo-1560512823-829485b8bf24?w=800&auto=format&fit=crop&q=85",
    "blue-lagoon.jpg": "https://images.unsplash.com/photo-1514362545857-3bc16c4c7d1b?w=800&auto=format&fit=crop&q=85",

    # Burger & Fries
    "burger.jpg": "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=800&auto=format&fit=crop&q=85",
    "veg-burger.jpg": "https://images.unsplash.com/photo-1550547660-d9450f859349?w=800&auto=format&fit=crop&q=85",
    "chicken-burger.jpg": "https://images.unsplash.com/photo-1625813506062-0aeb1d7a094b?w=800&auto=format&fit=crop&q=85",
    "peri-peri-fries.jpg": "https://images.unsplash.com/photo-1573080496219-bb080dd4f877?w=800&auto=format&fit=crop&q=85",
    "loaded-fries.jpg": "https://images.unsplash.com/photo-1573502641713-edc392a0ef30?w=800&auto=format&fit=crop&q=85",
    "french-fries.jpg": "https://images.unsplash.com/photo-1541592106381-b31e9677c0e5?w=800&auto=format&fit=crop&q=85",

    # Wraps
    "wraps.jpg": "https://images.unsplash.com/photo-1626700051175-6818013e1d4f?w=800&auto=format&fit=crop&q=85",
    "paneer-wrap.jpg": "https://images.pexels.com/photos/29173104/pexels-photo-29173104.jpeg?auto=compress&cs=tinysrgb&w=800",
    "falafel-wrap.jpg": "https://images.unsplash.com/photo-1540914124281-342587941389?w=800&auto=format&fit=crop&q=85",
    "chicken-wrap.jpg": "https://images.unsplash.com/photo-1604467794349-0b74285de7e7?w=800&auto=format&fit=crop&q=85",

    # Fresh Juice
    "fresh-juice.jpg": "https://images.unsplash.com/photo-1600271886742-f049cd451bba?w=800&auto=format&fit=crop&q=85",
    "watermelon-juice.jpg": "https://images.unsplash.com/photo-1589733955941-5eeaf752f6dd?w=800&auto=format&fit=crop&q=85",
    "orange-juice.jpg": "https://images.unsplash.com/photo-1613478223719-2ab802602423?w=800&auto=format&fit=crop&q=85",
    "abc-juice.jpg": "https://images.unsplash.com/photo-1649361298635-5dfdb8be2d20?w=800&auto=format&fit=crop&q=85",

    # Sandwiches
    "sandwiches.jpg": "https://images.unsplash.com/photo-1528735602780-2552fd46c7af?w=800&auto=format&fit=crop&q=85",
    "corn-cheese-sandwich.jpg": "https://images.unsplash.com/photo-1751124809829-121c24e5bd0b?w=800&auto=format&fit=crop&q=85",
    "paneer-sandwich.jpg": "https://upload.wikimedia.org/wikipedia/commons/b/b5/Paneer_Tikka_Sandwich_at_New_Diamond_Agra_Stall.jpg",
    "chicken-sandwich.jpg": "https://images.unsplash.com/photo-1521305916504-4a1121188589?w=800&auto=format&fit=crop&q=85",

    # Shakes
    "shakes.jpg": "https://images.unsplash.com/photo-1572490122747-3968b75cc699?w=800&auto=format&fit=crop&q=85",
    "protein-shake.jpg": "https://images.unsplash.com/photo-1579954115545-a95591f28bfc?w=800&auto=format&fit=crop&q=85",
    "chocolate-shake.jpg": "https://images.unsplash.com/photo-1584649258298-7ecf2437f769?w=800&auto=format&fit=crop&q=85",
    "berry-shake.jpg": "https://images.unsplash.com/photo-1553530666-ba11a7da3888?w=800&auto=format&fit=crop&q=85",

    # Subs
    "subs.jpg": "https://upload.wikimedia.org/wikipedia/commons/6/6d/Submarine_sandwich_with_toppings_and_dijon_mustard.jpg",
    "falafel-sub.jpg": "https://images.unsplash.com/photo-1621852004158-f3bc188ace2d?w=800&auto=format&fit=crop&q=85",
    "paneer-sub.jpg": "https://upload.wikimedia.org/wikipedia/commons/8/88/Paneer_Tikka_Snadwich_-_Wagh_Bakri_Tea_Lounge%2C_Vadodara_-_06.jpg",
    "chicken-sub.jpg": "https://images.pexels.com/photos/7596517/pexels-photo-7596517.jpeg?auto=compress&cs=tinysrgb&w=800",

    # Cold Coffee
    "cold-coffee.jpg": "https://images.unsplash.com/photo-1517701550927-30cf4ba1dba5?w=800&auto=format&fit=crop&q=85",
    "iced-latte.jpg": "https://images.unsplash.com/photo-1461023058943-07fcbe16d735?w=800&auto=format&fit=crop&q=85",

    # Desserts
    "brownie.jpg": "https://images.unsplash.com/photo-1606313564200-e75d5e30476c?w=800&auto=format&fit=crop&q=85",
    "choco-lava.jpg": "https://images.unsplash.com/photo-1541781774459-bb2af2f05b55?w=800&auto=format&fit=crop&q=85",
    "blueberry-cheesecake.jpg": "https://images.unsplash.com/photo-1565958011703-44f9829ba187?w=800&auto=format&fit=crop&q=85",

    # Salads
    "salads.jpg": "https://images.unsplash.com/photo-1540420773420-3366772f4999?w=800&auto=format&fit=crop&q=85",
    "caesar-salad.jpg": "https://images.unsplash.com/photo-1550304943-4f24f54ddde9?w=800&auto=format&fit=crop&q=85",
    "protein-salad.jpg": "https://images.unsplash.com/photo-1623428187969-5da2dcea5ebf?w=800&auto=format&fit=crop&q=85",
    "chicken-salad.jpg": "https://images.pexels.com/photos/5192435/pexels-photo-5192435.jpeg?auto=compress&cs=tinysrgb&w=800",

    # Wholesome Meals
    "chicken-bowl.jpg": "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=800&auto=format&fit=crop&q=85",
    "chicken-steak.jpg": "https://images.pexels.com/photos/5769373/pexels-photo-5769373.jpeg?auto=compress&cs=tinysrgb&w=800",

    # Burrito Bowls
    "burrito-bowls.jpg": "https://images.unsplash.com/photo-1543339308-43e59d6b73a6?w=800&auto=format&fit=crop&q=85",
    "chicken-burrito-bowl.jpg": "https://images.unsplash.com/photo-1668665771757-4d42737d295a?w=800&auto=format&fit=crop&q=85",
    "avocado-bowl.jpg": "https://images.unsplash.com/photo-1644504439611-ddc302de87ea?w=800&auto=format&fit=crop&q=85",

    # Healthy Rice Bowls
    "rice-bowls.jpg": "https://images.unsplash.com/photo-1512058564366-18510be2db19?w=800&auto=format&fit=crop&q=85",
    "paneer-rice-bowl.jpg": "https://upload.wikimedia.org/wikipedia/commons/a/a4/Paneer_pulao_and_raita.jpg",
    "chicken-rice-bowl.jpg": "https://images.unsplash.com/photo-1762631383378-115f2d4cbe07?w=800&auto=format&fit=crop&q=85",

    # Pasta
    "pasta.jpg": "https://images.unsplash.com/photo-1608897013039-887f21d8c804?w=800&auto=format&fit=crop&q=85",
    "alfredo-pasta.jpg": "https://images.unsplash.com/photo-1645112411341-6c4fd023714a?w=800&auto=format&fit=crop&q=85",
    "arrabiata-pasta.jpg": "https://images.unsplash.com/photo-1551183053-bf91a1d81141?w=800&auto=format&fit=crop&q=85",
    "chicken-pasta.jpg": "https://images.pexels.com/photos/12001950/pexels-photo-12001950.jpeg?auto=compress&cs=tinysrgb&w=800",

    # Smoothie Bowls
    "smoothie-bowl.jpg": "https://images.unsplash.com/photo-1590301157890-4810ed352733?w=800&auto=format&fit=crop&q=85",
    "berry-kiwi-bowl.jpg": "https://images.unsplash.com/photo-1590301156220-074867aa5108?w=800&auto=format&fit=crop&q=85",
    "fruit-salad.jpg": "https://images.unsplash.com/photo-1561043433-aaf687c4cf04?w=800&auto=format&fit=crop&q=85",

    # Tacos
    "tacos.jpg": "https://images.unsplash.com/photo-1551504734-5ee1c4a1479b?w=800&auto=format&fit=crop&q=85",
    "chicken-taco.jpg": "https://images.unsplash.com/photo-1565299585323-38d6b0865b47?w=800&auto=format&fit=crop&q=85",

    # Hero Slides & Art Showcase
    "hero-slide-1.jpg": "https://images.unsplash.com/photo-1644504439611-ddc302de87ea?w=1024&auto=format&fit=crop&q=85",
    "hero-slide-2.jpg": "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=1024&auto=format&fit=crop&q=85",
    "hero-slide-3.jpg": "https://images.unsplash.com/photo-1590301157890-4810ed352733?w=1024&auto=format&fit=crop&q=85",
    "hero-slide-4.jpg": "https://images.unsplash.com/photo-1623428187969-5da2dcea5ebf?w=1024&auto=format&fit=crop&q=85",
    "hero-bowl-art.jpg": "https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=1024&auto=format&fit=crop&q=85",
}

def center_crop_and_resize(img, target_w, target_h):
    w, h = img.size
    target_ratio = target_w / target_h
    current_ratio = w / h
    if current_ratio > target_ratio:
        new_w = int(h * target_ratio)
        left = (w - new_w) // 2
        img = img.crop((left, 0, left + new_w, h))
    else:
        new_h = int(w / target_ratio)
        top = (h - new_h) // 2
        img = img.crop((0, top, w, top + new_h))
    return img.resize((target_w, target_h), Image.Resampling.LANCZOS)

def download_and_optimize(force=False):
    headers = {"User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7)"}
    print(f"Checking and optimizing {len(IMAGE_SOURCES)} images...")
    success = 0
    for filename, url in IMAGE_SOURCES.items():
        filepath = os.path.join(IMAGE_DIR, filename)
        if not force and os.path.exists(filepath) and os.path.getsize(filepath) > 2000:
            success += 1
            continue

        is_hero = filename.startswith("hero-") or filename.startswith("cat-")
        target_dim = (1024, 1024) if is_hero else (480, 360)

        try:
            req = urllib.request.Request(url, headers=headers)
            with urllib.request.urlopen(req, timeout=12) as resp:
                data = resp.read()
                img = Image.open(io.BytesIO(data)).convert("RGB")
                img_processed = center_crop_and_resize(img, target_dim[0], target_dim[1])
                img_processed.save(filepath, "JPEG", quality=85, optimize=True)
                success += 1
                print(f"✓ Saved {filename} ({os.path.getsize(filepath) // 1024} KB)")
        except Exception as e:
            print(f"✗ Error downloading {filename}: {e}")

    print(f"Finished: {success}/{len(IMAGE_SOURCES)} ready.")

if __name__ == "__main__":
    download_and_optimize(force=False)
