#!/usr/bin/env python3
"""Process UI icon PNGs → transparent background WebP for the app."""

from PIL import Image
import numpy as np
from collections import deque
import os

INPUT_DIR = "/Users/kailanto/Claude_Projects/chesskids/design"
OUTPUT_DIR = "/Users/kailanto/Claude_Projects/chesskids/public/icons"
TARGET_WIDTH = 200  # UI icons are smaller than mascot images
WEBP_QUALITY = 80

# Map input filenames → output filenames
ICONS = {
    "icon-map.png": "icon-home.webp",
    "icon-puzzle.png": "icon-practice.webp",
    "icon-play-2.png": "icon-play.webp",
    "icon-settings.png": "icon-settings.webp",
    "icon-profile.png": "icon-character.webp",
    "icon-arrow-forward.png": "icon-next.webp",
    "icon-arrow-back.png": "icon-back.webp",
    "icon-check-mark.png": "icon-check.webp",
    "icon-retry.png": "icon-retry.webp",
    "icon-close.png": "icon-close.webp",
    "icon-sound-on.png": "icon-sound-on.webp",
    "icon-sound-off.png": "icon-sound-off.webp",
}


def flood_fill_background(img_array, threshold=12):
    """Flood-fill from edges to remove near-white background."""
    h, w = img_array.shape[:2]
    visited = np.zeros((h, w), dtype=bool)
    bg_mask = np.zeros((h, w), dtype=bool)

    queue = deque()
    for x in range(w):
        queue.append((0, x))
        queue.append((h - 1, x))
    for y in range(h):
        queue.append((y, 0))
        queue.append((y, w - 1))

    while queue:
        y, x = queue.popleft()
        if y < 0 or y >= h or x < 0 or x >= w:
            continue
        if visited[y, x]:
            continue
        visited[y, x] = True

        r, g, b, a = img_array[y, x]

        # Background if: nearly transparent OR nearly white
        is_bg = (a < 128) or (r > (255 - threshold) and g > (255 - threshold) and b > (255 - threshold) and a > 200)

        if is_bg:
            bg_mask[y, x] = True
            for dy, dx in [(-1, 0), (1, 0), (0, -1), (0, 1)]:
                ny, nx = y + dy, x + dx
                if 0 <= ny < h and 0 <= nx < w and not visited[ny, nx]:
                    queue.append((ny, nx))

    return bg_mask


def process_icon(input_name, output_name):
    input_path = os.path.join(INPUT_DIR, input_name)
    output_path = os.path.join(OUTPUT_DIR, output_name)

    print(f"\nProcessing {input_name} → {output_name}")
    img = Image.open(input_path).convert("RGBA")
    arr = np.array(img)
    print(f"  Input: {img.size[0]}x{img.size[1]}")

    # Step 1: Flood-fill background removal
    bg_mask = flood_fill_background(arr)
    bg_count = bg_mask.sum()
    arr[bg_mask] = [0, 0, 0, 0]
    print(f"  Background pixels removed: {bg_count}")

    # Step 2: Clean semi-transparent edge pixels on the boundary
    # (pixels that border transparent areas and are themselves semi-transparent)
    alpha = arr[:, :, 3]
    h, w = alpha.shape
    for y in range(h):
        for x in range(w):
            a = arr[y, x, 3]
            if 1 <= a <= 30:
                # Check if adjacent to fully transparent pixel
                has_transparent_neighbor = False
                for dy, dx in [(-1, 0), (1, 0), (0, -1), (0, 1)]:
                    ny, nx = y + dy, x + dx
                    if 0 <= ny < h and 0 <= nx < w and arr[ny, nx, 3] == 0:
                        has_transparent_neighbor = True
                        break
                if has_transparent_neighbor:
                    arr[y, x] = [0, 0, 0, 0]

    # Step 3: Trim transparent borders
    alpha = arr[:, :, 3]
    rows = np.any(alpha > 0, axis=1)
    cols = np.any(alpha > 0, axis=0)
    if not rows.any():
        print(f"  WARNING: Image is fully transparent after processing!")
        return None
    y1, y2 = np.where(rows)[0][[0, -1]]
    x1, x2 = np.where(cols)[0][[0, -1]]
    arr = arr[y1:y2+1, x1:x2+1]

    result = Image.fromarray(arr)
    print(f"  Trimmed: {result.size[0]}x{result.size[1]}")

    # Step 4: Resize to target width (maintain aspect ratio)
    w_img, h_img = result.size
    if w_img > TARGET_WIDTH:
        new_h = int(h_img * TARGET_WIDTH / w_img)
        result = result.resize((TARGET_WIDTH, new_h), Image.LANCZOS)
        print(f"  Resized: {result.size[0]}x{result.size[1]}")

    # Step 5: Save as WebP
    result.save(output_path, "WEBP", quality=WEBP_QUALITY)
    file_size = os.path.getsize(output_path)
    print(f"  Output: {output_path} ({file_size // 1024}KB)")

    return output_path


if __name__ == "__main__":
    os.makedirs(OUTPUT_DIR, exist_ok=True)
    results = []
    for input_name, output_name in ICONS.items():
        path = process_icon(input_name, output_name)
        if path:
            results.append(path)
    print(f"\nDone! Processed {len(results)}/{len(ICONS)} icons.")
