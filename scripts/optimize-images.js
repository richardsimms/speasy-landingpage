const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

const imagesToOptimize = [
  { input: 'public/walk.png', output: 'public/optimized/walk.webp' },
  { input: 'public/commute.png', output: 'public/optimized/commute.webp' },
  { input: 'public/air-conditioner-unit.png', output: 'public/optimized/air-conditioner-unit.webp' },
  { input: 'public/abstract-geometric-mt.png', output: 'public/optimized/abstract-geometric-mt.webp' },
  { input: 'public/stylized-initials.png', output: 'public/optimized/stylized-initials.webp' },
];

if (fs.existsSync('public/images/podcast-cover.jpg')) {
  imagesToOptimize.push({ 
    input: 'public/images/podcast-cover.jpg', 
    output: 'public/optimized/podcast-cover.webp' 
  });
} else {
  console.log('Warning: podcast-cover.jpg not found in public/images/');
  if (fs.existsSync('public/podcast-cover.jpg')) {
    imagesToOptimize.push({ 
      input: 'public/podcast-cover.jpg', 
      output: 'public/optimized/podcast-cover.webp' 
    });
  }
}

async function optimizeImages() {
  for (const image of imagesToOptimize) {
    try {
      const outputDir = path.dirname(image.output);
      if (!fs.existsSync(outputDir)) {
        fs.mkdirSync(outputDir, { recursive: true });
      }

      await sharp(image.input)
        .webp({ quality: 80 })
        .toFile(image.output);
      
      console.log(`Optimized: ${image.input} -> ${image.output}`);
    } catch (error) {
      console.error(`Error optimizing ${image.input}:`, error);
    }
  }
}

optimizeImages().then(() => {
  console.log('Image optimization complete!');
}).catch(err => {
  console.error('Error during optimization:', err);
});
