// @ts-check
import { defineConfig } from "astro/config";

import mdx from "@astrojs/mdx";
import sitemap from "@astrojs/sitemap";
import { satteri } from "@astrojs/markdown-satteri";

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

  integrations: [mdx(), sitemap()],

  markdown: {
    /**
     * PHẢI khai `smartPunctuation: false` tường minh, không được bỏ khoá này.
     *
     * Sätteri (processor mặc định của Astro 7) để `smartPunctuation` mặc định
     * TẮT, nhưng `@astrojs/mdx` có mặc định RIÊNG là BẬT
     * (@astrojs/internal-helpers/dist/markdown.js: `smartypants: true`) và chỉ
     * kế thừa từ processor khi giá trị là boolean tường minh
     * (@astrojs/mdx/dist/index.js: `typeof features.smartPunctuation === "boolean"`).
     *
     * Bỏ khoá này thì file .md giữ nguyên ký tự còn file .mdx bị đổi nháy thẳng
     * thành nháy cong lúc build — đúng thứ quy ước "nội dung chỉ ASCII" cấm.
     *
     * `gfm` KHÔNG khai: mặc định BẬT, và đó là điều muốn (bảng Markdown,
     * footnote). URL trần trong nội dung bọc bằng {'...'} để không tự thành link.
     */
    processor: satteri({ features: { smartPunctuation: false } }),
  },

  /** <Image> tự sinh srcset + sizes để điện thoại không phải tải ảnh cỡ desktop. */
  image: { layout: "constrained" },

  /** Site affiliate sống bằng cú nhấp: nạp trước trang đích khi rê chuột lên link. */
  prefetch: { prefetchAll: true },
});
