/**
 * Dựng JSON-LD.
 *
 * CỐ TÌNH chỉ làm ba loại an toàn: Organization, WebSite, BreadcrumbList, Article.
 *
 * KHÔNG phát Review/AggregateRating cho sản phẩm của bên thứ ba: Google cấm
 * "self-serving review markup" — tự đánh giá sản phẩm người khác rồi đánh dấu
 * schema để lấy sao trên kết quả tìm kiếm có thể bị phạt thủ công. Điểm số vẫn
 * hiển thị bình thường cho người đọc, chỉ là không khai báo dưới dạng schema.
 */
import { SITE } from "@/config/site";

/** Domain lấy thẳng từ khoá `site` của astro.config — module .ts không có `Astro.site`. */
const SITE_URL = import.meta.env.SITE;

const abs = (p: string) => new URL(p, SITE_URL).href;

export function organizationSchema() {
  return {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: SITE.name,
    url: SITE_URL,
  };
}

export function websiteSchema() {
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: SITE.name,
    url: SITE_URL,
  };
}

/** `crumbs` khớp đúng breadcrumb hiển thị trên trang */
export function breadcrumbSchema(crumbs: { text: string; href?: string }[]) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: crumbs.map((c, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: c.text,
      ...(c.href ? { item: abs(c.href) } : {}),
    })),
  };
}

export function articleSchema(opts: {
  title: string;
  description: string;
  url: string;
  image?: string;
  authorName: string;
  datePublished?: string;
}) {
  return {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: opts.title,
    description: opts.description,
    mainEntityOfPage: abs(opts.url),
    ...(opts.image ? { image: abs(opts.image) } : {}),
    author: { "@type": "Person", name: opts.authorName },
    publisher: { "@type": "Organization", name: SITE.name },
    ...(opts.datePublished ? { datePublished: opts.datePublished } : {}),
  };
}
