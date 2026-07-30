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
    "Compare the top 10 fresh dog food subscription services of 2026 - reviews, ratings, and exclusive offers, delivered to your door.",
  /**
   * Ảnh chia sẻ mặc định cho mọi trang (Open Graph / Twitter Card).
   *
   * Ở `public/` chứ KHÔNG phải `src/assets/`: Astro băm tên file trong
   * `src/assets/`, nên mỗi lần đổi ảnh là URL đổi theo — mà mạng xã hội CACHE
   * URL này. Link đã chia sẻ sẽ mất ảnh. `public/` giữ nguyên đường dẫn.
   *
   * 1200x630 là tỉ lệ Open Graph khuyến nghị (1.91:1). Khai `width`/`height`
   * cho Facebook dựng khung trước khi tải xong ảnh.
   *
   * ẢNH HIỆN TẠI LÀ ẢNH TẠM — dựng từ banner hero, đặt trên nền #eaf4fb. Thay
   * bằng ảnh thiết kế riêng: ghi đè `public/og-image.jpg`, không cần sửa code.
   */
  ogImage: { path: "/og-image.jpg", width: 1200, height: 630 },
  locale: "en_US",
  lang: "en",
} as const;
