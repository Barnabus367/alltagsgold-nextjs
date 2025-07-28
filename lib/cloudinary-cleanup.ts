// Cloudinary Cleanup-Tool für alte/doppelte Uploads
import { v2 as cloudinary } from 'cloudinary';

// Cloudinary-Konfiguration
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME || 'do7yh4dll',
  api_key: process.env.CLOUDINARY_API_KEY || '594974357421936',
  api_secret: process.env.CLOUDINARY_API_SECRET || 'HzFguz2h0acwmXf8-YNnbXA-3hI'
});

/**
 * Analysiere und lösche alte/doppelte Bilder
 */
export async function cleanupCloudinaryDuplicates(
  dryRun: boolean = true,
  logCallback?: (message: string) => void
) {
  const log = (message: string) => {
    console.log(message);
    if (logCallback) logCallback(message);
  };

  try {
    log(`🧹 Starting Cloudinary cleanup${dryRun ? ' (DRY RUN - no files will be deleted)' : ' (REAL DELETE)'}...`);
    
    // 1. Analyse der alten shopify-products/ Struktur
    const oldShopifyProducts = await cloudinary.api.resources({
      type: 'upload',
      prefix: 'shopify-products/',
      max_results: 500
    });
    
    log(`📦 Found ${oldShopifyProducts.resources.length} files in old 'shopify-products/' folder`);
    
    // 2. Analyse der neuen alltagsgold/products/ Struktur  
    const newAlltagsgoldProducts = await cloudinary.api.resources({
      type: 'upload',
      prefix: 'alltagsgold/products/',
      max_results: 500
    });
    
    log(`📦 Found ${newAlltagsgoldProducts.resources.length} files in new 'alltagsgold/products/' folder`);
    
    // 3. Identifiziere Duplikate
    const duplicates: any[] = [];
    const newProductIds = new Set();
    
    // Extrahiere Product-IDs aus der neuen Struktur
    newAlltagsgoldProducts.resources.forEach((resource: any) => {
      const match = resource.public_id.match(/product_(\d+)_image_/);
      if (match) {
        newProductIds.add(match[1]);
      }
    });
    
    log(`📋 Found ${newProductIds.size} unique products in new structure`);
    
    // Finde alte Bilder, die bereits in der neuen Struktur existieren
    oldShopifyProducts.resources.forEach((resource: any) => {
      const match = resource.public_id.match(/(\d+)_\d+$/);
      if (match && newProductIds.has(match[1])) {
        duplicates.push(resource);
      }
    });
    
    log(`🔍 Found ${duplicates.length} duplicate files to clean up`);
    
    if (duplicates.length === 0) {
      log('✅ No duplicates found - cleanup not needed!');
      return { deleted: 0, saved_storage: 0 };
    }
    
    // 4. Lösche Duplikate (oder zeige nur an bei Dry Run)
    let deletedCount = 0;
    let savedStorage = 0;
    
    for (const duplicate of duplicates.slice(0, 50)) { // Limitiere auf 50 pro Durchgang
      try {
        if (dryRun) {
          log(`🔍 Would delete: ${duplicate.public_id} (${(duplicate.bytes / 1024).toFixed(1)} KB)`);
        } else {
          await cloudinary.uploader.destroy(duplicate.public_id);
          log(`🗑️  Deleted: ${duplicate.public_id} (${(duplicate.bytes / 1024).toFixed(1)} KB)`);
          deletedCount++;
        }
        savedStorage += duplicate.bytes;
        
        // Rate limiting
        await new Promise(resolve => setTimeout(resolve, 100));
        
      } catch (error: any) {
        log(`❌ Failed to delete ${duplicate.public_id}: ${error.message}`);
      }
    }
    
    const savedStorageMB = (savedStorage / 1024 / 1024).toFixed(2);
    
    if (dryRun) {
      log(`\\n📊 Dry Run Summary:`);
      log(`  - Would delete: ${duplicates.length} duplicate files`);
      log(`  - Would save: ${savedStorageMB} MB of storage`);
      log(`  - Run with dryRun=false to actually delete`);
    } else {
      log(`\\n🎉 Cleanup completed!`);
      log(`  - Deleted: ${deletedCount} duplicate files`);
      log(`  - Saved: ${savedStorageMB} MB of storage`);
      log(`  - Remaining duplicates: ${duplicates.length - deletedCount}`);
    }
    
    return {
      analyzed: duplicates.length,
      deleted: dryRun ? 0 : deletedCount,
      saved_storage_mb: parseFloat(savedStorageMB),
      remaining: duplicates.length - deletedCount
    };
    
  } catch (error: any) {
    const errorMsg = `❌ Cleanup failed: ${error.message}`;
    log(errorMsg);
    throw error;
  }
}

/**
 * Lösche einen kompletten Ordner (mit Vorsicht!)
 */
export async function deleteCloudinaryFolder(
  folderPrefix: string,
  dryRun: boolean = true,
  logCallback?: (message: string) => void
) {
  const log = (message: string) => {
    console.log(message);
    if (logCallback) logCallback(message);
  };

  try {
    log(`🗑️  ${dryRun ? 'Analyzing' : 'Deleting'} folder: ${folderPrefix}`);
    
    const resources = await cloudinary.api.resources({
      type: 'upload',
      prefix: folderPrefix,
      max_results: 500
    });
    
    log(`📁 Found ${resources.resources.length} files in folder '${folderPrefix}'`);
    
    if (resources.resources.length === 0) {
      log('✅ Folder is empty - nothing to delete');
      return { deleted: 0 };
    }
    
    let deletedCount = 0;
    
    for (const resource of resources.resources) {
      try {
        if (dryRun) {
          log(`🔍 Would delete: ${resource.public_id}`);
        } else {
          await cloudinary.uploader.destroy(resource.public_id);
          log(`🗑️  Deleted: ${resource.public_id}`);
          deletedCount++;
        }
        
        // Rate limiting
        await new Promise(resolve => setTimeout(resolve, 100));
        
      } catch (error: any) {
        log(`❌ Failed to delete ${resource.public_id}: ${error.message}`);
      }
    }
    
    if (dryRun) {
      log(`\\n📊 Would delete ${resources.resources.length} files from '${folderPrefix}'`);
    } else {
      log(`\\n🎉 Deleted ${deletedCount} files from '${folderPrefix}'`);
    }
    
    return { deleted: dryRun ? 0 : deletedCount };
    
  } catch (error: any) {
    const errorMsg = `❌ Folder deletion failed: ${error.message}`;
    log(errorMsg);
    throw error;
  }
}
