import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const rootDir = path.resolve(__dirname, '..');
const distDir = process.argv[2] ? path.resolve(process.argv[2]) : path.resolve(rootDir, 'dist');
const sitemapPath = path.join(distDir, 'sitemap-0.xml');

// Chuyển đổi ngày sang chuẩn W3C ISO 8601 (YYYY-MM-DDTHH:mm:ss+00:00)
function formatW3CDate(dateInput) {
  if (!dateInput) return null;
  const d = new Date(dateInput);
  if (isNaN(d.getTime())) return null;
  const pad = (n) => n.toString().padStart(2, '0');
  const year = d.getUTCFullYear();
  const month = pad(d.getUTCMonth() + 1);
  const day = pad(d.getUTCDate());
  const hours = pad(d.getUTCHours());
  const minutes = pad(d.getUTCMinutes());
  const seconds = pad(d.getUTCSeconds());
  return `${year}-${month}-${day}T${hours}:${minutes}:${seconds}+00:00`;
}

// Đọc thông tin ngày từ frontmatter Markdown (.md và .mdx)
function extractFrontmatter(content) {
  const match = content.match(/^---\r?\n([\s\S]*?)\r?\n---/);
  if (!match) return {};
  const yamlText = match[1];
  const result = {};
  for (const line of yamlText.split('\n')) {
    const pubMatch = line.match(/^published:\s*["']?([^"'\r\n]+)["']?/);
    if (pubMatch) result.published = pubMatch[1].trim();
    const updMatch = line.match(/^updated:\s*["']?([^"'\r\n]+)["']?/);
    if (updMatch) result.updated = updMatch[1].trim();
    const dateMatch = line.match(/^date:\s*["']?([^"'\r\n]+)["']?/);
    if (dateMatch) result.date = dateMatch[1].trim();
  }
  return result;
}

// Thu thập bản đồ ngày cho tất cả URL
function getUrlDateMap() {
  const urlMap = new Map();

  // 1. site-dates.yaml (Trang chủ, danh mục, contact)
  const siteDatesPath = path.join(rootDir, 'src/content/site-dates.yaml');
  if (fs.existsSync(siteDatesPath)) {
    const content = fs.readFileSync(siteDatesPath, 'utf8');
    let currentSection = null;
    for (const line of content.split('\n')) {
      const sectionMatch = line.match(/^([a-z0-9_-]+):/);
      if (sectionMatch) {
        currentSection = sectionMatch[1];
      } else if (currentSection) {
        const updMatch = line.match(/updated:\s*["']?([^"'\r\n]+)["']?/);
        const pubMatch = line.match(/published:\s*["']?([^"'\r\n]+)["']?/);
        const rawDate = updMatch ? updMatch[1] : (pubMatch ? pubMatch[1] : null);
        if (rawDate) {
          const dateStr = formatW3CDate(rawDate.trim());
          if (currentSection === 'home') urlMap.set('/', dateStr);
          if (currentSection === 'knowledge') urlMap.set('/knowledge/', dateStr);
          if (currentSection === 'reviews') urlMap.set('/reviews/', dateStr);
          if (currentSection === 'contact') urlMap.set('/contact/', dateStr);
        }
      }
    }
  }

  // 2. Bài viết (posts -> /knowledge/[slug]/)
  const postsDir = path.join(rootDir, 'src/content/posts');
  if (fs.existsSync(postsDir)) {
    for (const file of fs.readdirSync(postsDir)) {
      if (file.endsWith('.md') || file.endsWith('.mdx')) {
        const slug = file.replace(/\.mdx?$/, '');
        const fm = extractFrontmatter(fs.readFileSync(path.join(postsDir, file), 'utf8'));
        const dateStr = formatW3CDate(fm.updated || fm.published || fm.date);
        if (dateStr) urlMap.set(`/knowledge/${slug}/`, dateStr);
      }
    }
  }

  // 3. Đánh giá (reviews -> /reviews/[slug]/)
  const reviewsDir = path.join(rootDir, 'src/content/reviews');
  if (fs.existsSync(reviewsDir)) {
    for (const file of fs.readdirSync(reviewsDir)) {
      if (file.endsWith('.md') || file.endsWith('.mdx')) {
        const slug = file.replace(/\.mdx?$/, '');
        const fm = extractFrontmatter(fs.readFileSync(path.join(reviewsDir, file), 'utf8'));
        const dateStr = formatW3CDate(fm.updated || fm.published);
        if (dateStr) urlMap.set(`/reviews/${slug}/`, dateStr);
      }
    }
  }

  // 4. Trang ngách (toplists)
  const toplistsDir = path.join(rootDir, 'src/content/toplists');
  if (fs.existsSync(toplistsDir)) {
    for (const file of fs.readdirSync(toplistsDir)) {
      if (file.endsWith('.md') || file.endsWith('.mdx') || file.endsWith('.yaml')) {
        const slug = file.replace(/\.(mdx?|yaml)$/, '');
        const content = fs.readFileSync(path.join(toplistsDir, file), 'utf8');
        const fm = extractFrontmatter(content);
        const dateStr = formatW3CDate(fm.updated || fm.published);
        if (dateStr) {
          const urlPath = slug === 'home' ? '/' : `/${slug}/`;
          urlMap.set(urlPath, dateStr);
        }
      }
    }
  }

  // 5. Trang đơn (pages)
  const pagesDir = path.join(rootDir, 'src/content/pages');
  if (fs.existsSync(pagesDir)) {
    for (const file of fs.readdirSync(pagesDir)) {
      if (file.endsWith('.md') || file.endsWith('.mdx')) {
        const slug = file.replace(/\.mdx?$/, '');
        const fm = extractFrontmatter(fs.readFileSync(path.join(pagesDir, file), 'utf8'));
        const dateStr = formatW3CDate(fm.updated || fm.published);
        if (dateStr) urlMap.set(`/${slug}/`, dateStr);
      }
    }
  }

  return urlMap;
}

