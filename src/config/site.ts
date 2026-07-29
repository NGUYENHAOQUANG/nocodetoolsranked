/**
 * Cấu hình cấp site — tên, mô tả, ngôn ngữ.
 *
 * KHÔNG khai domain ở đây. Domain là `site` trong `astro.config.mjs`; đọc lại
 * bằng `Astro.site` (trong file .astro) hoặc `import.meta.env.SITE` (trong
 * module .ts). Khai hai chỗ là hai nguồn sự thật và chắc chắn có ngày lệch.
 */

export const SITE = {
  name: "top10dogfood.com",
  /** Thẻ <title> mặc định khi trang không tự đặt */
  defaultTitle: "Top 10 Dog Food Subscriptions 2026",
  /** Mô tả mặc định. Bản cũ để chuỗi TIẾNG VIỆT trên site tiếng Anh và không
      trang nào override, nên cả 10 trang đều ship chuỗi đó — xem CLAUDE.md §6. */
  defaultDescription:
    "Compare the top 10 fresh dog food subscription services of 2026 — reviews, ratings, and exclusive offers, delivered to your door.",
  locale: "en_US",
  lang: "en",
} as const;
