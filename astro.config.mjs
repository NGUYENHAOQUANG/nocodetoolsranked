// @ts-check
import { defineConfig } from "astro/config";

import mdx from "@astrojs/mdx";

// https://astro.build/config
export default defineConfig({
  /** Bắt buộc để dựng canonical và sitemap. Không có `site` thì cả hai đều không chạy. */
  site: "https://top10dogfood.com",

  /** Mọi URL của site kết thúc bằng "/" — khai rõ để build và dev không lệch nhau. */
  trailingSlash: "always",

  integrations: [mdx()],

  markdown: {
    // TẮT: nội dung lấy từ trang gốc vốn đã có sẵn ’ và —. Để bật thì remark sẽ
    // đổi nháy/gạch ngang thêm một lần nữa và làm lệch pixel so với bản gốc.
    smartypants: false,
  },
});
