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

/** Bài viết trang chủ — MDX (prose markdown + <InlineCta/>). Để trong content/
    cho gọn cùng chỗ với các collection khác; hiện chỉ có 1 bài. */
const articles = defineCollection({
  loader: glob({ pattern: "**/*.mdx", base: "./src/content/articles" }),
  schema: z.object({ title: z.string() }),
});

/** Bài blog (vd /understanding-fresh-pet-food.../ và /fresh-vs-freeze-dried.../).
    Thân MDX = prose + 1 ảnh; TOC lấy từ chính các heading h3 trong thân. */
const blog = defineCollection({
  loader: glob({ pattern: "**/*.mdx", base: "./src/content/blog" }),
  schema: z.object({
    title: z.string(),
    /** Tiêu đề hero bản MOBILE (<768px) — bản gốc chèn <br> CỨNG để ngắt 2 dòng
        cân đối (vd "Why Fresh Food Is<br>The Best For Dogs?"). Không đặt thì dùng
        `title` và để tự wrap. HTML thô (có <br>) → render bằng set:html. */
    heroMobileTitle: z.string().optional(),
    /** Ngày đăng hiển thị, vd "Jan 1, 2026" */
    date: z.string(),
    /** Thời lượng đọc, vd "6 min read" */
    readTime: z.string(),
    author: z.object({ name: z.string(), role: z.string() }),
    /** Key ảnh đại diện tác giả (xem AVATARS trong BlogPost). Mặc định steve-diller. */
    avatar: z.enum(["steve-diller", "peri-elgrot"]).default("steve-diller"),
    /** 2 key bài "must reads" ở sidebar (xem ARTICLE_MAP trong BlogSidebar).
        Mặc định [healthy-pet-food, why-fresh-food]; bài nào TỰ là must-read thì
        đổi để không trỏ về chính nó. */
    sidebarArticles: z
      .array(z.enum(["healthy-pet-food", "why-fresh-food", "alternatives"]))
      .default(["healthy-pet-food", "why-fresh-food"]),
  }),
});

export const collections = { reviews, articles, blog };
