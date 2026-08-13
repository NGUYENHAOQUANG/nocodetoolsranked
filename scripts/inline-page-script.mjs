/**
 * Nhúng THẲNG chunk JS của Astro vào HTML, thay vì để nó là một file `/_astro/*.js` rời.
 *
 * Vì sao cần: insight "Network dependency tree" của Lighthouse 13 KHÔNG chấm theo thời gian
 * mà chấm theo ĐỘ DÀI CHUỖI. Đọc source `NetworkDependencyTree.ts` của DevTools:
 *
 *     if (path.length >= 2) { fail = true; }
 *
 * `path[0]` luôn là chính trang HTML, nên chỉ cần trang có ĐÚNG MỘT subresource "tới hạn" là
 * chuỗi dài 2 và insight đỏ. "Tới hạn" = `isHighPriority || isBlocking`, sau khi đã loại
 * ảnh, XHR/fetch, iframe và MỌI request sinh từ `<link rel=preload>`.
 *
 * Đo trên repo này (Lighthouse 13.4.1, `astro preview`): 5 file font đều High nhưng THOÁT vì
 * `astro:fonts` preload chúng; CSS đã nhúng sẵn nhờ `build.inlineStylesheets: 'always'`. Còn
 * lại đúng một thứ: `<script type="module" src="/_astro/page.*.js">` — script prefetch mà
 * `prefetch.prefetchAll` sinh ra. `type="module"` được Chrome tải ở mức High, nên nó tới hạn.
 *
 * Astro TỰ nhúng script nhỏ, nhưng chỉ với script viết trong file `.astro`
 * (`plugin-scripts.js` chặn ở `discoveredScripts.has(facadeModuleId)`). Script prefetch đi
 * đường `injectScript('page', ...)` nên không bao giờ rơi vào nhánh đó, dù nó chỉ 2,4 KB —
 * dưới xa ngưỡng 4096 mà chính Astro dùng.
 *
 * Cái giá: JS không cache riêng được giữa các trang. Đúng đánh đổi đã chấp nhận cho CSS ở
 * `build.inlineStylesheets`, và ở đây còn rẻ hơn — 2,4 KB cho mỗi trang, đổi lấy một lượt đi
 * về mạng bị xoá hẳn khỏi đường tới hạn.
 *
 * Luật này CHỈ nhúng chunk tự đứng được một mình. Chunk có `import` là chunk trỏ sang chunk
 * khác bằng đường dẫn TƯƠNG ĐỐI; nhúng vào HTML thì đường đó phân giải theo URL của TRANG
 * chứ không theo `/_astro/`, tức gãy im lặng ở đúng những trang có thư mục con. Gặp chunk
 * như vậy thì để nguyên file rời — insight đỏ lại còn hơn trang trắng.
 */
import { existsSync, readdirSync, readFileSync, rmSync, statSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { fileURLToPath } from "node:url";

/** Đúng ngưỡng `build.assetsInlineLimit` mặc định của Vite — thứ Astro dùng cho script .astro. */
const NGUONG = 4096;

const THE_SCRIPT = /<script type="module" src="(\/_astro\/[^"]+\.js)"><\/script>/g;

function walk(dir, out = []) {
  for (const name of readdirSync(dir)) {
    const p = join(dir, name);
    if (statSync(p).isDirectory()) walk(p, out);
    else out.push(p);
  }
  return out;
}

/** Trả về mã nguồn nếu chunk nhúng được, `null` nếu phải để nguyên file rời. */
function docChunk(root, href) {
  const path = join(root, href);
  if (!existsSync(path)) return null;

  const code = readFileSync(path, "utf8").trim();
  if (Buffer.byteLength(code) >= NGUONG) return null;

  /* Chunk còn phụ thuộc chunk khác — xem ghi chú đầu file. */
  if (/\bimport\s*[\s({*'"]/.test(code) || /\bexport\s*[{*]/.test(code)) return null;

  /* Một `</script` nằm trong chuỗi sẽ đóng sớm thẻ script và ném phần còn lại ra màn hình. */
  if (code.includes("</script")) return null;

  return code;
}

export default function inlinePageScript() {
  return {
    name: "inline-page-script",
    hooks: {
      "astro:build:done": ({ dir, logger }) => {
        const root = fileURLToPath(dir);
        const daNhung = new Map();
        const conTroToi = new Set();
        let soTrang = 0;

        for (const file of walk(root).filter((f) => f.endsWith(".html"))) {
          let doi = false;
          const html = readFileSync(file, "utf8").replace(THE_SCRIPT, (the, href) => {
            const code = daNhung.get(href) ?? docChunk(root, href);
            if (code == null) {
              conTroToi.add(href);
              return the;
            }
            daNhung.set(href, code);
            doi = true;
            return `<script type="module">${code}</script>`;
          });
          if (doi) {
            writeFileSync(file, html);
            soTrang++;
          }
        }

        /* Xoá file đã nhúng — nhưng chỉ khi KHÔNG còn trang nào trỏ tới nó, vì một chunk có
           thể nhúng được ở trang này mà không ở trang kia (ngưỡng đọc trên cùng một file nên
           thực tế là tất-cả-hoặc-không, nhưng đừng dựa vào điều đó). */
        for (const href of daNhung.keys()) {
          if (!conTroToi.has(href)) rmSync(join(root, href));
        }

        if (daNhung.size) {
          const ten = [...daNhung.keys()].join(", ");
          logger.info(`da nhung ${ten} vao ${soTrang} trang`);
        }
      },
    },
  };
}
