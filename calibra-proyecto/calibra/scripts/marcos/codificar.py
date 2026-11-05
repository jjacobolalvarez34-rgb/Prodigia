# Pasa los cuadros PNG de un marco a WebP animado (Pillow; ffmpeg tardaba minutos por
# marco). Uso: python codificar.py <carpeta_cuadros> <salida.webp> <fps> [calidad]
import glob, os, sys
from PIL import Image

carpeta, salida, fps = sys.argv[1], sys.argv[2], int(sys.argv[3])
calidad = int(sys.argv[4]) if len(sys.argv) > 4 else 66
cuadros = [Image.open(f).convert("RGBA") for f in sorted(glob.glob(os.path.join(carpeta, "c*.png")))]
cuadros[0].save(salida, save_all=True, append_images=cuadros[1:], duration=round(1000 / fps), loop=0, quality=calidad, alpha_quality=92, method=4)
print(os.path.getsize(salida) // 1024)
