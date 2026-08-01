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

/**
 * Ký tự ngoài ASCII được phép.
 *
 * Hiện chỉ có ba ký hiệu mang nghĩa pháp lý. Ngoại lệ hợp lệ còn lại là TÊN
 * RIÊNG viết đúng chính tả của nó (workspace CLAUDE.md mục 5): brand thật tên
 * `Café X` thì viết đúng vậy, vì tên riêng là DỮ LIỆU chứ không phải lựa chọn
 * kiểu chữ. Gặp ca đó thì thêm ký tự vào đây kèm một dòng lý do — đừng bẻ chữ
 * cho vừa script.
 */
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
  /* Thông báo lỗi cho lập trình viên là code, không phải nội dung trang.
     `\s*` sau dấu ngoặc: nhiều chỗ viết `new Error(` rồi mới xuống dòng tới chuỗi. */
  s = s.replace(/new Error\(\s*(["'`])[\s\S]*?\1\s*,?\s*\)/g, "");

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
    s = s.replace(
      /^(---\r?\n)([\s\S]*?)(\r?\n---)/,
      (_, open, body, close) => open + body.replace(/^\s*#.*$/gm, "") + close,
    );
  }
  return s;
}

const problems = [];

for (const file of walk(SRC)) {
  /* `.ts` cũng phải quét: `config/site.ts` giữ tiêu đề và mô tả mặc định — tức
     là chuỗi RENDER RA TRANG. Bỏ sót nó nên một em dash sống sót ở đó và ship
     ra 8 trang, trong khi mọi chỗ khác đã đổi sang gạch nối. */
  if (!/\.(astro|mdx|md|yaml|yml|ts)$/.test(file)) continue;
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
    problems.push(
      `${rel}: ky tu ngoai ASCII trong noi dung hien thi -> ${list}\n` +
        `      Neu la TEN RIENG viet dung chinh ta (vd "Cafe X"), them ky tu vao ALLOWED\n` +
        `      trong scripts/check-content.mjs. Con lai thi doi ve ASCII.`,
    );
  }

  // --- luật 2: URL trần (chỉ trong src/content) ---
  if (file.startsWith(CONTENT)) {
    /* Bỏ khối code trước khi quét: gfm KHÔNG tự tạo link bên trong ``` hay `…`,
       nên URL ở đó vốn đã an toàn. Giữ số dòng bằng cách thay bằng dòng trống. */
    const scanned = text
      .replace(/^```[\s\S]*?^```/gm, (b) => b.replace(/[^\n]/g, ""))
      .replace(/`[^`\n]*`/g, (b) => " ".repeat(b.length))
      /* Xoá TRỌN link Markdown `[chữ](url)` — cả phần chữ lẫn phần đích.
         Bản trước chỉ xét hai ký tự đứng ngay trước URL có phải `](` không, nên
         `[http://x](http://x)` bị báo nhầm: ở đó URL nằm trong phần CHỮ. Đã chạy
         thẳng processor của Astro để kiểm — CommonMark cấm link lồng link nên
         phần chữ KHÔNG bị autolink, kết quả ra đúng một thẻ <a>. */
      .replace(/\[[^\]\n]*\]\([^)\n]*\)/g, (b) => " ".repeat(b.length));

    /* HAI dạng gfm tự biến thành link. Đã test trên Sätteri, không đoán:
         `http://x`  -> <a href="http://x">
         `www.x.eu`  -> <a href="http://www.x.eu">   <- KHÔNG có scheme, dễ sót nhất
       Email thì CỐ Ý không bắt: `mailto:` tự sinh là thứ workspace muốn giữ ở
       trang liên hệ. */
    const AUTOLINKED = /(?:https?:\/\/|\bwww\.)\S+/g;

    scanned.split(/\r?\n/).forEach((line, i) => {
      for (const m of line.matchAll(AUTOLINKED)) {
        const before = line.slice(0, m.index);
        /* Ba cách khai còn lại đã an toàn — gfm không đụng tới */
        const inExpression = /\{\s*['"`]$/.test(before); // {'url'} — giữ dạng chữ
        const inYamlValue = /^\s*[\w-]+:\s*["']?$/.test(before); // key: url
        const inAttribute = /\s(?:href|src|content|action)=["']?$/.test(before); // <a href="url">
        if (!inExpression && !inYamlValue && !inAttribute) {
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
