import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'
import sharp from 'sharp'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const assetsDir = path.join(__dirname, '../src/widget/assets')
const optDir = path.join(__dirname, '../src/widget/assets-opt')
const outFile = path.join(__dirname, '../src/widget/assets.ts')

if (!fs.existsSync(assetsDir)) {
  console.log('No assets dir found.')
  process.exit(0)
}

if (!fs.existsSync(optDir)) {
  fs.mkdirSync(optDir, { recursive: true })
}

const files = fs.readdirSync(assetsDir).filter(f => f.match(/\.(png|jpg|jpeg|gif)$/i))

async function optimizeImages() {
  console.log(`Optimizing ${files.length} images...`)
  
  for (const f of files) {
    const inPath = path.join(assetsDir, f)
    const outPath = path.join(optDir, f)
    const ext = path.extname(f).toLowerCase()
    
    // Skip gifs for now to preserve animation easily
    if (ext === '.gif') {
      fs.copyFileSync(inPath, outPath)
      continue
    }

    // Resize and compress heavily
    const s = sharp(inPath).resize({ width: 800, withoutEnlargement: true })
    
    if (ext === '.png') {
      await s.png({ quality: 60, compressionLevel: 8 }).toFile(outPath)
    } else {
      await s.jpeg({ quality: 60, progressive: true }).toFile(outPath)
    }
  }

  const optFiles = fs.readdirSync(optDir).filter(f => f.match(/\.(png|jpg|jpeg|gif)$/i))
  
  // Ensure dontwaste.jpg is always first if it exists
  const dontWasteIdx = optFiles.indexOf('dontwaste.jpg')
  if (dontWasteIdx > -1) {
    optFiles.splice(dontWasteIdx, 1)
    optFiles.unshift('dontwaste.jpg')
  }

  const imports = optFiles.map((f, i) => `import img${i} from './assets-opt/${f}'`).join('\n')
  const exports = `export const galleryImages = [\n  ${optFiles.map((_, i) => `img${i}`).join(',\n  ')}\n]`

  fs.writeFileSync(outFile, `${imports}\n\n${exports}\n`)
  console.log(`Generated assets.ts with ${optFiles.length} optimized images.`)
}

optimizeImages().catch(console.error)
