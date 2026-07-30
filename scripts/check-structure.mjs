/**
 * Kiểm luật xếp thư mục của `src/components/`.
 *
 *   Component nằm ở thư mục của LOẠI TRANG duy nhất dùng nó. Dùng ở nhiều loại
 *   trang thì lên tầng chung gần nhất — `article/` nếu là trang review + bài
 *   blog, `layout/` nếu gần như mọi trang.
 *
 * Script lan truyền `import` từ mỗi page (và từ mỗi file nội dung MDX, vì MDX
 * cũng import component) để ra tập loại trang mà mỗi component thực sự xuất
 * hiện, rồi đối chiếu với thư mục đang chứa nó.
 *
 * Vì sao cần: đây là luật DUY NHẤT về cấu trúc mà người viết code có thể vi
 * phạm mà không có gì báo — `astro check` chỉ quan tâm đường dẫn import có
 * đúng không, chứ không quan tâm file nằm ở đâu. Một luật không kiểm được thì
 * trôi lệch, đúng bài học của quy ước ASCII (xem `check-content.mjs`).
 *
 * Chạy: node scripts/check-structure.mjs   (đã gắn vào `npm run check`)
 */
import { readdirSync, readFileSync, statSync } from "node:fs";
import { join, relative, sep } from "node:path";

/**
 * Điểm vào -> LOẠI TRANG.
 *
 * `site` nghĩa là "trang dùng khung chung, không sở hữu component riêng nào":
 * 404 và bốn trang nội dung phẳng chỉ ghép từ `layout/`. Trang review và bài
 * blog cùng ánh xạ về `article` vì chúng dùng chung một bộ component.
 */
const PAGE_TYPE = {
  "pages/[...toplist].astro": "toplist",
  "pages/reviews/[slug].astro": "article",
  "pages/knowledge/[slug].astro": "article",
  "pages/reviews/index.astro": "reviews",
  "pages/knowledge/index.astro": "knowledge",
  "pages/contact.astro": "contact",
  "pages/[page].astro": "site",
  "pages/404.astro": "site",
};

/** File nội dung cũng import component — thân MDX của trang nào thì tính vào loại đó */
const CONTENT_TYPE = (rel) =>
  rel.startsWith("content/toplists/")
    ? "toplist"
    : rel.startsWith("content/reviews/") || rel.startsWith("content/posts/")
      ? "article"
      : rel.startsWith("content/pages/")
        ? "site"
        : null;

const SRC = "src";

function walk(dir, out = []) {
  for (const name of readdirSync(dir)) {
    const p = join(dir, name);
    if (statSync(p).isDirectory()) walk(p, out);
    else out.push(p);
  }
  return out;
}

const rel = (p) => relative(SRC, p).split(sep).join("/");
const files = walk(SRC).filter((f) => /\.(astro|mdx)$/.test(f));

/** file -> component nó import (đường dẫn kiểu "components/toplist/PartnerCard.astro") */
const deps = new Map(
  files.map((f) => [
    rel(f),
    [...readFileSync(f, "utf8").matchAll(/from\s+"@\/([^"]+\.astro)"/g)].map((m) => m[1]),
  ]),
);

/** component -> tập loại trang nó xuất hiện */
const reach = new Map();
function visit(file, type, seen = new Set()) {
  if (seen.has(file)) return;
  seen.add(file);
  for (const dep of deps.get(file) ?? []) {
    if (!reach.has(dep)) reach.set(dep, new Set());
    reach.get(dep).add(type);
    visit(dep, type, seen);
  }
}
for (const [entry, type] of Object.entries(PAGE_TYPE)) if (deps.has(entry)) visit(entry, type);
for (const f of files) {
  const type = CONTENT_TYPE(rel(f));
  if (type) visit(rel(f), type);
}

/** Một loại trang -> thư mục của nó. `site` không có thư mục riêng. */
const FOLDER_OF = {
  toplist: "toplist",
  article: "article",
  reviews: "reviews",
  knowledge: "knowledge",
  contact: "contact",
};

const problems = [];
for (const f of files.map(rel).filter((f) => f.startsWith("components/"))) {
  const folder = f.split("/")[1];
  const types = reach.get(f);

  if (!types || types.size === 0) {
    problems.push(`${f}: khong trang nao dung -> xoa di`);
    continue;
  }
  // Nhiều loại trang, hoặc chạm tới nhóm `site` => khung chung
  const expected = types.size > 1 || types.has("site") ? "layout" : FOLDER_OF[[...types][0]];
  if (!expected) {
    problems.push(`${f}: loai trang "${[...types][0]}" chua co thu muc — bo sung FOLDER_OF`);
  } else if (folder !== expected) {
    problems.push(
      `${f}: dung o [${[...types].sort().join(", ")}] -> phai nam o "components/${expected}/"`,
    );
  }
}

if (problems.length) {
  console.error(`\ncheck-structure: ${problems.length} component sai thu muc\n`);
  for (const p of problems) console.error("  " + p);
  console.error("");
  process.exit(1);
}

const count = {};
for (const f of files.map(rel).filter((f) => f.startsWith("components/"))) {
  const d = f.split("/")[1];
  count[d] = (count[d] ?? 0) + 1;
}
const summary = Object.entries(count)
  .sort((a, b) => b[1] - a[1])
  .map(([d, n]) => `${d} ${n}`)
  .join(", ");
console.log(`check-structure: ${summary} — dung thu muc.`);
