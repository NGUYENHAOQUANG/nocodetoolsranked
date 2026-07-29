import { defineCollection, reference } from "astro:content";
import { glob } from "astro/loaders";
import { z } from "astro/zod";

/* ===========================================================================
   Nguyên tắc: TÁCH "đối tượng là ai" khỏi "nó xuất hiện thế nào ở trang nào".

   - `brands`     — danh tính đối tác, khai MỘT LẦN. Link affiliate ở đây và
                    chỉ ở đây.
   - `placements` — brand đó được xếp hạng ra sao ở từng trang. Trang chủ và
                    /reviews/ có thứ tự + điểm KHÁC NHAU; đó là chủ ý của bản
                    gốc, và mô hình này diễn đạt nó tường minh thay vì bằng
                    hai bản sao dữ liệu tình cờ lệch nhau.

   Xem CLAUDE.md §8.4.
   =========================================================================== */

/** Danh tính đối tác. Bốn biến thể tên KHÔNG suy ra được từ nhau — bản gốc có
    dấu cách đôi và dấu cách cuối cố ý, nên mỗi biến thể là một trường riêng. */
const brands = defineCollection({
  loader: glob({ pattern: "**/*.yaml", base: "./src/content/brands" }),
  schema: ({ image }) =>
    z.object({
      /** Tên chuẩn, vd "The Pet's Table", "Fresh Pet" (hai từ) */
      name: z.string(),
      logo: image(),
      /** Chỉ khai khi bản mobile khác desktop (Fresh Pet, The Honest Kitchen) */
      logoMobile: image().optional(),
      /** Dạng dài: "X Official Logo | Fresh Dog Food Delivery" — toplist trang chủ */
      logoAlt: z.string(),
      /** Dạng ngắn: "X logo" — sidebar, carousel, card /reviews/ */
      logoAltShort: z.string().optional(),
      /** Tên ở sidebar — vài brand có dấu cách CUỐI của bản gốc (vd "Ollie ") */
      sidebarName: z.string().optional(),
      /** Tên ở link cuối bài review — khác cả hai trên (vd "Freshpet" một từ) */
      articleLinkName: z.string().optional(),
      /** NGUỒN DUY NHẤT của link affiliate. Mọi nơi khác tham chiếu tới đây. */
      affiliateUrl: z.string(),
      /** Dòng chữ trong ô carousel sidebar */
      carouselPromo: z.string().optional(),
    }),
});

/** Một dòng trong bảng xếp hạng trang chủ */
const homepageRow = z.object({
  brand: reference("brands"),
  rank: z.number(),
  /** Chuỗi để giữ đúng "8.0"; vòng điểm dùng giá trị này tính phần trăm */
  rating: z.string(),
  ratingLabel: z.string(),
  /** 0–5 bước 0.5. KHÔNG suy ra được từ rating (8.7 và 7.8 cùng 4 sao, 7.7 lại 3.5) */
  stars: z.number(),
  reviewsCount: z.string(),
  /** Render với white-space: pre-line nên dấu cách đầu/cuối được giữ nguyên */
  tagline: z.string(),
  taglineMobile: z.string(),
  isTaglineMobileBold: z.boolean().default(false),
  bullets: z.array(z.string()),
  bulletsMobile: z.array(z.string()).optional(),
  coupon: z.string().optional(),
  /** Card #1: viền cyan + nhãn "Exclusive Offer" + icon sao góc phải */
  isEditorsChoice: z.boolean().default(false),
  hoverTooltip: z.object({ highlight: z.string(), text: z.string() }).optional(),
});

/** Một dòng trong danh sách /reviews/ */
const reviewsPageRow = z.object({
  brand: reference("brands"),
  rating: z.string(),
  ratingLabel: z.string(),
  stars: z.number(),
  /** Đoạn mở đầu thân bài review. Nâng lên đây thay vì bóc từ MDX: chuỗi chứa
      ’ và — phải sống sót byte-exact dưới smartypants:false. */
  excerpt: z.string(),
});

