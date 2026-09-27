"""Team portraits: cut out and crop to one bust framing.

The profile PDF only has the portraits on grey backdrops (its silhouette
clipping paths cover the heads above each panel, not the whole person), so
the backdrop is removed with a segmentation model, then every portrait is
cropped to the same 4:5 head-and-shoulders frame, scaled from the detected
face so heads match in size and height across the grid.

Not part of the build: run it by hand when a portrait changes, then run
`npm run images`. Needs two throwaway virtualenvs (the packages conflict):

  python3 -m venv /tmp/rb && /tmp/rb/bin/pip install "rembg[cpu]"
  python3 -m venv /tmp/cv && /tmp/cv/bin/pip install "opencv-python-headless<5" numpy pillow
  /tmp/rb/bin/python scripts/team-cutouts.py cut     # one process per image (the model needs ~14 GB)
  /tmp/cv/bin/python scripts/team-cutouts.py crop
"""
import glob
import os
import subprocess
import sys

SRC = 'assets-src/images/team'
TMP = '/tmp/team-cut'
OUT = 'assets-src/images/team-cutout'

FACE_TOP = 0.62  # face-box top, in face heights below the frame top
BELOW = 2.15     # frame bottom, in face heights below the face-box top (the tightest source allows 2.18)
RATIO = 4 / 5


def cut():
    os.makedirs(TMP, exist_ok=True)
    for f in sorted(glob.glob(f'{SRC}/*.png')):
        code = (
            'import sys;from rembg import remove,new_session;from PIL import Image;'
            'im=Image.open(sys.argv[1]).convert("RGB");'
            'remove(im,session=new_session("birefnet-portrait")).save(sys.argv[2])'
        )
        subprocess.run([sys.executable, '-c', code, f, f'{TMP}/{os.path.basename(f)}'], check=True)
        print('cut', os.path.basename(f))


def crop():
    import cv2
    from PIL import Image

    casc = cv2.CascadeClassifier(cv2.data.haarcascades + 'haarcascade_frontalface_default.xml')
    os.makedirs(OUT, exist_ok=True)
    for f in sorted(glob.glob(f'{SRC}/*.png')):
        name = os.path.basename(f)
        gray = cv2.cvtColor(cv2.imread(f), cv2.COLOR_BGR2GRAY)
        faces = sorted(casc.detectMultiScale(gray, 1.05, 6, minSize=(30, 30)), key=lambda r: -r[2] * r[3])
        x, y, s, _ = faces[0]
        h = (FACE_TOP + BELOW) * s
        w = h * RATIO
        left, top = x + s / 2 - w / 2, y - FACE_TOP * s
        cutout = Image.open(f'{TMP}/{name}').convert('RGBA')
        frame = Image.new('RGBA', (round(w), round(h)), (0, 0, 0, 0))
        frame.paste(cutout, (round(-left), round(-top)), cutout)
        out_h = min(1000, max(640, round(h)))  # small sources get a 2x lift, large ones a cap
        frame = frame.resize((round(out_h * RATIO), out_h), Image.LANCZOS)
        frame.save(f'{OUT}/{name}', optimize=True)
        print('crop', name, f'face {s}px -> frame {round(w)}x{round(h)} -> {frame.size}')


if __name__ == '__main__':
    {'cut': cut, 'crop': crop}[sys.argv[1]]()
