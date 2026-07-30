/**
 * Kiểm HTML của bản build theo 13 luật mà `astro check` không thấy được.
 *
 * `astro check` chỉ kiểm KIỂU. Nó không biết một trang có hai `<h1>`, hay
 * heading nhảy từ h1 xuống h4, hay ô nhập không có nhãn. Những thứ đó chỉ lộ ra
 * trên HTML đã render, nên script này chạy trên `dist/` chứ không phải `src/`.
 *
 * Vì sao cần: đợt chuẩn hoá HTML tìm ra 42 vấn đề, phần lớn là di chứng chép từ
 * trang mẫu (hai cây markup cho hai kích thước màn -> hai `<h1>`; `<h3>` dùng
 * cho khẩu hiệu quảng cáo; `<div>` + onClick thay cho `<a>`). Sửa xong mà không
 * có gì canh thì lần thêm nội dung sau sẽ trôi lại y như cũ — đúng bài học của
 * quy ước ASCII, xem `check-content.mjs`.
 *
 * Chạy: node scripts/check-html.mjs   (đã gắn vào `npm run build`, SAU astro build)
 */
import { readdirSync, readFileSync, statSync } from "node:fs";
import { join, relative, sep } from "node:path";

/** Mặc định `dist/`; nhận tham số để soi bản build khác (tiện lúc so trước/sau). */
const DIST = process.argv[2] ?? "dist";

/** Thuộc tính trình bày đã bị bỏ khỏi HTML5 */
const OBSOLETE = [
  "align",
  "bgcolor",
  "border",
  "cellpadding",
  "cellspacing",
  "valign",
  "hspace",
  "vspace",
  "frameborder",
  "marginwidth",
  "nowrap",
  "clear",
  "compact",
];

/** Thẻ block không được nằm trong `<p>` — trình duyệt sẽ tự đóng `<p>` và phá layout */
const BLOCK_IN_P = ["div", "ul", "ol", "table", "section", "h1", "h2", "h3", "p"];

function walk(dir, out = []) {
  for (const name of readdirSync(dir)) {
    const p = join(dir, name);
    if (statSync(p).isDirectory()) walk(p, out);
    else out.push(p);
  }
  return out;
}

const found = {};
const add = (key, msg) => (found[key] ??= []).push(msg);

