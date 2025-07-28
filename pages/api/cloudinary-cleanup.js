import { cleanupCloudinaryDuplicates, deleteCloudinaryFolder } from '../../lib/cloudinary-cleanup';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  // Set headers for streaming response
  res.writeHead(200, {
    'Content-Type': 'text/plain; charset=utf-8',
    'Transfer-Encoding': 'chunked',
    'Cache-Control': 'no-cache',
    'Connection': 'keep-alive'
  });

  const { action, dryRun = true } = req.body;

  try {
    res.write(`🧹 Starting Cloudinary cleanup...\n`);
    res.write(`Mode: ${dryRun ? 'DRY RUN (safe preview)' : 'REAL DELETE (permanent!)'}\n\n`);

    if (action === 'duplicates') {
      // Cleanup von Duplikaten zwischen alter und neuer Struktur
      const result = await cleanupCloudinaryDuplicates(dryRun, (message) => {
        console.log(message);
        res.write(message + '\n');
      });

      const summary = `
🎉 Cleanup Analysis Complete!
📊 Results:
  - Duplicate files analyzed: ${result.analyzed}
  - Files ${dryRun ? 'would be' : ''} deleted: ${result.deleted}
  - Storage ${dryRun ? 'would be' : ''} saved: ${result.saved_storage_mb} MB
  ${result.remaining > 0 ? `- Remaining duplicates: ${result.remaining}` : ''}
  
${dryRun ? '⚠️  This was a DRY RUN - no files were actually deleted!' : '✅ Files have been permanently deleted!'}
`;

      res.write(summary);

    } else if (action === 'delete-folder') {
      const { folder } = req.body;
      if (!folder) {
        res.write('❌ Error: folder parameter required for delete-folder action\n');
        res.end();
        return;
      }

      const result = await deleteCloudinaryFolder(folder, dryRun, (message) => {
        console.log(message);
        res.write(message + '\n');
      });

      const summary = `
🎉 Folder ${dryRun ? 'Analysis' : 'Deletion'} Complete!
📊 Results:
  - Files ${dryRun ? 'would be' : ''} deleted: ${result.deleted}
  
${dryRun ? '⚠️  This was a DRY RUN - no files were actually deleted!' : '✅ Folder has been permanently deleted!'}
`;

      res.write(summary);

    } else {
      res.write('❌ Error: Invalid action. Use "duplicates" or "delete-folder"\n');
    }

    res.end();

  } catch (error) {
    const errorMsg = `❌ Cleanup failed: ${error.message}`;
    console.error(errorMsg);
    res.write(errorMsg + '\n');
    res.end();
  }
}

// Beispiel-Nutzung in der Dokumentation
export const config = {
  api: {
    bodyParser: {
      sizeLimit: '1mb',
    },
  },
}
