/** Cấu hình cấp site — nguồn duy nhất cho tên, mô tả, thông tin mạng xã hội. */

export const SITE = {
  /** Phải khớp `site` trong astro.config.mjs */
  url: "https://top10dogfood.com",
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
