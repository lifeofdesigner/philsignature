import React, { useState } from 'react';
import type { ProductImage } from '@/types/database';
import { Maximize2, X } from 'lucide-react';

export interface ProductGalleryProps {
  images?: ProductImage[];
  fallbackUrl?: string;
  productName: string;
}

export const ProductGallery: React.FC<ProductGalleryProps> = ({
  images = [],
  fallbackUrl = '/products/philz-signature-perfume-body-oil.jpg',
  productName,
}) => {
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [isFullscreen, setIsFullscreen] = useState(false);

  const displayImages = images.length > 0 ? images.map((img) => img.image_url) : [fallbackUrl];
  const activeImage = displayImages[selectedIndex] || fallbackUrl;

  return (
    <div className="space-y-4">
      {/* Primary Flacon Viewport */}
      <div className="relative aspect-[3/4] bg-luxury-charcoal border border-luxury-border overflow-hidden group">
        <img
          src={activeImage}
          alt={`${productName} view ${selectedIndex + 1}`}
          className="w-full h-full object-cover object-center transition-transform duration-700 ease-out group-hover:scale-105"
          loading="eager"
        />

        {/* Zoom Action */}
        <button
          type="button"
          onClick={() => setIsFullscreen(true)}
          className="absolute bottom-4 right-4 p-2.5 bg-black/70 backdrop-blur-md border border-luxury-border text-luxury-sand hover:text-luxury-gold transition-colors"
          aria-label="View larger image"
        >
          <Maximize2 className="h-4 w-4" />
        </button>
      </div>

      {/* Thumbnail Strip */}
      {displayImages.length > 1 && (
        <div className="flex gap-2.5 sm:gap-3 overflow-x-auto pb-2 scrollbar-none touch-pan-x">
          {displayImages.map((url, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => setSelectedIndex(idx)}
              className={`relative aspect-[3/4] w-20 shrink-0 overflow-hidden border transition-all ${
                selectedIndex === idx
                  ? 'border-luxury-gold shadow-sm shadow-luxury-gold/30'
                  : 'border-luxury-border/60 opacity-60 hover:opacity-100'
              }`}
              aria-label={`Select angle ${idx + 1}`}
            >
              <img src={url} alt={`${productName} thumbnail ${idx + 1}`} className="w-full h-full object-cover" />
            </button>
          ))}
        </div>
      )}
      {/* Fullscreen Inspection Modal */}
      {isFullscreen && (
        <div
          className="fixed inset-0 z-50 bg-black/95 flex items-center justify-center p-4 sm:p-8 backdrop-blur-md"
          onClick={() => setIsFullscreen(false)}
        >
          <button
            type="button"
            onClick={() => setIsFullscreen(false)}
            className="absolute top-6 right-6 p-2 text-luxury-sand hover:text-luxury-gold cursor-pointer transition-colors"
            aria-label="Close fullscreen inspection"
          >
            <X className="h-6 w-6" />
          </button>
          <img
            src={activeImage}
            alt={`${productName} high resolution`}
            className="max-h-[90vh] max-w-[90vw] object-contain"
          />
        </div>
      )}
    </div>
  );
};

