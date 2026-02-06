"use client"

import { pipeline, RawImage, env } from '@huggingface/transformers';

// Configure environment for browser-only execution
if (typeof window !== 'undefined') {
  env.allowLocalModels = false;
  env.allowRemoteModels = true;
  
  // Mobile optimization: Limit threads to avoid memory crashes on low-end devices
  const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
  if (isMobile) {
    // env.backends.onnx.wasm.numThreads is the correct path for v3
    // @ts-ignore
    if (env.backends?.onnx?.wasm) env.backends.onnx.wasm.numThreads = 1;
  }
}

let segmenter: any = null;

/**
 * Removes the background from a given image file using client-side AI (Hugging Face Transformers.js).
 * Uses the RMBG-1.4 model which is optimized for background removal.
 */
export async function removeBackgroundClient(imageFile: File | Blob): Promise<Blob> {
  try {
    console.log("[BG Client] Starting background removal with Transformers.js...");
    
    // 1. Initialize segmenter if not already loaded
    if (!segmenter) {
      console.log("[BG Client] Loading model (briaai/RMBG-1.4)...");
      segmenter = await pipeline('image-segmentation', 'briaai/RMBG-1.4', {
        device: 'webgpu', 
      });
    }

    // 2. Load and RESIZE image for processing (Saves memory on mobile)
    const url = URL.createObjectURL(imageFile);
    let image = await RawImage.fromURL(url);
    URL.revokeObjectURL(url);

    // Resize if too large to prevent mobile crashes
    const MAX_DIM = 1024;
    if (image.width > MAX_DIM || image.height > MAX_DIM) {
      console.log(`[BG Client] Resizing image from ${image.width}x${image.height} for processing...`);
      // RawImage.resize(width, height) - simple resize
      image = await image.resize(MAX_DIM, MAX_DIM);
    }

    // 3. Process image
    console.log("[BG Client] Processing image...");
    const output = await segmenter(image);
    
    // 4. Extract mask
    // Access mask from output - structure depends on model, but usually [0].mask
    // Safe access
    const mask = Array.isArray(output) ? output[0].mask : output.mask;
    
    // 5. Create final canvas
    const canvas = document.createElement('canvas');
    canvas.width = image.width;
    canvas.height = image.height;
    const ctx = canvas.getContext('2d');
    
    if (!ctx) throw new Error("Could not get canvas context");

    // Draw original (potentially resized) image
    const blob = await image.toBlob();
    const bitmap = await createImageBitmap(blob);
    ctx.drawImage(bitmap, 0, 0);

    // Apply alpha mask
    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    
    const maskCanvas = await mask.toCanvas();
    const maskCtx = maskCanvas.getContext('2d');
    if (!maskCtx) throw new Error("Could not get mask canvas context");
    const maskData = maskCtx.getImageData(0, 0, canvas.width, canvas.height);
    
    for (let i = 0; i < imageData.data.length; i += 4) {
      imageData.data[i + 3] = maskData.data[i]; 
    }
    
    ctx.putImageData(imageData, 0, 0);

    // 6. Convert to Blob
    return new Promise((resolve, reject) => {
      canvas.toBlob((blob) => {
        if (blob) {
          console.log("[BG Client] ✓ Background removed successfully");
          resolve(blob);
        } else {
          reject(new Error("Canvas toBlob failed"));
        }
      }, 'image/png');
    });

  } catch (error: any) {
    console.error("[BG Client] Error removing background:", error);
    segmenter = null; 
    
    // Check if it's a specific memory error
    const isMemoryError = error.message?.toLowerCase().includes("memory") || 
                         error.message?.toLowerCase().includes("range");

    if (isMemoryError) {
      throw new Error("MOBILE_MEMORY_ERROR");
    }
    
    throw new Error("DEVICE_UNSUPPORTED");
  }
}
