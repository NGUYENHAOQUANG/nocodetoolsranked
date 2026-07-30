/**
 * Tìm component, layout và ảnh KHÔNG ai dùng.
 *
 * Đây là loại rác vô hình: xoá một trang hay gỡ một section thì thứ nó từng
 * dùng vẫn nằm nguyên đó, build vẫn xanh, `astro check` vẫn sạch. Vài tháng sau
 * không ai dám xoá vì không chắc còn ai gọi.
 *
 * Script bắt đầu từ MỌI file trong `src/pages/` và `src/content/` (file nội dung
 * MDX cũng import component), lan truyền `import` bắc cầu, rồi báo những gì
 * không nằm trong tập chạm tới được.
 *
 * KHÔNG kiểm component nằm đúng thư mục hay chưa. Luật đó ghi ở CLAUDE.md và
 * người viết code nhìn đường dẫn là thấy — khác hẳn ký tự vô hình hay dàn ý
 * heading. Bản kiểm luật ấy từng tồn tại và đã bỏ: nó cần một bảng
 * `page -> loại trang` khai tay, nên thêm một loại trang mới là nó báo "không
 * trang nào dùng, xoá đi" cho chính component của trang mới đó rồi chặn build.
 * Một bộ kiểm sai vào đúng lúc người ta đang làm kiến trúc thì hại hơn lợi.
 *
 * Chạy: node scripts/check-unused.mjs   (đã gắn vào `npm run check`)
 */
import { readdirSync, readFileSync, statSync } from "node:fs";
import { join, relative, basename, sep } from "node:path";

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
const all = walk(SRC);
const code = all.filter((f) => /\.(astro|mdx|md|ts)$/.test(f));

/** file -> các file nó import (dạng đường dẫn từ `src/`, qua alias `@/`) */
const deps = new Map(
  code.map((f) => [
    rel(f),
    [...readFileSync(f, "utf8").matchAll(/from\s+"@\/([^"]+\.(?:astro|ts))"/g)].map((m) => m[1]),
  ]),
);

/* Điểm vào: route và nội dung. Không khai tay danh sách nào — thêm trang mới là
   nó tự thành điểm vào, nên script không bao giờ lạc hậu so với `src/pages/`. */
const entries = code.map(rel).filter((f) => f.startsWith("pages/") || f.startsWith("content/"));

const reached = new Set();
const visit = (f) => {
  for (const d of deps.get(f) ?? []) {
    if (reached.has(d)) continue;
    reached.add(d);
    visit(d);
  }
};
for (const e of entries) visit(e);

const problems = [];

for (const f of code.map(rel)) {
  if (!f.startsWith("components/") && !f.startsWith("layouts/")) continue;
  if (!reached.has(f)) problems.push(`${f}: khong route hay noi dung nao dung toi`);
}

/* Ảnh: đối chiếu theo TÊN FILE, không theo đường dẫn — schema content trỏ ảnh
   bằng đường dẫn tương đối (`../../assets/...`) nên so nguyên đường dẫn sẽ trượt.

   Quét CẢ `.yaml`: logo brand, ảnh tác giả và ảnh thẻ liên hệ đều khai trong
   file YAML của collection, không nơi nào `import` chúng. Bỏ sót nhóm đó là 17
   ảnh đang dùng bị báo mồ côi — chính script này bắt lỗi của chính nó lúc đầu. */
const text = all
  .filter((f) => /\.(astro|mdx|md|ts|yaml|yml|css)$/.test(f))
  .map((f) => readFileSync(f, "utf8"))
  .join("\n");
for (const a of all.filter((f) => rel(f).startsWith("assets/"))) {
  if (!text.includes(basename(a))) problems.push(`${rel(a)}: khong noi nao nhac toi`);
}

if (problems.length) {
  console.error(`\ncheck-unused: ${problems.length} thu khong ai dung\n`);
  for (const p of problems) console.error("  " + p);
  console.error("");
  process.exit(1);
}

const n = code
  .map(rel)
  .filter((f) => f.startsWith("components/") || f.startsWith("layouts/")).length;
const imgs = all.filter((f) => rel(f).startsWith("assets/")).length;
console.log(`check-unused: ${n} component/layout va ${imgs} anh — deu co noi dung.`);