for (const file of walk(DIST).filter((f) => f.endsWith(".html"))) {
  const rel = relative(DIST, file).split(sep).join("/");
  const html = readFileSync(file, "utf8");
  /* Chỉ xét trong <body>: <head> có <title> và JSON-LD, không phải nội dung trang */
  const body = html.slice(html.indexOf("<body"));

  // 1. Đúng MỘT <h1> mỗi trang
  const h1 = (body.match(/<h1[\s>]/g) || []).length;
  if (h1 !== 1) add("h1", `${rel}: ${h1} the <h1>`);

  // 2. Heading không nhảy cấp (h2 -> h4 là nhảy, h4 -> h2 thì không)
  const levels = [...body.matchAll(/<h([1-6])[\s>]/g)].map((m) => +m[1]);
  for (let i = 1; i < levels.length; i++) {
    if (levels[i] > levels[i - 1] + 1) add("skip", `${rel}: h${levels[i - 1]} -> h${levels[i]}`);
  }

  // 3. Thuộc tính đã lỗi thời
  for (const attr of OBSOLETE) {
    const n = (body.match(new RegExp(`<\\w+[^>]*\\s${attr}\\s*=`, "g")) || []).length;
    if (n) add("obsolete", `${rel}: ${attr}= x${n}`);
  }

  // 4. <button> luôn phải có type (mặc định là "submit", gửi form ngoài ý muốn)
  for (const m of body.matchAll(/<button\b[^>]*>/g)) {
    if (!/\stype\s*=/.test(m[0])) add("btn-type", `${rel}: ${m[0].slice(0, 70)}`);
  }

  // 5. <img> luôn phải có alt (rỗng nếu là ảnh trang trí)
  for (const m of body.matchAll(/<img\b[^>]*>/g)) {
    /* `\salt[\s=>]` chứ không phải `\salt\s*=`: `alt=""` được Astro phát ra thành
       thuộc tính TRẦN `alt`, hợp lệ HTML5. Bản đầu của rule này báo nhầm 6 chỗ. */
    if (!/\salt[\s=>]/.test(m[0])) add("img-alt", `${rel}: ${m[0].slice(0, 70)}`);
    /* Trình đọc màn hình đã tự thông báo "hình ảnh", nên viết lại trong alt là
       thừa. Bắt được `alt="Author image"` mà mắt thường đọc qua thấy bình thường. */
    const alt = m[0].match(/\salt="([^"]*)"/);
    if (alt && /\b(image|photo|picture|graphic)\b/i.test(alt[1])) {
      add("img-alt-thua", `${rel}: alt="${alt[1].slice(0, 40)}"`);
    }
  }

  // 5b. Heading rỗng — nhất là khi có id để `aria-labelledby` trỏ vào
  for (const m of body.matchAll(/<h([1-6])\b[^>]*>([\s\S]*?)<\/h\1>/g)) {
    if (!m[2].replace(/<[^>]+>/g, "").trim()) add("heading-rong", `${rel}: <h${m[1]}> rong`);
  }

  // 6. <a> không href thì không phải link — điều hướng phải bấm được bằng bàn phím
  for (const m of body.matchAll(/<a\b[^>]*>/g)) {
    if (!/\shref\s*=/.test(m[0])) add("a-nohref", `${rel}: ${m[0].slice(0, 70)}`);
  }

  // 7. target="_blank" phải kèm noopener (trang đích chạm được window.opener)
  for (const m of body.matchAll(/<a\b[^>]*target="_blank"[^>]*>/g)) {
    if (!/rel="[^"]*noopener/.test(m[0])) add("rel", `${rel}: ${m[0].slice(0, 80)}`);
  }

  // 8. Ô nhập phải có nhãn. placeholder KHÔNG phải nhãn: nó biến mất khi gõ.
  const labelFor = new Set([...body.matchAll(/<label\b[^>]*\sfor="([^"]+)"/g)].map((x) => x[1]));
  for (const m of body.matchAll(/<(input|select|textarea)\b[^>]*>/g)) {
    if (/aria-label|aria-labelledby|\stype="(hidden|submit|button)"/.test(m[0])) continue;
    const id = m[0].match(/\sid="([^"]+)"/);
    if (id && labelFor.has(id[1])) continue;
    add("label", `${rel}: ${m[0].slice(0, 70)}`);
  }

  /* 8b. Skip link phải có ĐÍCH. BaseLayout phát `<a href="#main-content">` cho
     mọi trang, nhưng `<main>` do từng page tự viết nên id dễ quên — và quên thì
     skip link nhảy vào hư không mà không có gì báo. */
  if (/href="#main-content"/.test(body) && !/<main\b[^>]*\sid="main-content"/.test(body)) {
    add("skip-dich", `${rel}: co skip link nhung khong co <main id="main-content">`);
  }

  // 9. <p> không được chứa thẻ block
  for (const m of body.matchAll(/<p\b[^>]*>([\s\S]*?)<\/p>/g)) {
    for (const tag of BLOCK_IN_P) {
      if (new RegExp(`<${tag}[\\s>]`).test(m[1])) add("p-block", `${rel}: <p> chua <${tag}>`);
    }
  }

  // 10. <ul>/<ol> chỉ được chứa <li>
  for (const m of body.matchAll(/<(ul|ol)\b[^>]*>([\s\S]*?)<\/\1>/g)) {
    const inner = m[2].replace(/<li[\s\S]*?<\/li>/g, "").replace(/<!--[\s\S]*?-->/g, "");
    if (/<\w/.test(inner)) add("list-child", `${rel}: <${m[1]}> chua ${inner.match(/<\w+/)[0]}>`);
  }
}

const LABEL = {
  h1: "So <h1> khac 1",
  skip: "Heading nhay cap",
  obsolete: "Thuoc tinh loi thoi",
  "btn-type": "<button> thieu type",
  "img-alt": "<img> thieu alt",
  "img-alt-thua": 'alt lap lai chu "image"/"photo"',
  "heading-rong": "Heading khong co chu",
  "a-nohref": "<a> khong href",
  rel: 'target="_blank" thieu rel=noopener',
  label: "Form control thieu nhan",
  "skip-dich": "Skip link khong co dich #main-content",
  "p-block": "<p> chua the block",
  "list-child": "<ul>/<ol> chua the khong phai <li>",
};

const problems = Object.entries(LABEL).flatMap(([key, label]) => {
  const items = found[key];
  return items ? [[label, [...new Set(items)]]] : [];
});

if (problems.length) {
  const total = problems.reduce((n, [, items]) => n + items.length, 0);
  console.error(`\ncheck-html: ${total} van de\n`);
  for (const [label, items] of problems) {
    console.error(`  ${label} - ${items.length} cho`);
    for (const item of items.slice(0, 10)) console.error(`     ${item}`);
    if (items.length > 10) console.error(`     ... con ${items.length - 10}`);
  }
  console.error("");
  process.exit(1);
}

console.log("check-html: HTML dat ca 13 luat.");
