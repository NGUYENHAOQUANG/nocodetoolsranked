// @ts-check
import { defineConfig } from "astro/config";

import mdx from "@astrojs/mdx";
import sitemap from "@astrojs/sitemap";

/**
 * Nguyên tắc: ưu tiên mặc định của Astro. Chỉ khai một khoá khi giá trị muốn
 * dùng KHÁC mặc định — khai lại đúng mặc định là rác, nó làm người đọc tưởng
 * đang có một quyết định trong khi không.
 *
 * Cố ý KHÔNG khai (đã đối chiếu mặc định trong node_modules của Astro 7.1.4):
 *
 *   build.format             mặc định 'directory', khớp sẵn với trailingSlash
 *   image.responsiveStyles   mặc định false, và phải giữ false: bật là chèn CSS
 *                            toàn cục cho [data-astro-image], đè lên kích thước
 *                            ảnh mà component tự canh
 *   prefetch.defaultStrategy mặc định 'hover'
 *   sitemap({ filter })      sitemap đã tự loại 404 và 500
 */
export default defineConfig({
  /** Bắt buộc để dựng canonical và sitemap. Không có `site` thì cả hai đều không chạy. */
  site: "https://top10dogfood.com",

  /**
   * Mọi URL của site kết thúc bằng "/", và mọi link nội bộ cũng viết kèm "/".
   * Lợi ích thật không nằm ở bản build mà ở lúc dev: link viết thiếu "/" sẽ 404
   * ngay tại local, thay vì chạy được ở máy rồi ăn 301 trên production.
   */
  trailingSlash: "always",

  /**
   * `smartypants: false` là BẮT BUỘC, không phải trang trí.
   *
   * `@astrojs/mdx` có mặc định RIÊNG là BẬT
   * (`@astrojs/internal-helpers/dist/markdown.js`: `smartypants: true`), khác
   * mặc định của processor. Bỏ khoá này thì build đổi nháy thẳng thành nháy
   * cong — đã đo: sinh 234 ký tự cong trong `dist/`, trong khi nguồn vẫn ASCII
   * nên nhìn source không thấy gì. Đúng thứ quy ước "nội dung chỉ ASCII" cấm.
   *
   * Khai ở ĐÂY chứ không qua `markdown.processor: satteri(...)`: cách kia phải
   * `import { satteri } from "@astrojs/markdown-satteri"`, mà gói đó KHÔNG có
   * trong package.json — nó chỉ tồn tại vì `astro` phụ thuộc nó. Import một gói
   * mình không khai là chạy nhờ, gãy lúc Astro đổi dependency nội bộ.
   * `@astrojs/mdx/dist/index.js` cho thấy option truyền thẳng cho `mdx()` THẮNG
   * processor, nên cách này vừa đủ vừa không nợ ai.
   *
   * Repo không có file `.md` nào (toàn `.mdx`) nên mặc định của processor
   * không ảnh hưởng gì.
   */
  integrations: [mdx({ smartypants: false }), sitemap()],

  /** <Image> tự sinh srcset + sizes để điện thoại không phải tải ảnh cỡ desktop. */
  image: { layout: "constrained" },

  /** Site affiliate sống bằng cú nhấp: nạp trước trang đích khi rê chuột lên link. */
  prefetch: { prefetchAll: true },
});
