/**
 * Nối `placements` (xếp hạng theo trang) với `brands` (danh tính) thành đúng
 * shape mà các component đang nhận.
 *
 * Tồn tại để component KHÔNG phải tự đi lấy dữ liệu, và để đổi một link
 * affiliate chỉ còn là sửa một dòng trong `src/content/brands/<brand>.yaml`.
 *
 * Shape trả về cố tình giữ y hệt `src/data/*.ts` cũ, nên việc chuyển đổi chỉ
 * là đổi dòng import trong component — không đụng markup, không đổi props.
 */
import { getCollection, getEntry } from "astro:content";
import type { ImageMetadata } from "astro";
import { reviewUrl } from "@/lib/links";

export interface Brand {
  rank: number;
  name: string;
  logo: ImageMetadata;
  logoMobile?: ImageMetadata;
  logoAlt: string;
  tagline: string;
  taglineMobile: string;
  isTaglineMobileBold?: boolean;
  bullets: string[];
  bulletsMobile?: string[];
  coupon?: string;
  rating: string;
  ratingLabel: string;
  stars: number;
  reviews: string;
  href: string;
  isEditorsChoice?: boolean;
  hoverTooltip?: { highlight: string; text: string };
}

export interface ReviewEntry {
  logo: ImageMetadata;
  logoAlt: string;
  text: string;
  readMoreHref: string;
  rating: string;
  ratingLabel: string;
  stars: number;
  href: string;
  hasTrailingBlank?: boolean;
}

export interface SidebarPartner {
  logo: ImageMetadata;
  logoAlt: string;
  name: string;
  href: string;
}

export interface CarouselPartner {
  key: string;
  logo: ImageMetadata;
  logoAlt: string;
  promo: string;
  href: string;
}

/** Khoá brand từ một trường reference() (Astro trả về { collection, id }) */
function brandId(ref: unknown): string {
  return typeof ref === "string" ? ref : (ref as { id: string }).id;
}

/**
 * Đọc một file placement và trả về mảng `entries` đã kèm dữ liệu brand.
 *
 * Dùng getEntry("brands", id) tường minh chứ KHÔNG dùng getEntry(reference):
 * dạng sau trả về union của mọi collection nên TypeScript không thu hẹp được
 * kiểu, và mọi truy cập trường sau đó đều báo lỗi.
 */
async function loadPlacement(id: string) {
  const entry = await getEntry("placements", id);
  if (!entry) throw new Error(`Không tìm thấy placement "${id}"`);

  return Promise.all(
    entry.data.entries.map(async (row) => {
      const key = brandId((row as { brand: unknown }).brand);
      const brand = await getEntry("brands", key);
      if (!brand) throw new Error(`placement "${id}" trỏ tới brand không tồn tại: "${key}"`);
      return { row: row as Record<string, any>, key, brand: brand.data };
    }),
  );
}

/** Toplist trang chủ — 9 brand, thứ tự và điểm RIÊNG của trang chủ */
export async function getHomepageBrands(): Promise<Brand[]> {
  const rows = await loadPlacement("homepage");
  return rows.map(({ row, brand }) => ({
    rank: row.rank,
    name: brand.name,
    logo: brand.logo,
    ...(brand.logoMobile ? { logoMobile: brand.logoMobile } : {}),
    logoAlt: brand.logoAlt,
    tagline: row.tagline,
    taglineMobile: row.taglineMobile,
    ...(row.isTaglineMobileBold ? { isTaglineMobileBold: true } : {}),
    bullets: row.bullets,
    ...(row.bulletsMobile ? { bulletsMobile: row.bulletsMobile } : {}),
    ...(row.coupon ? { coupon: row.coupon } : {}),
    rating: row.rating,
    ratingLabel: row.ratingLabel,
    stars: row.stars,
    reviews: row.reviewsCount,
    href: brand.affiliateUrl,
    ...(row.isEditorsChoice ? { isEditorsChoice: true } : {}),
    ...(row.hoverTooltip ? { hoverTooltip: row.hoverTooltip } : {}),
  }));
}

/** Danh sách trang /reviews/ — 6 brand, thứ tự và điểm KHÁC trang chủ (có chủ ý) */
export async function getReviewsPageEntries(): Promise<ReviewEntry[]> {
  const rows = await loadPlacement("reviews-page");
  return rows.map(({ row, key, brand }) => ({
    logo: brand.logo,
    logoAlt: brand.logoAltShort!,
    text: row.excerpt,
    readMoreHref: reviewUrl(key),
    rating: row.rating,
    ratingLabel: row.ratingLabel,
    stars: row.stars,
    href: brand.affiliateUrl,
    ...(row.hasTrailingBlank ? { hasTrailingBlank: true } : {}),
  }));
}

/** Danh sách partner ở sidebar (logo + tên + link tới bài review) */
export async function getSidebarPartners(): Promise<SidebarPartner[]> {
  const rows = await loadPlacement("review-sidebar");
  return rows.map(({ key, brand }) => ({
    logo: brand.logo,
    logoAlt: brand.logoAltShort!,
    name: brand.sidebarName!,
    href: reviewUrl(key),
  }));
}

/** Ô carousel ở sidebar trang review (logo + promo + link affiliate) */
export async function getCarouselPartners(): Promise<CarouselPartner[]> {
  const rows = await loadPlacement("review-sidebar");
  return rows.map(({ key, brand }) => ({
    key,
    logo: brand.logo,
    logoAlt: brand.logoAltShort!,
    promo: brand.carouselPromo!,
    href: brand.affiliateUrl,
  }));
}

/** Logo + alt dạng ngắn, tra theo khoá brand — dùng cho thanh trên bài review */
export async function getPartnerLogos(): Promise<
  Record<string, { logo: ImageMetadata; logoAlt: string }>
> {
  const brands = await getCollection("brands");
  const out: Record<string, { logo: ImageMetadata; logoAlt: string }> = {};
  for (const b of brands) {
    if (b.data.logoAltShort) {
      out[b.id] = { logo: b.data.logo, logoAlt: b.data.logoAltShort };
    }
  }
  return out;
}

/**
 * Menu con "Reviews" ở header.
 *
 * Dùng `name` chứ KHÔNG dùng `sidebarName`: bản gốc ghi "Ollie" ở header nhưng
 * "Ollie " (có dấu cách cuối) ở sidebar. Hai trường khác nhau, không thay thế
 * được cho nhau — đây đúng là lý do brands giữ bốn biến thể tên riêng biệt.
 */
export async function getReviewNavLinks(): Promise<{ label: string; href: string }[]> {
  const rows = await loadPlacement("review-sidebar");
  return rows.map(({ key, brand }) => ({ label: brand.name, href: reviewUrl(key) }));
}
