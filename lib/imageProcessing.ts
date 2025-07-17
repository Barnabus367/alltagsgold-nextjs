// Background removal service using Remove.bg API
const REMOVE_BG_API_URL = 'https://api.remove.bg/v1.0/removebg';

export class BackgroundRemovalService {
  private processedImages = new Map<string, string>();
  
  async removeBackground(imageUrl: string): Promise<string> {
    // Check if already processed
    if (this.processedImages.has(imageUrl)) {
      return this.processedImages.get(imageUrl)!;
    }

    try {
      // Try Remove.bg API first (requires API key)
      const processedUrl = await this.useRemoveBgAPI(imageUrl);
      this.processedImages.set(imageUrl, processedUrl);
      return processedUrl;
    } catch (error) {
      // ⚠️ Debug: Remove.bg API failed, using fallback method
      
      // Fallback to client-side processing
      try {
        const fallbackUrl = await this.clientSideProcessing(imageUrl);
        this.processedImages.set(imageUrl, fallbackUrl);
        return fallbackUrl;
      } catch (fallbackError) {
        // ⚠️ Debug: Fallback processing failed, using original image
        return imageUrl;
      }
    }
  }

  private async useRemoveBgAPI(imageUrl: string): Promise<string> {
    // This would require a Remove.bg API key
    // For now, we'll use the fallback method
    throw new Error('Remove.bg API key not configured');
  }

  private async clientSideProcessing(imageUrl: string): Promise<string> {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d')!;
    
    const img = await this.loadImage(imageUrl);
    canvas.width = img.width;
    canvas.height = img.height;
    
    ctx.drawImage(img, 0, 0);
    const imageData = ctx.getImageData(0, 0, img.width, img.height);
    
    // Advanced background removal algorithm
    const processedData = this.removeBackgroundAdvanced(imageData);
    
    ctx.putImageData(processedData, 0, 0);
    return canvas.toDataURL('image/png', 0.9);
  }

  private loadImage(src: string): Promise<HTMLImageElement> {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.crossOrigin = 'anonymous';
      img.onload = () => resolve(img);
      img.onerror = reject;
      img.src = src;
    });
  }

  private removeBackgroundAdvanced(imageData: ImageData): ImageData {
    const data = imageData.data;
    const width = imageData.width;
    const height = imageData.height;
    
    // Detect background using edge detection and color clustering
    const edges = this.detectEdges(data, width, height);
    const backgroundColors = this.detectBackgroundColors(data, width, height);
    
    // Remove background pixels
    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        const index = (y * width + x) * 4;
        const r = data[index];
        const g = data[index + 1];
        const b = data[index + 2];
        
        // Check if pixel is likely background
        const isBackground = this.isBackgroundPixel(
          { r, g, b }, 
          backgroundColors, 
          edges[y * width + x],
          x, y, width, height
        );
        
        if (isBackground) {
          data[index + 3] = 0; // Make transparent
        }
      }
    }
    
    return imageData;
  }

  private detectEdges(data: Uint8ClampedArray, width: number, height: number): number[] {
    const edges = new Array(width * height).fill(0);
    
    for (let y = 1; y < height - 1; y++) {
      for (let x = 1; x < width - 1; x++) {
        const index = (y * width + x) * 4;
        
        // Sobel edge detection
        const gx = this.getGradient(data, x, y, width, [-1, 0, 1, -2, 0, 2, -1, 0, 1]);
        const gy = this.getGradient(data, x, y, width, [-1, -2, -1, 0, 0, 0, 1, 2, 1]);
        
        edges[y * width + x] = Math.sqrt(gx * gx + gy * gy);
      }
    }
    
    return edges;
  }

  private getGradient(data: Uint8ClampedArray, x: number, y: number, width: number, kernel: number[]): number {
    let sum = 0;
    for (let ky = 0; ky < 3; ky++) {
      for (let kx = 0; kx < 3; kx++) {
        const px = x + kx - 1;
        const py = y + ky - 1;
        const index = (py * width + px) * 4;
        const gray = (data[index] + data[index + 1] + data[index + 2]) / 3;
        sum += gray * kernel[ky * 3 + kx];
      }
    }
    return sum;
  }

  private detectBackgroundColors(data: Uint8ClampedArray, width: number, height: number) {
    const colors: Array<{ r: number; g: number; b: number; count: number }> = [];
    const borderPixels = [];
    
    // Sample border pixels
    for (let x = 0; x < width; x++) {
      borderPixels.push(this.getPixelColor(data, x, 0, width)); // Top edge
      borderPixels.push(this.getPixelColor(data, x, height - 1, width)); // Bottom edge
    }
    for (let y = 0; y < height; y++) {
      borderPixels.push(this.getPixelColor(data, 0, y, width)); // Left edge
      borderPixels.push(this.getPixelColor(data, width - 1, y, width)); // Right edge
    }
    
    // Cluster similar colors
    borderPixels.forEach(pixel => {
      const existing = colors.find(c => 
        Math.abs(c.r - pixel.r) < 30 &&
        Math.abs(c.g - pixel.g) < 30 &&
        Math.abs(c.b - pixel.b) < 30
      );
      
      if (existing) {
        existing.count++;
      } else {
        colors.push({ ...pixel, count: 1 });
      }
    });
    
    // Return most common background colors
    return colors.sort((a, b) => b.count - a.count).slice(0, 3);
  }

  private getPixelColor(data: Uint8ClampedArray, x: number, y: number, width: number) {
    const index = (y * width + x) * 4;
    return {
      r: data[index],
      g: data[index + 1],
      b: data[index + 2]
    };
  }

  private isBackgroundPixel(
    pixel: { r: number; g: number; b: number },
    backgroundColors: Array<{ r: number; g: number; b: number; count: number }>,
    edgeStrength: number,
    x: number,
    y: number,
    width: number,
    height: number
  ): boolean {
    // Check if pixel matches background colors
    const colorMatch = backgroundColors.some(bg => {
      const distance = Math.sqrt(
        Math.pow(pixel.r - bg.r, 2) +
        Math.pow(pixel.g - bg.g, 2) +
        Math.pow(pixel.b - bg.b, 2)
      );
      return distance < 40;
    });
    
    // Consider edge strength and position
    const isNearBorder = x < width * 0.05 || x > width * 0.95 || 
                        y < height * 0.05 || y > height * 0.95;
    const hasLowEdge = edgeStrength < 30;
    
    return colorMatch && (isNearBorder || hasLowEdge);
  }
}

// Hook for using background removal
export function useBackgroundRemoval() {
  const service = new BackgroundRemovalService();
  
  const processProductImage = async (imageUrl: string): Promise<string> => {
    // Check if image is already processed (has transparent background)
    if (imageUrl.includes('processed-') || !imageUrl) {
      return imageUrl;
    }
    
    try {
      const processedImage = await service.removeBackground(imageUrl);
      return processedImage;
    } catch (error) {
      // ⚠️ Debug: Background removal failed
      return imageUrl;
    }
  };

  return { processProductImage };
}