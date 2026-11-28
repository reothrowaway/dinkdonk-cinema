"""Rebuild the original booth reference with Pillow 10.1+ and FFmpeg."""
import argparse
import math
import shutil
import struct
import subprocess
import tempfile
import uuid
import wave
from pathlib import Path

from PIL import Image, ImageDraw, ImageFont


WIDTH, HEIGHT = 1920, 1080
FPS, RATE = 24, 48000
SYNC, PICTURE, END = 6 * FPS, 8 * FPS, 9 * FPS
INK, PAPER, GREEN = '#212823', '#e8e3ce', '#bac4aa'
FONTS = {size: ImageFont.load_default(size=size) for size in (24, 36, 68, 126, 440)}


def label(draw, xy, text, size, color, anchor='mm', stroke=0):
    draw.text(xy, text, font=FONTS[size], fill=color, anchor=anchor,
              stroke_width=stroke, stroke_fill=color)


def frame(index):
    if SYNC < index < PICTURE:
        return Image.new('RGB', (WIDTH, HEIGHT), 'black')
    if index >= PICTURE:
        img = Image.new('RGB', (WIDTH, HEIGHT), INK)
        draw = ImageDraw.Draw(img)
        draw.rectangle((86, 86, WIDTH - 86, HEIGHT - 86), outline=GREEN, width=3)
        label(draw, (960, 346), 'DINKDONK CINEMA', 36, GREEN)
        label(draw, (960, 524), 'FIRST PICTURE', 126, PAPER, stroke=2)
        label(draw, (960, 692), '00:00:08:00', 68, PAPER)
        return img

    mark = index == SYNC
    bg, fg = (INK, PAPER) if mark else (PAPER, INK)
    img = Image.new('RGB', (WIDTH, HEIGHT), bg)
    draw = ImageDraw.Draw(img)
    bounds = (568, 148, 1352, 932)
    angle = (index % FPS) * 360 / FPS
    if angle:
        draw.pieslice(bounds, -90, angle - 90, fill=GREEN)
    draw.line((0, 540, WIDTH, 540), fill=fg, width=2)
    draw.line((960, 0, 960, HEIGHT), fill=fg, width=2)
    draw.ellipse(bounds, outline=fg, width=4)
    draw.ellipse((604, 184, 1316, 896), outline=fg, width=2)
    label(draw, (960, 518), str(8 - index // FPS), 440, fg, stroke=4)
    label(draw, (88, 78), 'DINKDONK CINEMA', 36, fg, 'lm')
    label(draw, (1832, 78), 'PROJECTION BOOTH', 36, fg, 'rm')
    label(draw, (88, 996), 'SYNC MARK' if mark else 'HEAD LEADER', 24, fg, 'lm')
    label(draw, (1832, 996), f'24 FPS   /   FRAME {index:03d}', 24, fg, 'rm')
    return img


def make_audio(path):
    samples_per_frame = RATE // FPS
    tone = bytearray()
    for i in range(samples_per_frame):
        sample = round(32767 * .1 * math.sin(2 * math.pi * 1000 * i / RATE))
        tone.extend(struct.pack('<hh', sample, sample))
    with wave.open(str(path), 'wb') as audio:
        audio.setparams((2, 2, RATE, 0, 'NONE', 'not compressed'))
        audio.writeframes(bytes(SYNC * samples_per_frame * 4))
        audio.writeframes(tone)
        audio.writeframes(bytes((END - SYNC - 1) * samples_per_frame * 4))


def build(ffmpeg, output):
    with tempfile.TemporaryDirectory(dir=output.parent) as work:
        audio = Path(work) / 'pop.wav'
        video = Path(work) / 'leader.mp4'
        make_audio(audio)
        command = [ffmpeg, '-loglevel', 'error', '-f', 'rawvideo', '-pix_fmt', 'rgb24',
                   '-s', f'{WIDTH}x{HEIGHT}', '-framerate', str(FPS), '-i', 'pipe:0',
                   '-i', str(audio), '-map', '0:v', '-map', '1:a', '-c:v', 'libx264',
                   '-threads', '2', '-preset', 'veryfast', '-crf', '17', '-g', str(FPS),
                   '-pix_fmt', 'yuv420p', '-c:a', 'aac', '-b:a', '256k',
                   '-movflags', '+faststart', str(video)]
        with subprocess.Popen(command, stdin=subprocess.PIPE) as encoder:
            try:
                for index in range(END):
                    encoder.stdin.write(frame(index).tobytes())
            finally:
                encoder.stdin.close()
            if encoder.wait():
                raise RuntimeError('Unable to encode the sync leader')
        # The private temporary directory can carry restrictive Windows ACLs.
        # Create the deliverable alongside its page so the server can read it.
        public_copy = output.with_name(f'.{output.stem}-{uuid.uuid4().hex}.mp4')
        try:
            shutil.copyfile(video, public_copy)
            public_copy.replace(output)
        finally:
            public_copy.unlink(missing_ok=True)


if __name__ == '__main__':
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--ffmpeg', default='ffmpeg')
    args = parser.parse_args()
    build(args.ffmpeg, Path(__file__).resolve().with_name('sync-leader.mp4'))
