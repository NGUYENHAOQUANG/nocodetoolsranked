/**
 * Điều hướng — cấu hình chứ không phải nội dung: đây là SƠ ĐỒ TRANG, đổi nó là
 * đổi cấu trúc site, khác với việc sửa một câu quảng cáo.
 *
 * Mọi href đi qua `lib/links.ts` nên đổi cấu trúc URL vẫn chỉ sửa một chỗ.
 */
import { HOME, REVIEWS_INDEX, KNOWLEDGE_INDEX, STATIC_PAGES } from "@/lib/links";

export interface NavLink {
  label: string;
  href: string;
}

/**
 * Hai mục cấp một của thanh điều hướng, dùng cho cả nav desktop lẫn drawer mobile.
 *
 * Để dạng object có khoá thay vì mảng: mục "Reviews" bung ra danh sách brand
 * (dựng từ collection qua `getReviewNavLinks`) còn mục kia thì không, nên markup
 * hai mục khác nhau thật. Mảng + cờ điều kiện sẽ dài hơn mà không rõ hơn.
 */
export const mainNav = {
  reviews: { label: "Reviews", href: REVIEWS_INDEX } satisfies NavLink,
  knowledge: { label: "Learn", href: KNOWLEDGE_INDEX } satisfies NavLink,
};

/** Danh sách link ở chân trang, đúng thứ tự hiển thị. */
export const footerLinks: NavLink[] = [
  { label: "Home", href: HOME },
  { label: "About Us", href: STATIC_PAGES.about },
  { label: "Reviews", href: REVIEWS_INDEX },
  { label: "Knowledge", href: KNOWLEDGE_INDEX },
  { label: "Terms of Use", href: STATIC_PAGES.terms },
  { label: "Privacy Policy", href: STATIC_PAGES.privacy },
  { label: "Advertiser Disclosure", href: STATIC_PAGES.disclosure },
  { label: "Contact Us", href: STATIC_PAGES.contact },
];
