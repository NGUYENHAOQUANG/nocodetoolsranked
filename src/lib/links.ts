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
  contact: "/contact/",
  privacy: "/privacy-policy/",
  terms: "/terms-of-use/",
  disclosure: "/advertiser-disclosure/",
} as const;

/* ---------------------------------------------------------------------------
   `rel` cho link RA NGOÀI — khai một chỗ, mọi component dùng lại.

   Trước đây chín component tự gõ chuỗi `rel` và tất cả đều thiếu `sponsored`.
   Gõ tay ở chín chỗ thì chỉ cần một chỗ sai là rò, mà không có gì báo.
   --------------------------------------------------------------------------- */

/**
 * Link affiliate — mọi link kiếm tiền phải dùng cái này.
 *
 * - `sponsored`: token Google chỉ định cho link trả tiền / affiliate. Thiếu nó
 *   là khai sai bản chất link, và Google có thể coi là mua bán liên kết.
 * - `nofollow`: không truyền PageRank.
 * - `noopener`: chặn trang đích chạm `window.opener`. Trình duyệt hiện đại tự
 *   ngầm định khi có target="_blank", giữ lại cho bản cũ.
 */
export const AFFILIATE_REL = "nofollow sponsored noopener";

/** Link ra ngoài KHÔNG phải affiliate (vd chính sách của Google ở form liên hệ) */
export const EXTERNAL_REL = "noopener";
