import { initializeApp } from 'firebase/app';
import { getFirestore, getDocs, collection } from 'firebase/firestore';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function generateSitemap() {
  console.log('Generating dynamic case sitemap.xml...');

  try {
    // Read Firebase Config
    const configPath = path.resolve(__dirname, '../firebase-applet-config.json');
    if (!fs.existsSync(configPath)) {
        console.warn("No firebase-applet-config.json found! Skipping sitemap generation.");
        process.exit(0);
    }
    
    const config = JSON.parse(fs.readFileSync(configPath, 'utf-8'));
    
    // Initialize Firebase Admin (Client SDK behaves same for public reads)
    const app = initializeApp(config);
    const db = getFirestore(app, config.firestoreDatabaseId);

    // Fetch Cases
    const querySnapshot = await getDocs(collection(db, "cases"));
    
    const baseUrl = 'https://forenclue.in';

    let xml = `<?xml version="1.0" encoding="UTF-8"?>\n`;
    xml += `<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"\n`;
    xml += `        xmlns:image="http://www.google.com/schemas/sitemap-image/1.1">\n`;

    // Static pages
    const currentIsoDate = new Date().toISOString();
    xml += `  <url>\n`;
    xml += `    <loc>${baseUrl}/</loc>\n`;
    xml += `    <lastmod>${currentIsoDate}</lastmod>\n`;
    xml += `    <changefreq>daily</changefreq>\n`;
    xml += `    <priority>1.0</priority>\n`;
    xml += `  </url>\n`;

    xml += `  <url>\n`;
    xml += `    <loc>${baseUrl}/cases</loc>\n`;
    xml += `    <lastmod>${currentIsoDate}</lastmod>\n`;
    xml += `    <changefreq>daily</changefreq>\n`;
    xml += `    <priority>0.9</priority>\n`;
    xml += `  </url>\n`;

    let casesFound = 0;
    
    querySnapshot.forEach((doc) => {
      const data = doc.data();
      // Skip draft or unpublished cases logic (assuming only real cases for public)
      if (data.status === 'draft') return;
      casesFound++;

      xml += `  <url>\n`;
      xml += `    <loc>${baseUrl}/cases?case=${doc.id}</loc>\n`;
      xml += `    <lastmod>${currentIsoDate}</lastmod>\n`;
      xml += `    <changefreq>weekly</changefreq>\n`;
      xml += `    <priority>0.8</priority>\n`;

      // Main image
      if (data.image) {
        xml += `    <image:image>\n`;
        // ensure valid xml entities
        const safeUrl = data.image.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
        xml += `      <image:loc>${safeUrl}</image:loc>\n`;
        if (data.title) {
            const safeTitle = data.title.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
            xml += `      <image:title>${safeTitle}</image:title>\n`;
        }
        xml += `    </image:image>\n`;
      }

      // Content images
      if (Array.isArray(data.contentImages)) {
        data.contentImages.forEach((img) => {
          let url = "";
          let caption = "";
          if (typeof img === 'string') {
            url = img;
          } else if (img && img.url) {
            url = img.url;
            caption = img.caption || "";
          }

          if (url) {
            xml += `    <image:image>\n`;
            const safeUrl = url.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
            xml += `      <image:loc>${safeUrl}</image:loc>\n`;
            if (caption) {
                const safeCaption = caption.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
                xml += `      <image:caption>${safeCaption}</image:caption>\n`;
            } else if (data.title) {
                const safeTitle = data.title.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
                xml += `      <image:title>${safeTitle} - Case File Evidence</image:title>\n`;
            }
            xml += `    </image:image>\n`;
          }
        });
      }

      xml += `  </url>\n`;
    });

    xml += `</urlset>`;

    const publicDir = path.resolve(__dirname, '../public');
    if (!fs.existsSync(publicDir)) {
      fs.mkdirSync(publicDir, { recursive: true });
    }

    fs.writeFileSync(path.join(publicDir, 'sitemap.xml'), xml);
    console.log(`✅ successfully generated sitemap.xml with ${casesFound} cases`);

    process.exit(0);

  } catch (error) {
    console.warn("Failed to generate sitemap due to offline or connection error:", error.message || error);
    process.exit(0);
  }
}

generateSitemap();
