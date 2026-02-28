export const createImage = (url: string): Promise<HTMLImageElement> =>
  new Promise((resolve, reject) => {
    const image = new Image();
    image.addEventListener('load', () => resolve(image));
    image.addEventListener('error', (error) => reject(error));
    // ONLY set crossOrigin if it's NOT a local blob/data URL
    if (url.startsWith('http')) {
      image.setAttribute('crossOrigin', 'anonymous');
    }
    image.src = url;
  });

export default async function getCroppedImg(
  imageSrc: string,
  pixelCrop: { x: number; y: number; width: number; height: number }
): Promise<File | null> {
  try {
    const image = await createImage(imageSrc);
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');

    if (!ctx) {
      return null;
    }

    // Basic validation to avoid crashes
    const width = Math.max(1, pixelCrop.width);
    const height = Math.max(1, pixelCrop.height);

    canvas.width = width;
    canvas.height = height;

    ctx.drawImage(
      image,
      pixelCrop.x,
      pixelCrop.y,
      pixelCrop.width,
      pixelCrop.height,
      0,
      0,
      width,
      height
    );

    return new Promise((resolve) => {
      canvas.toBlob((blob) => {
        if (!blob) {
          resolve(null);
          return;
        }
        const file = new File([blob], 'cropped_image.jpg', { type: 'image/jpeg' });
        resolve(file);
      }, 'image/jpeg', 0.9);
    });
  } catch (error) {
    console.error('getCroppedImg error:', error);
    return null;
  }
}