// Xử lý và sắp xếp sitemap
function processSitemap() {
  if (!fs.existsSync(sitemapPath)) {
    console.warn(`[process-sitemap] File không tồn tại: ${sitemapPath}`);
    return;
  }

  const dateMap = getUrlDateMap();
  const rawXml = fs.readFileSync(sitemapPath, 'utf8');
  const urlBlocks = rawXml.match(/<url>[\s\S]*?<\/url>/g) || [];

  const processedUrls = urlBlocks.map((block) => {
    const locMatch = block.match(/<loc>(.*?)<\/loc>/);
    if (!locMatch) return { block, dateStr: '1970-01-01T00:00:00+00:00' };

    const urlObj = new URL(locMatch[1]);
    const pathname = urlObj.pathname.endsWith('/') ? urlObj.pathname : `${urlObj.pathname}/`;
    let dateStr = dateMap.get(pathname) || dateMap.get(pathname.replace(/\/$/, '')) || '2026-08-01T10:00:00+00:00';

    let newBlock = block;
    if (/<lastmod>.*?<\/lastmod>/.test(newBlock)) {
      newBlock = newBlock.replace(/<lastmod>.*?<\/lastmod>/, `<lastmod>${dateStr}</lastmod>`);
    } else {
      newBlock = newBlock.replace('</url>', `<lastmod>${dateStr}</lastmod></url>`);
    }

    return { block: newBlock, dateStr };
  });

  // Sắp xếp giảm dần theo mốc ngày lastmod
  processedUrls.sort((a, b) => new Date(b.dateStr).getTime() - new Date(a.dateStr).getTime());

  const headerMatch = rawXml.match(/^[\s\S]*?<urlset[^>]*>/);
  const header = headerMatch ? headerMatch[0] : '<?xml version="1.0" encoding="UTF-8"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">';
  const footer = '</urlset>';

  const newSitemapContent = `${header}${processedUrls.map((u) => u.block.trim()).join('')}${footer}\n`;
  fs.writeFileSync(sitemapPath, newSitemapContent, 'utf8');
  console.log(`[process-sitemap] Đã cập nhật & sắp xếp ${processedUrls.length} URLs sitemap theo ngày giảm dần.`);
}

processSitemap();
