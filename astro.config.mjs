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
 *   markdown.processor       Sätteri là processor mặc định, và cả hai công tắc
 *                            từng phải chỉnh nay đều đúng ý sẵn: `gfm` mặc định
 *                            BẬT (giữ, để có bảng Markdown và footnote), còn
 *                            `smartPunctuation` mặc định TẮT (giữ, vì nội dung
 *                            chỉ dùng ASCII và không muốn build đổi glyph).
 *                            Hai khoá cũ `markdown.gfm` / `markdown.smartypants`
 *                            đã deprecated ở Astro 7.
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

  /** <Image> tự sinh srcset + sizes để điện thoại không phải tải ảnh cỡ desktop. */
  image: { layout: "constrained" },

  /** Site affiliate sống bằng cú nhấp: nạp trước trang đích khi rê chuột lên link. */
  prefetch: { prefetchAll: true },
});
