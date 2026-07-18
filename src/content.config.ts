import { defineCollection, z } from "astro:content";
import { glob } from "astro/loaders";

/** Mỗi brand một file MDX → sinh ra một trang /<slug>/ qua src/pages/[slug].astro.
    Phần thân file là bài viết; TOC tự sinh từ chính các heading trong đó. */
const reviews = defineCollection({
  loader: glob({ pattern: "**/*.mdx", base: "./src/content/reviews" }),
  schema: z.object({
    /** Đường dẫn trang, vd "the-pets-table-review" */
    slug: z.string(),
    /** Thẻ <title> */
    title: z.string(),
    /** Tiêu đề hero ở MOBILE (<768px). Bản gốc để tên bài ở mobile nhưng lại
        là "Reviews" ở desktop — hai chuỗi khác hẳn nhau. */
    heroTitle: z.string(),
    /** Dòng khuyến mãi ở thanh trên cùng bài */
    promo: z.string(),
    /** Link affiliate cho nút "View Rates" (dùng chung cho cả thanh trên và carousel sidebar) */
    href: z.string(),
    author: z.object({
      name: z.string(),
      role: z.string(),
    }),
    pros: z.array(z.string()),
    cons: z.array(z.string()),
    /** Key logo trong `partnerLogos` (src/data/reviewPage.ts) — dùng cho carousel sidebar */
    partner: z.string(),
    /** Dòng chữ trong ô carousel sidebar (khác `promo` ở thanh trên) */
    carouselPromo: z.string(),
    /** Tên đối tác ở link cuối bài (vd "Ollie", "The Pets Table" — không dấu nháy) */
    articleLinkName: z.string(),
  }),
});

export const collections = { reviews };
