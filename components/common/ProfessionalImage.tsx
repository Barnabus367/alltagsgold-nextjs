import { useState, useEffect, useRef } from 'react';

interface ProfessionalImageProps {
  src: string;
  alt: string;
  className?: string;
  productTitle?: string;
}

export function ProfessionalImage({ src, alt, className = "", productTitle = "" }: ProfessionalImageProps) {
  const [processedSrc, setProcessedSrc] = useState<string>(src);
  const [isProcessing, setIsProcessing] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if (src && src !== 'https://via.placeholder.com/400x400?text=No+Image') {
      processImage();
    }
  }, [src]);

  const createProfessionalBackground = (ctx: CanvasRenderingContext2D, size: number) => {
    // Premium white background with subtle warmth
    const gradient = ctx.createRadialGradient(size/2, size/2, 0, size/2, size/2, size/2);
    gradient.addColorStop(0, '#ffffff');
    gradient.addColorStop(0.7, '#fefefe');
    gradient.addColorStop(1, '#f9f9f9');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, size, size);

    // Add very subtle AlltagsGold accent border
    ctx.strokeStyle = 'rgba(231, 196, 105, 0.08)';
    ctx.lineWidth = 1;
    ctx.strokeRect(8, 8, size - 16, size - 16);
  };

  const removeDropshippingElements = (imageData: ImageData) => {
    const data = imageData.data;
    const width = imageData.width;
    const height = imageData.height;

    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        const idx = (y * width + x) * 4;
        const r = data[idx];
        const g = data[idx + 1];
        const b = data[idx + 2];

        // Remove bright sale stickers and promotional elements
        if (isBrightPromotionalColor(r, g, b)) {
          const neutral = getNeutralColor(data, x, y, width, height);
          data[idx] = neutral.r;
          data[idx + 1] = neutral.g;
          data[idx + 2] = neutral.b;
        }
      }
    }
  };

  const isBrightPromotionalColor = (r: number, g: number, b: number): boolean => {
    // Red sale badges
    if (r > 220 && g < 80 && b < 80) return true;
    // Yellow/orange promotional elements
    if (r > 220 && g > 180 && b < 80) return true;
    // Bright green elements
    if (r < 80 && g > 220 && b < 120) return true;
    // Bright blue promotional elements
    if (r < 80 && g < 120 && b > 220) return true;
    // Magenta/purple promotional elements
    if (r > 200 && g < 100 && b > 200) return true;
    return false;
  };

  const getNeutralColor = (data: Uint8ClampedArray, x: number, y: number, width: number, height: number) => {
    let totalR = 0, totalG = 0, totalB = 0, count = 0;
    
    // Sample surrounding pixels for neutral replacement
    for (let dy = -3; dy <= 3; dy++) {
      for (let dx = -3; dx <= 3; dx++) {
        const nx = x + dx;
        const ny = y + dy;
        if (nx >= 0 && ny >= 0 && nx < width && ny < height) {
          const idx = (ny * width + nx) * 4;
          const r = data[idx];
          const g = data[idx + 1];
          const b = data[idx + 2];
          
          if (!isBrightPromotionalColor(r, g, b)) {
            totalR += r;
            totalG += g;
            totalB += b;
            count++;
          }
        }
      }
    }
    
    return count > 0 ? {
      r: Math.round(totalR / count),
      g: Math.round(totalG / count),
      b: Math.round(totalB / count)
    } : { r: 245, g: 245, b: 245 };
  };

  const applyProfessionalStyling = (ctx: CanvasRenderingContext2D, size: number) => {
    const imageData = ctx.getImageData(0, 0, size, size);
    const data = imageData.data;

    for (let i = 0; i < data.length; i += 4) {
      // Professional color grading for AlltagsGold
      data[i] = Math.min(255, Math.max(0, data[i] * 1.02)); // Slight warm tone
      data[i + 1] = Math.min(255, Math.max(0, data[i + 1] * 1.01)); // Preserve greens
      data[i + 2] = Math.min(255, Math.max(0, data[i + 2] * 0.98)); // Reduce blue for warmth
      
      // Enhance contrast professionally
      const factor = 1.08;
      const midpoint = 128;
      data[i] = Math.min(255, Math.max(0, ((data[i] - midpoint) * factor) + midpoint));
      data[i + 1] = Math.min(255, Math.max(0, ((data[i + 1] - midpoint) * factor) + midpoint));
      data[i + 2] = Math.min(255, Math.max(0, ((data[i + 2] - midpoint) * factor) + midpoint));
    }

    ctx.putImageData(imageData, 0, 0);
  };

  const processImage = async () => {
    if (!canvasRef.current) return;

    setIsProcessing(true);
    try {
      const img = new Image();
      img.crossOrigin = 'anonymous';
      
      img.onload = () => {
        const canvas = canvasRef.current!;
        const ctx = canvas.getContext('2d')!;

        // Set canvas to uniform square format (1:1 ratio)
        const size = 800;
        canvas.width = size;
        canvas.height = size;

        // Create professional AlltagsGold background
        createProfessionalBackground(ctx, size);

        // Smart crop to remove dropshipping layouts
        const { cropX, cropY, cropWidth, cropHeight } = calculateSmartCrop(img);
        
        // Calculate optimal product positioning
        const productSize = size * 0.7;
        const offsetX = (size - productSize) / 2;
        const offsetY = (size - productSize) / 2;

        // Add subtle shadow
        ctx.save();
        ctx.shadowColor = 'rgba(0, 0, 0, 0.08)';
        ctx.shadowBlur = 12;
        ctx.shadowOffsetX = 2;
        ctx.shadowOffsetY = 6;
        
        // Draw the cropped and positioned image
        ctx.drawImage(
          img,
          cropX, cropY, cropWidth, cropHeight,
          offsetX, offsetY, productSize, productSize
        );
        ctx.restore();

        // Process the image to remove promotional elements
        const imageData = ctx.getImageData(0, 0, size, size);
        removeDropshippingElements(imageData);
        ctx.putImageData(imageData, 0, 0);

        // Apply professional styling
        applyProfessionalStyling(ctx, size);

        // Add subtle vignette and branding
        addPremiumFinishing(ctx, size);

        // Convert to high-quality data URL
        const processedDataUrl = canvas.toDataURL('image/jpeg', 0.95);
        setProcessedSrc(processedDataUrl);
        setIsProcessing(false);
      };

      img.onerror = () => {
        setProcessedSrc(src);
        setIsProcessing(false);
      };

      img.src = src;
    } catch (error) {
      console.warn('Image processing failed:', error);
      setProcessedSrc(src);
      setIsProcessing(false);
    }
  };

  const calculateSmartCrop = (img: HTMLImageElement) => {
    const sourceWidth = img.width;
    const sourceHeight = img.height;
    
    let cropX = 0;
    let cropY = 0;
    let cropWidth = sourceWidth;
    let cropHeight = sourceHeight;

    // Handle wide dropshipping layouts (multiple products side by side)
    if (sourceWidth > sourceHeight * 1.5) {
      // Crop to center square to focus on main product
      cropWidth = sourceHeight;
      cropX = (sourceWidth - sourceHeight) / 2;
    }
    
    // Handle tall layouts with text headers/footers
    if (sourceHeight > sourceWidth * 1.3) {
      // Remove top 15% and bottom 10% to eliminate text
      cropY = sourceHeight * 0.15;
      cropHeight = sourceHeight * 0.75;
    }

    return { cropX, cropY, cropWidth, cropHeight };
  };

  const addPremiumFinishing = (ctx: CanvasRenderingContext2D, size: number) => {
    // Very subtle vignette effect
    const gradient = ctx.createRadialGradient(size/2, size/2, 0, size/2, size/2, size/2);
    gradient.addColorStop(0, 'rgba(255, 255, 255, 0)');
    gradient.addColorStop(0.85, 'rgba(255, 255, 255, 0)');
    gradient.addColorStop(1, 'rgba(0, 0, 0, 0.02)');
    
    ctx.save();
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, size, size);

    // Minimal AlltagsGold branding
    ctx.globalAlpha = 0.025;
    ctx.fillStyle = '#E7C469';
    ctx.font = '10px Arial';
    ctx.textAlign = 'right';
    ctx.fillText('AlltagsGold', size - 12, size - 6);
    ctx.restore();
  };



  return (
    <div className={`relative ${className}`}>
      <canvas ref={canvasRef} className="hidden" />
      
      <img
        src={processedSrc}
        alt={alt}
        className={`w-full h-full object-cover transition-opacity duration-300 ${
          isProcessing ? 'opacity-70' : 'opacity-100'
        }`}
        loading="lazy"
      />
      
      {isProcessing && (
        <div className="absolute inset-0 bg-white/50 flex items-center justify-center">
          <div className="w-5 h-5 border-2 border-gray-300 border-t-gray-600 rounded-full animate-spin"></div>
        </div>
      )}
    </div>
  );
}