/**
 * BA collection riêng, KHÔNG gộp làm một.
 *
 * Bản trước gộp cả ba vào một collection `placements` với
 * `z.union([homepageRow, reviewsPageRow, z.object({ brand })])`. Biến thể thứ ba
 * bắt được mọi thứ có `brand`, nên gõ sai một tên trường (vd `rankk`) sẽ khiến
 * dòng đó trượt hai biến thể đầu, khớp biến thể ba, và Zod strip sạch các trường
 * còn lại — dữ liệu biến mất ÂM THẦM lúc chạy thay vì lỗi build. Đúng ngược lại
 * điều mà schema sinh ra để làm.
 *
 * Tách ra thì mỗi file có đúng một schema chặt, và `loadPlacement` không còn phải
 * ép kiểu `Record<string, any>`.
 *
 * Cả ba file vẫn ở chung `src/content/placements/` vì chúng cùng một khái niệm;
 * `pattern` trỏ đích danh từng file.
 */
const homepagePlacement = defineCollection({
  loader: glob({ pattern: "homepage.yaml", base: "./src/content/placements" }),
  schema: z.object({ entries: z.array(homepageRow) }),
});

const reviewsPagePlacement = defineCollection({
  loader: glob({ pattern: "reviews-page.yaml", base: "./src/content/placements" }),
  schema: z.object({ entries: z.array(reviewsPageRow) }),
});

/** Sidebar trang review: chỉ còn THỨ TỰ, mọi thứ khác lấy từ `brands` */
const sidebarPlacement = defineCollection({
  loader: glob({ pattern: "review-sidebar.yaml", base: "./src/content/placements" }),
  schema: z.object({ entries: z.array(z.object({ brand: reference("brands") })) }),
});

/** Tác giả. Bài review dùng avatar SVG dùng chung, bài blog dùng PNG riêng —
    một trường `avatar` phục vụ được cả hai. */
const authors = defineCollection({
  loader: glob({ pattern: "**/*.yaml", base: "./src/content/authors" }),
  schema: ({ image }) =>
    z.object({
      name: z.string(),
      role: z.string(),
      avatar: image(),
    }),
});

/** Bài review từng brand — MDX. Thân bài là nội dung; TOC tự sinh từ heading.

    Logo, alt, tên hiển thị, link affiliate và promo carousel KHÔNG khai ở đây —
    tất cả lấy từ `brand`. Đó là lớp trùng lặp cuối cùng đã được xoá. */
const reviews = defineCollection({
  loader: glob({ pattern: "**/*.mdx", base: "./src/content/reviews" }),
  schema: z.object({
    /** Thẻ <title> */
    title: z.string(),
    /** Tiêu đề hero bản MOBILE. Desktop luôn ghi "Reviews" — hai chuỗi khác hẳn nhau. */
    heroTitle: z.string(),
    /** Dòng khuyến mãi ở thanh trên cùng bài */
    promo: z.string(),
    /** Đối tác của bài. Gõ sai = lỗi build. */
    brand: reference("brands"),
    author: reference("authors"),
    pros: z.array(z.string()),
    cons: z.array(z.string()),
  }),
});

/**
 * Trang nội dung phẳng: about, terms, privacy, advertiser disclosure.
 *
 * id file = slug URL, không khai `slug` trong frontmatter. Route sinh ở
 * `src/pages/[page].astro`.
 */
const pages = defineCollection({
  loader: glob({ pattern: "**/*.mdx", base: "./src/content/pages" }),
  schema: z.object({
    /** Thẻ <title>. BỐN chuỗi này lệch quy luật của nhau ở bản gốc (trang
        privacy đảo vế, trang about thiếu chữ "10" và dùng nhãn khác hero) nên
        KHÔNG sinh máy được từ `heroTitle` — phải là dữ liệu. */
    title: z.string(),
    /** Nhãn ở banner đầu trang, đồng thời là mốc cuối của breadcrumb */
    heroTitle: z.string(),
    /** Chỉ khai khi bản mobile khác desktop. Render bằng set:html nên chèn được <br>. */
    heroMobileTitle: z.string().optional(),
    /** Bỏ trống thì dùng SITE.defaultDescription */
    description: z.string().optional(),
    /**
     * Tiêu đề mục trông thế nào.
     *
     * Bản gốc dựng bốn trang này từ HAI template CMS khác nhau: ba trang có tiêu
     * đề mục nổi bật (15px/700), riêng `terms-of-use` để tiêu đề mục cùng cỡ và
     * cùng độ đậm với thân bài, chỉ phân biệt bằng CHỮ IN HOA. Giữ khác biệt đó
     * thay vì ép về một kiểu — ép sẽ làm trang terms dài thêm khoảng 130px.
     */
    headingStyle: z.enum(["plain", "distinct"]).default("distinct"),
  }),
});

