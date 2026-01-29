"use client";

import Image from "next/image";

// Cloudinary cloud name
const CLOUDINARY_CLOUD = "dljbyn2lk";

interface OptimizedImageProps {
  src: string;
  alt: string;
  width?: number;
  height?: number;
  className?: string;
  fill?: boolean;
  quality?: number;
  priority?: boolean;
}

/**
 * Generates a Cloudinary-optimized URL for remote images
 * For local images (/public), returns them as-is since Next.js Image handles optimization
 */
export const getOptimizedImageUrl = (
  src: string,
  width?: number,
  quality = 80
): string => {
  // If it's a local image, return as-is
  if (src.startsWith("/")) {
    return src;
  }

  // If already a Cloudinary URL, add transformations
  if (src.includes("cloudinary.com")) {
    // Extract the base URL and add transformations
    const baseUrl = src.replace("/upload/", `/upload/f_auto,q_${quality}${width ? `,w_${width}` : ""}/`);
    return baseUrl;
  }

  // For other external URLs, use Cloudinary fetch
  const encodedUrl = encodeURIComponent(src);
  return `https://res.cloudinary.com/${CLOUDINARY_CLOUD}/image/fetch/f_auto,q_${quality}${width ? `,w_${width}` : ""}/${encodedUrl}`;
};

/**
 * OptimizedImage component using Next.js Image with Cloudinary optimization
 */
export function OptimizedImage({
  src,
  alt,
  width,
  height,
  className,
  fill = false,
  quality = 80,
  priority = false,
}: OptimizedImageProps) {
  const optimizedSrc = getOptimizedImageUrl(src, width, quality);

  if (fill) {
    return (
      <Image
        src={optimizedSrc}
        alt={alt}
        fill
        className={className}
        priority={priority}
        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
      />
    );
  }

  return (
    <Image
      src={optimizedSrc}
      alt={alt}
      width={width || 800}
      height={height || 600}
      className={className}
      priority={priority}
    />
  );
}

export default OptimizedImage;
