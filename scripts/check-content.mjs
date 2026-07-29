/**
 * Kiểm hai quy ước nội dung mà `astro check` không kiểm được.
 *
 * 1. NỘI DUNG HIỂN THỊ CHỈ DÙNG ASCII
 *    Không nháy cong, không em dash, không ellipsis. Lý do (theo thứ tự):
 *      - gõ được: quy ước mà bàn phím không tạo ra được thì chắc chắn trôi lệch
 *      - kiểm được bằng máy: chính là script này
 *      - diệt cả một lớp lỗi vô hình (NBSP, zero-width, các biến thể nháy cong)
 *    Ngoại lệ: comment (không render), và các ký hiệu ở ALLOWED.
 *
 * 2. URL TRẦN PHẢI ĐƯỢC BỌC
 *    `gfm` bật (mặc định Astro) nên URL trần trong Markdown TỰ thành thẻ <a>.
 *    Trên site affiliate đó là rò traffic ra ngoài mà không ai biết — lỗi âm
 *    thầm, không có gì báo. Muốn URL ở lại dạng chữ thì bọc `{'https://...'}`;
 *    muốn nó là link thì viết `[chữ](https://...)`.
 *
 * Chạy: node scripts/check-content.mjs   (đã gắn vào `npm run check`)
 */
import { readdirSync, readFileSync, statSync } from "node:fs";
import { join, relative } from "node:path";

/** Ký hiệu được phép ngoài ASCII — mang nghĩa pháp lý, không phải trang trí */
const ALLOWED = new Set(["©", "®", "™"]);

const SRC = "src";
const CONTENT = join(SRC, "content");

function walk(dir, out = []) {
  for (const name of readdirSync(dir)) {
    const p = join(dir, name);
    if (statSync(p).isDirectory()) walk(p, out);
    else out.push(p);
  }
  return out;
}

/** Bỏ những phần KHÔNG render ra trang, để chỉ còn nội dung hiển thị */
function renderedTextOf(file, src) {
  let s = src;

  /* Bỏ COMMENT TRƯỚC, rồi mới bỏ <style>/<script>.
     Thứ tự này bắt buộc: có comment chứa nguyên văn chữ "<style>" (nói về việc
     KHÔNG đặt style ở đó), nên nếu lọc <style> trước thì regex sẽ ăn từ chữ đó
     tới thẻ </style> thật ở cuối file, nuốt luôn dấu đóng comment. */
  s = s.replace(/\{\s*\/\*[\s\S]*?\*\/\s*\}/g, "");
  s = s.replace(/\/\*[\s\S]*?\*\//g, "");
  s = s.replace(/^\s*\/\/.*$/gm, "");
  /* Thông báo lỗi cho lập trình viên là code, không phải nội dung trang */
  s = s.replace(/new Error\((["'`])[\s\S]*?\1\)/g, "");

  if (file.endsWith(".astro")) {
    /* KHÔNG cắt cả frontmatter: nó chứa cả chuỗi được render ra trang (giá trị
       prop mặc định, nhãn dựng sẵn). */
    s = s.replace(/<style[\s\S]*?<\/style>/g, "");
    s = s.replace(/<script[\s\S]*?<\/script>/g, "");
  }
  if (file.endsWith(".yaml") || file.endsWith(".yml")) {
    s = s.replace(/^\s*#.*$/gm, "");
  }
  if (file.endsWith(".mdx") || file.endsWith(".md")) {
    // frontmatter là YAML: bỏ dòng comment `#` trong đó (chỉ trong đó, vì `#`
    // ở thân bài là tiêu đề Markdown)
    s = s.replace(/^(---\r?\n)([\s\S]*?)(\r?\n---)/, (_, open, body, close) =>
      open + body.replace(/^\s*#.*$/gm, "") + close,
    );
  }
  return s;
}

const problems = [];

for (const file of walk(SRC)) {
  if (!/\.(astro|mdx|md|yaml|yml)$/.test(file)) continue;
  const rel = relative(".", file).split("\\").join("/");
  const src = readFileSync(file, "utf8");
  const text = renderedTextOf(file, src);

  // --- luật 1: ASCII ---
  const seen = new Map();
  for (const ch of text) {
    if (ch.codePointAt(0) > 127 && !ALLOWED.has(ch)) seen.set(ch, (seen.get(ch) || 0) + 1);
  }
  if (seen.size) {
    const list = [...seen].map(([c, n]) => `${JSON.stringify(c)}x${n}`).join(" ");
    problems.push(`${rel}: ky tu ngoai ASCII trong noi dung hien thi -> ${list}`);
  }

  // --- luật 2: URL trần (chỉ trong src/content) ---
  if (file.startsWith(CONTENT)) {
    const lines = text.split(/\r?\n/);
    lines.forEach((line, i) => {
      for (const m of line.matchAll(/https?:\/\/\S+/g)) {
        const before = line.slice(0, m.index);
        const inMarkdownLink = /\]\($/.test(before);
        const inExpression = /\{\s*['"`]$/.test(before);
        const inYamlValue = /^\s*[\w-]+:\s*["']?$/.test(before);
        if (!inMarkdownLink && !inExpression && !inYamlValue) {
          problems.push(`${rel}:${i + 1}: URL tran chua boc -> ${m[0].slice(0, 60)}`);
        }
      }
    });
  }
}

if (problems.length) {
  console.error(`\ncheck-content: ${problems.length} van de\n`);
  for (const p of problems) console.error("  " + p);
  console.error("");
  process.exit(1);
}
console.log("check-content: noi dung dat ca hai quy uoc.");
