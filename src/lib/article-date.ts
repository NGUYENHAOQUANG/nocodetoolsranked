/**
 * Ngày trong frontmatter là Date thật để sắp xếp được và để JSON-LD phát
 * `datePublished` hợp lệ, nhưng hiển thị phải ra ĐÚNG dạng của bản gốc
 * ("Jan 1, 2026" - tháng viết tắt, không phải "January").
 *
 * `timeZone: "UTC"` là BẮT BUỘC: không có nó thì `2026-01-03T00:00:00Z` lùi về
 * ngày 2 ở mọi múi giờ âm, và ngày hiển thị lệch một hôm tuỳ máy build.
 */
const ARTICLE_DATE = new Intl.DateTimeFormat("en-US", {
  month: "short",
  day: "numeric",
  year: "numeric",
  timeZone: "UTC",
});

export const formatArticleDate = (date: Date): string => ARTICLE_DATE.format(date);

/** Dạng `YYYY-MM-DD` cho `datePublished` của JSON-LD. */
export const isoDate = (date: Date): string => date.toISOString().slice(0, 10);
