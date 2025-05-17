const { readdir, stat, writeFile, readFile, copyFile, mkdir } = require('fs').promises;
const path = require('path');
const { existsSync } = require('fs');

/**
 * This script fixes issues with client reference manifests for paths with parentheses
 * It runs after the Next.js build to ensure all necessary files are created
 */
async function checkAndFixReferencePaths() {
  console.log('Starting path fix script...');
  const serverDir = path.join(process.cwd(), '.next', 'server');
  
  try {
    await walkDirectory(serverDir);
    console.log('Path fix completed successfully');
  } catch (error) {
    console.error('Error during path fix:', error);
  }
}

async function walkDirectory(dirPath) {
  const entries = await readdir(dirPath, { withFileTypes: true });
  
  for (const entry of entries) {
    const fullPath = path.join(dirPath, entry.name);
    
    if (entry.isDirectory()) {
      await walkDirectory(fullPath);
    } else if (entry.isFile() && fullPath.endsWith('.js') && !fullPath.includes('_client-reference-manifest.js')) {
      // Check if it's a page file that might need a manifest
      if (fullPath.includes('app/') && (fullPath.includes('/page.js') || fullPath.includes('/route.js'))) {
        await createManifestIfNeeded(fullPath);
      }
    }
  }
}

async function createManifestIfNeeded(filePath) {
  const dirName = path.dirname(filePath);
  const baseName = path.basename(filePath, '.js');
  const manifestPath = path.join(dirName, `${baseName}_client-reference-manifest.js`);
  
  // If manifest doesn't exist, create a basic one
  if (!existsSync(manifestPath)) {
    console.log(`Creating missing manifest for ${filePath}`);
    
    const manifestContent = `
self.__RSC_MANIFEST={
  "ssrModuleMapping": {},
  "edgeSSRModuleMapping": {},
  "csrModuleMapping": {},
  "clientModules": {},
  "entryCSSFiles": {}
}`;
    
    try {
      await writeFile(manifestPath, manifestContent, 'utf8');
      console.log(`Created manifest at ${manifestPath}`);
    } catch (err) {
      console.error(`Failed to create manifest at ${manifestPath}:`, err);
    }
  }
}

// Run the script
checkAndFixReferencePaths(); 