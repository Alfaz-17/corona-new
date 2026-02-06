"use client";

import { pipeline, env, RawImage } from '@huggingface/transformers';

// v3 environment configuration
env.allowLocalModels = false;
env.useBrowserCache = true;

let remover: any = null;

export type ProgressData = {
  status: string;
  progress: number;
  item: string;
  file: string;
};

export const removeBackground = async (
  imageFile: File, 
  onProgress?: (data: ProgressData) => void
): Promise<File | null> => {
  try {
    if (!remover) {
      console.log('Initializing Hugging Face background removal model...');
      if (onProgress) onProgress({ status: 'progress', progress: 0, file: 'Initializing Model', item: '' });
      
      remover = await pipeline('image-segmentation', 'briaai/RMBG-1.4', {
        device: 'auto', // Let the library decide the best backend (WebGPU -> WASM)
        progress_callback: (data: any) => {
          if (onProgress) onProgress(data);
          if (data.status === 'progress') {
            console.log(`Loading Hugging Face Model: ${data.progress.toFixed(2)}% (${data.file})`);
          }
        },
      });
    }

    // Convert File to RawImage
    const url = URL.createObjectURL(imageFile);
    const img = await RawImage.fromURL(url);
    URL.revokeObjectURL(url);

    console.log('Processing image with Hugging Face transformers...');
    // Run the model
    const output = await remover(img);
    
    // image-segmentation returns an array of segmentations
    // For RMBG-1.4, the first one is usually the mask
    const mask = Array.isArray(output) ? output[0].mask : output.mask;
    
    if (!mask) {
      console.error('Failed to extract mask from model output', output);
      return null;
    }

    console.log('Generating transparent image...');
    // Create a canvas for the result
    const canvas = document.createElement('canvas');
    canvas.width = img.width;
    canvas.height = img.height;
    const ctx = canvas.getContext('2d');
    if (!ctx) return null;

    // 1. Draw original image
    const originalCanvas = await img.toCanvas();
    ctx.drawImage(originalCanvas, 0, 0);

    // 2. Get the mask as a canvas
    const maskCanvas = await mask.toCanvas();
    
    // 3. Apply the mask as an alpha channel
    // 'destination-in' means: "keep the destination (original image) where the source (mask) exists"
    ctx.globalCompositeOperation = 'destination-in';
    ctx.drawImage(maskCanvas, 0, 0, img.width, img.height);
    
    // Reset composite operation
    ctx.globalCompositeOperation = 'source-over';

    return new Promise((resolve, reject) => {
      canvas.toBlob((blob) => {
        if (!blob) {
          reject(new Error('Failed to create blob from canvas'));
          return;
        }
        const file = new File([blob], `hf-no-bg-${imageFile.name.split('.')[0]}.png`, { type: 'image/png' });
        resolve(file);
      }, 'image/png');
    });

  } catch (error: any) {
    console.error('Error in Hugging Face removeBackground:', error);
    // Throw the error so the UI can show it
    throw new Error(error.message || 'Background removal failed');
  }
};
