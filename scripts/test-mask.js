import fs from 'fs';
import path from 'path';
import sharp from 'sharp';

async function testMask() {
  const src = path.resolve('rameshwor_hero.jpeg');
  const meta = await sharp(src).metadata();
  console.log('Source Image:', meta.width, 'x', meta.height, meta.format);
  
  // Let's create an alpha mask by analyzing the background color in rameshwor_hero.jpeg
  const raw = await sharp(src)
    .resize(512, 768, { fit: 'cover' })
    .raw()
    .toBuffer({ resolveWithObject: true });
    
  console.log('Raw buffer size:', raw.data.length, raw.info.width, 'x', raw.info.height);
}
testMask().catch(console.error);
