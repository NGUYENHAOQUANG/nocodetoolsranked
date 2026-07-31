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
import { getEntry } from "astro:content";
import type { ImageMetadata } from "astro";
import { reviewUrl } from "@/lib/links";

export interface ToplistRow {
  rank: number;
  name: string;
  logo: ImageMetadata;
  logoMobile?: ImageMetadata;
  /** Creative banner dọc, chỉ brand nào có mới khai. */
  sideBanner?: ImageMetadata;
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
  reviewsCount: string;
  href: string;
  isEditorsChoice?: boolean;
  hoverTooltip?: { highlight: string; text: string };
}

export interface ReviewsPageRow {
  logo: ImageMetadata;
  logoAlt: string;
  text: string;
  readMoreHref: string;
  rating: string;
  ratingLabel: string;
  stars: number;
  href: string;
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
 * Gắn dữ liệu brand vào từng dòng của một file placement.
 *
 * Nhận thẳng mảng `entries` thay vì tên collection: ba collection placement có
 * ba kiểu dòng khác nhau, truyền mảng vào thì generic `R` giữ nguyên kiểu của
 * từng loại và nơi gọi không phải ép `any` như bản trước.
 *
 * Dùng getEntry("brands", id) tường minh chứ KHÔNG dùng getEntry(reference):
 * dạng sau trả về union của mọi collection nên TypeScript không thu hẹp được
 * kiểu, và mọi truy cập trường sau đó đều báo lỗi.
 */
async function withBrands<R extends { brand: unknown }>(entries: R[], source: string) {
  return Promise.all(
    entries.map(async (row) => {
      const key = brandId(row.brand);
      const brand = await getEntry("brands", key);
      if (!brand) throw new Error(`placement "${source}" trỏ tới brand không tồn tại: "${key}"`);
      return { row, key, brand: brand.data };
    }),
  );
}

/**
 * Đọc entry duy nhất của một collection placement.
 *
 * Ba hàm dưới gọi `getEntry` tường minh với tên collection dạng literal, KHÔNG
 * bọc qua một helper generic: nhận tên collection qua tham số generic thì
 * TypeScript gộp ba kiểu `data.entries` thành union và chỉ còn thấy trường
 * chung (`brand`), làm mất sạch kiểu vừa siết được ở schema.
 */
async function rowsOf<T>(entry: { data: { entries: T[] } } | undefined, id: string): Promise<T[]> {
  if (!entry) throw new Error(`Không tìm thấy placement "${id}"`);
  return entry.data.entries;
}

/**
 * Bảng xếp hạng của MỘT trang toplist.
 *
 * Nhận id chứ không khoá cứng "homepage": mỗi ngách là một file placement riêng,
 * cùng một brand xếp hạng khác nhau ở từng ngách. Trang chủ chỉ là ngách `home`.
 */
export async function getToplistBrands(placementId: string): Promise<ToplistRow[]> {
  const rows = await withBrands(
    await rowsOf(await getEntry("toplistPlacements", placementId), placementId),
    placementId,
  );
  return rows.map(({ row, brand }) => ({
    rank: row.rank,
    name: brand.name,
    logo: brand.logo,
    ...(brand.logoMobile ? { logoMobile: brand.logoMobile } : {}),
    ...(brand.sideBanner ? { sideBanner: brand.sideBanner } : {}),
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
    reviewsCount: row.reviewsCount,
    href: brand.affiliateUrl,
    ...(row.isEditorsChoice ? { isEditorsChoice: true } : {}),
    ...(row.hoverTooltip ? { hoverTooltip: row.hoverTooltip } : {}),
  }));
}

/** Danh sách trang /reviews/ — 6 brand, thứ tự và điểm KHÁC trang chủ (có chủ ý) */
export async function getReviewsPageEntries(): Promise<ReviewsPageRow[]> {
  const rows = await withBrands(
    await rowsOf(await getEntry("reviewsPagePlacements", "reviews-page"), "reviews-page"),
    "reviews-page",
  );
  return rows.map(({ row, key, brand }) => ({
    logo: brand.logo,
    logoAlt: brand.logoAltShort!,
    text: row.excerpt,
    readMoreHref: reviewUrl(key),
    rating: row.rating,
    ratingLabel: row.ratingLabel,
    stars: row.stars,
    href: brand.affiliateUrl,
  }));
}

/** Ba hàm dưới dùng chung một file thứ tự, gom lời gọi về đây cho khỏi lặp */
const sidebarRows = async () =>
  withBrands(await rowsOf(await getEntry("sidebarPlacements", "sidebar"), "sidebar"), "sidebar");

/** Danh sách partner ở sidebar (logo + tên + link tới bài review) */
export async function getSidebarPartners(): Promise<SidebarPartner[]> {
  const rows = await sidebarRows();
  return rows.map(({ key, brand }) => ({
    logo: brand.logo,
    logoAlt: brand.logoAltShort!,
    name: brand.sidebarName!,
    href: reviewUrl(key),
  }));
}

/** Ô carousel ở sidebar trang review (logo + promo + link affiliate) */
export async function getCarouselPartners(): Promise<CarouselPartner[]> {
  const rows = await sidebarRows();
  return rows.map(({ key, brand }) => ({
    key,
    logo: brand.logo,
    logoAlt: brand.logoAltShort!,
    promo: brand.carouselPromo!,
    href: brand.affiliateUrl,
  }));
}

/**
 * Menu con "Reviews" ở header.
 *
 * Dùng `name` chứ KHÔNG dùng `sidebarName`: bản gốc ghi "Ollie" ở header nhưng
 * "Ollie " (có dấu cách cuối) ở sidebar. Hai trường khác nhau, không thay thế
 * được cho nhau — đây đúng là lý do brands giữ bốn biến thể tên riêng biệt.
 */
export async function getReviewNavLinks(): Promise<{ label: string; href: string }[]> {
  const rows = await sidebarRows();
  return rows.map(({ key, brand }) => ({ label: brand.name, href: reviewUrl(key) }));
}
