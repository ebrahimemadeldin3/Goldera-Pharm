"use client";

import React from "react";
import Image, { ImageProps } from "next/image";
import { CldImage, type CldImageProps } from "next-cloudinary";

export interface SafeCldImageProps extends Omit<ImageProps, "src"> {
  src: string;
  fallbackUrl?: string;
}

export function SafeCldImage({
  src,
  fallbackUrl,
  alt,
  ...props
}: SafeCldImageProps) {
  const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;

  if (cloudName) {
    // If NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME is set, use next-cloudinary's CldImage
    return (
      <CldImage
        {...(props as unknown as Omit<CldImageProps, "src" | "alt">)}
        src={src}
        alt={alt}
      />
    );
  }

  // Fallback to standard Next.js Image
  const resolvedSrc =
    src.startsWith("http://") || src.startsWith("https://")
      ? src
      : fallbackUrl || src;

  return <Image {...props} src={resolvedSrc} alt={alt} />;
}
