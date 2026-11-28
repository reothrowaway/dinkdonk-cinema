"""Assemble the lobby weather proof and model turnaround from Blender's PNGs."""
from pathlib import Path
import sys
import numpy as np
from PIL import Image

draft, reference, destination = map(Path, sys.argv[1:])
buffers = draft / 'buffers'
weather = np.array(Image.open(reference).convert('RGB')).astype(np.int16)
before, after = [
    np.asarray(Image.open(buffers / name).convert('RGB')).astype(np.int16)
    for name in ('original.png', 'new.png')
]
assert weather.shape == (720, 1280, 3) and before.shape == after.shape
height, width = before.shape[:2]
assert (width, height) == (128, 128)
region = weather[536:536 + height, 720:720 + width]
region[:] = np.clip(region + after - before, 0, 255)
Image.fromarray(weather.astype(np.uint8)).save(destination / 'lobby-draft.png')
sheet = Image.new('RGB', (1080, 360))
for index in range(3):
    view = Image.open(buffers / f'buddy-{index}.png').convert('RGB')
    assert view.size == (360, 360)
    sheet.paste(view, (360 * index, 0))
sheet.save(destination / 'buddy-turnaround.jpg', quality=92)
