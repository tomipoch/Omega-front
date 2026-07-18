export interface CropArea {
  x: number;
  y: number;
  width: number;
  height: number;
}

const createImage = (url: string): Promise<HTMLImageElement> =>
  new Promise((resolve, reject) => {
    const image = new Image();
    image.addEventListener('load', () => resolve(image));
    image.addEventListener('error', () => reject(new Error('Error al cargar la imagen')));
    image.src = url;
  });

export const getCroppedImg = async (
  imageSrc: string,
  crop: CropArea,
  outputFormat: 'image/jpeg' | 'image/png' | 'image/webp' = 'image/jpeg',
): Promise<string> => {
  if (!imageSrc || !crop) {
    throw new Error('Los parámetros imageSrc y crop son requeridos');
  }

  const image = await createImage(imageSrc);
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('No se pudo obtener el contexto 2D del canvas');

  const { width, height } = crop;
  const pixelRatio = window.devicePixelRatio || 1;

  canvas.width = width * pixelRatio;
  canvas.height = height * pixelRatio;

  ctx.setTransform(pixelRatio, 0, 0, pixelRatio, 0, 0);
  ctx.imageSmoothingQuality = 'high';

  ctx.drawImage(image, crop.x, crop.y, crop.width, crop.height, 0, 0, width, height);

  return new Promise<string>((resolve, reject) => {
    canvas.toBlob(
      (blob) => {
        if (blob) {
          resolve(URL.createObjectURL(blob));
        } else {
          reject(new Error('Error al crear el Blob de la imagen.'));
        }
      },
      outputFormat,
      1,
    );
  });
};