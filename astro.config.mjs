// @ts-check
import { defineConfig, fontProviders } from "astro/config";

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

  /**
   * Font qua `astro:fonts` thay vì tự khai `@font-face`.
   *
   * Lý do chính là `optimizedFallbacks` (mặc định BẬT): Astro dùng capsize sinh
   * `size-adjust` / `ascent-override` cho font dự phòng, nên lúc `font-display:
   * swap` đổi font thì chữ KHÔNG nhảy — và nó không tốn byte mạng nào vì dùng
   * font có sẵn trong máy, khác với `preload` vốn giành băng thông với ảnh LCP.
   *
   * Hai provider, mỗi cái có lý do ĐO ĐƯỢC:
   *
   * - Lato -> `local()`. File trong repo đã GỠ HINTING (thiếu bảng `cvt `,
   *   `fpgm`, `prep`) nên nhỏ hơn bản Google Fonts 40%: 13.7 KB so với 23.0 KB,
   *   mà đường nét vẽ Y HỆT (đã so 24 chữ mẫu: 0 chữ khác), cùng 215 ký tự,
   *   cùng version 1.104. Dùng `google()` ở đây là nặng thêm 27 KB để lấy lại
   *   hinting — thứ DirectWrite và macOS gần như không dùng tới.
   *
   * - Poppins -> `google()`. Đã so SHA-256: hai file cũ TRÙNG TỪNG BYTE với bản
   *   Google Fonts phục vụ, nên tải về giống hệt mà bỏ được file khỏi repo.
   *   Astro tải lúc BUILD rồi tự host — trình duyệt không gọi ra Google.
   *
   * `fallbacks` khai lại đúng stack hệ thống của `--font-base` để chuỗi font
   * cuối cùng không đổi so với trước.
   */
  fonts: [
    {
      provider: fontProviders.local(),
      name: "Lato",
      cssVariable: "--font-brand",
      fallbacks: ["Segoe UI", "Helvetica Neue", "Arial", "Noto Sans", "sans-serif"],
      options: {
        variants: [
          { weight: 400, style: "normal", src: ["./src/assets/fonts/lato-400.woff2"] },
          { weight: 700, style: "normal", src: ["./src/assets/fonts/lato-700.woff2"] },
          { weight: 900, style: "normal", src: ["./src/assets/fonts/lato-900.woff2"] },
        ],
      },
    },
    {
      provider: fontProviders.google(),
      name: "Poppins",
      cssVariable: "--font-popup",
      weights: [400, 500],
      styles: ["normal"],
      subsets: ["latin"],
      fallbacks: ["sans-serif"],
    },
  ],

  /** <Image> tự sinh srcset + sizes để điện thoại không phải tải ảnh cỡ desktop. */
  image: { layout: "constrained" },

  /** Site affiliate sống bằng cú nhấp: nạp trước trang đích khi rê chuột lên link. */
  prefetch: { prefetchAll: true },
});