/** Bài viết trang chủ — MDX (prose + <InlineCta/>). */
const sections = defineCollection({
  loader: glob({ pattern: "**/*.mdx", base: "./src/content/sections" }),
  schema: z.object({ title: z.string() }),
});

/** Bài blog. Thân MDX = prose + ảnh; TOC lấy từ heading trong thân.

    Gộp về đây dữ liệu vốn nằm rải ở SÁU nơi: frontmatter, knowledge.ts,
    mustReads.ts, reviewPage.sidebarArticles, ARTICLE_MAP hardcode trong
    PostSidebar.astro, và các chuỗi alt sinh theo 5 quy ước khác nhau. */
const posts = defineCollection({
  loader: glob({ pattern: "**/*.mdx", base: "./src/content/posts" }),
  schema: ({ image }) =>
    z.object({
      title: z.string(),
      /** Tiêu đề hero bản MOBILE — bản gốc chèn <br> CỨNG để ngắt 2 dòng cân đối.
          Không đặt thì dùng `title`. HTML thô → render bằng set:html. */
      heroMobileTitle: z.string().optional(),
      date: z.string(),
      readTime: z.string(),
      author: reference("authors"),
      /** Trích đoạn ~115 ký tự + "..." cho lưới /knowledge/. Điểm cắt là tuỳ ý
          của bản gốc — giữ nguyên văn, KHÔNG sinh lại bằng máy. */
      excerpt: z.string(),
      /** Trích đoạn dài hơn (1–2 câu đủ) cho sidebar "Must Reads" */
      excerptLong: z.string().optional(),
      /** BỐN ảnh KHÁC NHAU cho cùng một bài ở bốn vị trí — chính là lý do dữ
          liệu bị tách ra nhiều nơi trong bản cũ. Lưu ý `reviewSidebar` của bài
          "a-detailed-look…" trỏ ảnh must-reads-fresh-food.jpg: tréo tên nhưng
          là quirk CỐ Ý của bản gốc. */
      images: z.object({
        /** Lưới /knowledge/ */
        card: image(),
        /** Sidebar "Must Reads" trang chủ */
        mustRead: image().optional(),
        /** Sidebar trang review */
        reviewSidebar: image().optional(),
        /** Sidebar bài viết */
        blogSidebar: image().optional(),
      }),
      /** 2 bài gợi ý ở sidebar. Bài nào TỰ là must-read thì trỏ bài khác để
          không tự trỏ về chính nó. reference() nên gõ sai = lỗi build. */
      relatedPosts: z.array(reference("posts")),
    }),
});

/** FAQ trang chủ — `answer` là chuỗi HTML (bản gốc có <strong>) → set:html */
const faq = defineCollection({
  loader: glob({ pattern: "**/*.yaml", base: "./src/content/faq" }),
  schema: z.object({
    items: z.array(z.object({ question: z.string(), answer: z.string() })),
  }),
});

/** Thẻ liên hệ trang /contact/. Tách riêng khỏi mini-reviews: gộp chung một
    collection thì mọi trường phải optional và mất sạch tác dụng validate. */
const contactCards = defineCollection({
  loader: glob({ pattern: "**/*.yaml", base: "./src/content/contact-cards" }),
  schema: ({ image }) =>
    z.object({
      cards: z.array(
        z.object({
          image: image(),
          title: z.string(),
          subtitle: z.string(),
          button: z.string(),
        }),
      ),
    }),
});

/** Đánh giá chi tiết brand hạng 1 ở trang chủ. Logo/điểm/sao/link lấy từ
    placements + brands; file này chỉ giữ nội dung riêng của section. */
const miniReviews = defineCollection({
  loader: glob({ pattern: "**/*.yaml", base: "./src/content/mini-reviews" }),
  schema: ({ image }) =>
    z.object({
      brand: reference("brands"),
      categories: z.array(
        z.object({
          title: z.string(),
          icon: image(),
          /** 0–10; quyết định màu ô điểm (≥9 xanh, ≥7 vàng, còn lại xám) */
          score: z.number(),
          description: z.string(),
        }),
      ),
      pros: z.array(z.string()),
      cons: z.array(z.string()),
      /** Chỉ hiện dưới 768px, trong drawer "Summary" */
      summary: z.string(),
    }),
});

export const collections = {
  brands,
  homepagePlacement,
  reviewsPagePlacement,
  sidebarPlacement,
  authors,
  reviews,
  sections,
  pages,
  posts,
  faq,
  contactCards,
  miniReviews,
};
