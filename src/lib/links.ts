/**
 * NGUỒN DUY NHẤT dựng URL nội bộ.
 *
 * Trước đây đường dẫn được gõ tay ở tám nơi (Header.reviewLinks, Footer.links,
 * reviews.ts.readMoreHref, reviewPage.sidebarPartners/sidebarArticles,
 * mustReads, knowledge, ARTICLE_MAP). Giờ mọi href đi qua đây, nên đổi cấu trúc
 * URL là sửa MỘT chỗ.
 *
 * Mọi URL kết thúc bằng "/" (khớp trailingSlash: "always" trong astro.config).
 *
 * ⚠️ Site đã chạy thật thì URL ĐÓNG BĂNG — xem CLAUDE.md §7. Đổi về sau phải
 * kèm 301 ở tầng host và vẫn mất một phần thứ hạng.
 */

/** Trang chủ */
export const HOME = "/";

/** Danh sách review */
export const REVIEWS_INDEX = "/reviews/";

/** Trung tâm kiến thức */
export const KNOWLEDGE_INDEX = "/knowledge/";

/** Bài review của một brand. `brandId` = tên file .mdx không đuôi = khoá brand. */
export const reviewUrl = (brandId: string) => `/reviews/${brandId}/`;

/** Bài viết. `postId` = tên file .mdx không đuôi. */
export const postUrl = (postId: string) => `/knowledge/${postId}/`;

/** Các trang tĩnh */
export const STATIC_PAGES = {
  about: "/about/",
  contact: "/contact/",
  privacy: "/privacy-policy/",
  terms: "/terms-of-use/",
  disclosure: "/advertiser-disclosure/",
} as const;
